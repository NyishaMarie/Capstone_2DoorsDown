import express from "express";
const router = express.Router();
export default router;

import authRouter from "#api/auth.js";
import toolsRouter from "#api/tools.js";
import usersRouter from "#api/users.js";
import borrowsRouter from "#api/borrows.js";

// GET /api/health — no auth, no database
//  hit this first whenever something looks broken. If it answers, the server is up.

router.get("/health", (req, res) => {
    res.send({ ok: true, service: "toolshed-api" });
});

router.use("/auth", authRouter);
router.use("/tools", toolsRouter);
router.use("/users", usersRouter);

// borrows mounts at the root so it can own /tools/:id/borrows

router.use("/", borrowsRouter);