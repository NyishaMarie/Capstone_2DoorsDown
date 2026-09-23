// borrowing and returning. N-12 is the borrow route, N-13 and N-14 come next

import express from "express";
const router = express.Router();
export default router;

import { requireUser } from "#middleware/auth.js";
import { getToolById } from "#db/queries/tools.js";
import { createBorrow, getActiveBorrowByToolId, getBorrowById, returnBorrow, getBorrowsByBorrowerId, getBorrowsByOwnerId} from "#db/queries/borrows.js";

// POST /tools/:id/borrows — borrow a tool
// three guards, and the order they run in 

router.post("/tools/:id/borrows", requireUser, async (req, res) => {
    const { dueAt } = req.body;

    if (!dueAt) {
        return res.status(400).json({ error: "A due date is required." });
    }

    // getTime is NaN when the string wasn't a real date, and NaN fails every
    // comparison, so without that check a typo would sail through to the insert
    const due = new Date(dueAt);
    if (Number.isNaN(due.getTime()) || due <= new Date()) {
        return res.status(400).json({ error: "The due date must be in the future." });
    }

    // guard 1 — does the tool even exist
    const tool = await getToolById(req.params.id);
    if (!tool) {
        return res.status(404).json({ error: "That tool does not exist." });
    }

    // guard 2 — runs before guard 3 on purpose
    // your own tool that's also checked out is a 403, not a 409
    if (tool.ownerId === req.user.id) {
        return res.status(403).json({ error: "You cannot borrow your own tool." });
    }

    // guard 3 — somebody else already has it
    const active = await getActiveBorrowByToolId(req.params.id);
    if (active) {
        return res.status(409).json({ error: "That tool is already checked out." });
    }

    const borrow = await createBorrow({
        tool_id: req.params.id,
        borrower_id: req.user.id,
        due_at: due,
    });

    res.status(201).send(borrow);
});

// GET /borrows/mine — everything I've borrowed from other people

router.get("/borrows/mine", requireUser, async (req, res) => {
    const borrows = await getBorrowsByBorrowerId(req.user.id);
    res.send({ borrows });
});

// GET /borrows/lent — borrows on tools I own
// this is the one that My Toolshed page needs

router.get("/borrows/lent", requireUser, async (req, res) => {
    const borrows = await getBorrowsByOwnerId(req.user.id);
    res.send({ borrows });
});

// PATCH /borrows/:id/return — mark a borrow returned

router.patch("/borrows/:id/return", requireUser, async (req, res) => {
    const borrow = await getBorrowById(req.params.id);

    if (!borrow) {
        return res.status(404).json({ error: "That borrow does not exist." });
    }

    // two people are allowed here, not one
    // the borrower or the owner can do this
    // either one can mark it returned 
    const isBorrower = borrow.borrowerId === req.user.id;
    const isOwner = borrow.ownerId === req.user.id;

    if (!isBorrower && !isOwner) {
        return res.status(403).json({
            error: "Only the borrower or the tool's owner can mark this returned.",
        });
    }

    if (borrow.returnedAt) {
        return res.status(409).json({ error: "That borrow was already returned." });
    }

    const updated = await returnBorrow(req.params.id);
    res.send(updated);
});