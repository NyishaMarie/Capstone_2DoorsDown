import { describe, it, expect } from "vitest";
import "dotenv/config";
import request from "supertest";
import app from "../app.js";

// a fresh email every run, so the second run doesn't trip over the account
// the first run made. Date.now() is milliseconds, it never repeats
const email = `test-${Date.now()}@toolshed.dev`;

const newUser = {
    email,
    password: "password123",
    fullName: "First Last",
    neighborhood: "Riverside",
};

describe("POST /api/auth/register", () => {
    it("creates a new user and returns a token", async () => {
        const res = await request(app).post("/api/auth/register").send(newUser);

        expect(res.status).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.user.email).toBe(email);
    });

    // Postgres raises 23505 and the error
    // middleware turns it into a sentence instead of a 500
    it("rejects a second account with the same email", async () => {
        const res = await request(app).post("/api/auth/register").send(newUser);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Email already registered");
    });

    it("rejects a register with a missing field", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "nofields@toolshed.dev",
            password: "password123",
    });

        expect(res.status).toBe(400);
    });

    it("rejects a password shorter than 8 characters", async () => {
        const res = await request(app).post("/api/auth/register").send({
            ...newUser,
            email: `short-${Date.now()}@toolshed.dev`,
            password: "short",
        });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/login", () => {
    it("rejects a login with the wrong password", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "sarah@toolshed.dev",
            password: "wrongpassword",
        });

        expect(res.status).toBe(401);
    });
});

describe("GET /api/auth/me", () => {
    it("rejects /auth/me when no token is sent", async () => {
        const res = await request(app).get("/api/auth/me");

        expect(res.status).toBe(401);
    });
});