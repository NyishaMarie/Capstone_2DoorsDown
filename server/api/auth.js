import express from "express";
const router = express.Router();
export default router;

import { createUser, getUserByEmailAndPassword } from "#db/queries/users.js";
import { createToken } from "#utils/jwt.js";
import { requireUser } from "#middleware/auth.js";

// POST /auth/register — makes the account and logs them straight in

router.post("/register", async (req, res) => {
    const { email, password, fullName, neighborhood } = req.body;

    if (!email?.trim() || !password || !fullName?.trim() || !neighborhood?.trim()) {
        return res
        .status(400)
        .send("Email, password, full name, and neighborhood are all required.");
    }

    if (password.length < 8) {
        return res.status(400).send("Password must be at least 8 characters.");
    }

    const user = await createUser({
        email,
        password,
        full_name: fullName,
        neighborhood,
    });

    res.status(201).send({ token: createToken({ id: user.id }), user });
});

// POST /auth/login — checks the password, hands back a token 

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    const user = await getUserByEmailAndPassword(email, password);
    if (!user) {
        return res.status(401).send("Invalid email or password.");
    }

    res.send({ token: createToken({ id: user.id }), user });
});

// GET /auth/me — who am I? requireUser blocks this without a token

router.get("/me", requireUser, (req, res) => {
    res.send(req.user);
});