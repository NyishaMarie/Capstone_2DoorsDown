import express from "express";
const router = express.Router();
export default router;

import authRouter from "#api/auth.js";
import toolsRouter from "#api/tools.js";



// TODO - Nyisha N-12: import borrowsRouter from "#api/borrows.js";

// TODO - Priscilla P-14: import usersRouter from "#api/users.js";



// GET /api/health — no auth, no database
//  hit this first whenever something looks broken. If it answers, the server is up.

router.get("/health", (req, res) => {
    res.send({ ok: true, service: "toolshed-api" });
});

router.use("/auth", authRouter);
router.use("/tools", toolsRouter);

// borrows mounts at the root so it can own /tools/:id/borrows


// TODO - Nyisha N-12: router.use("/", borrowsRouter);

// TODO - Priscilla P-14: router.use("/users", usersRouter);