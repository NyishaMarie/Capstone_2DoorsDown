import { describe, it, expect, beforeAll } from "vitest";
import "dotenv/config";
import request from "supertest";
import app from "../app.js";
import db from "#db/client.js";
import { createToken } from "#utils/jwt.js";

// ids come from the seed, so look them up by name instead of hardcoding
let nicholas, parker, alison, ladder;

// the borrows these tests create, passed from one test to the next
let borrowId;
let secondBorrowId;

const dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

beforeAll(async () => {
    const { rows: users } = await db.query(
        `SELECT id, email FROM users WHERE email = ANY($1)`,
        [["nicholas@toolshed.dev", "parker@toolshed.dev", "alison@toolshed.dev"]]
    );

    nicholas = users.find(u => u.email === "nicholas@toolshed.dev");
    parker = users.find(u => u.email === "parker@toolshed.dev");
    alison = users.find(u => u.email === "alison@toolshed.dev");

    // Extension Ladder is owned by Nicholas and has no unreturned borrow in
    // the seed, so it starts these tests available
    const { rows: [tool] } = await db.query(
        `SELECT id FROM tools WHERE name = $1`,
        ["Extension Ladder"]
    );
    ladder = tool;
});

describe("POST /api/tools/:id/borrows", () => {
    it("rejects borrowing a tool that does not exist", async () => {
        const res = await request(app)
            .post("/api/tools/999999/borrows")
            .set("Authorization", `Bearer ${createToken({ id: parker.id })}`)
            .send({ dueAt });

        expect(res.status).toBe(404);
    });

    it("rejects a due date in the past", async () => {
        const res = await request(app)
            .post(`/api/tools/${ladder.id}/borrows`)
            .set("Authorization", `Bearer ${createToken({ id: parker.id })}`)
            .send({ dueAt: pastDate });

        expect(res.status).toBe(400);
    });

    it("creates a borrow and marks the tool unavailable", async () => {
        const res = await request(app)
            .post(`/api/tools/${ladder.id}/borrows`)
            .set("Authorization", `Bearer ${createToken({ id: parker.id })}`)
            .send({ dueAt });

        expect(res.status).toBe(201);
        expect(res.body.borrowerId).toBe(parker.id);
        borrowId = res.body.id;

        // nothing updated a column, the NOT EXISTS subquery just sees the new row
        const check = await request(app).get(`/api/tools/${ladder.id}`);
        expect(check.body.isAvailable).toBe(false);
    });

    it("rejects borrowing a tool that is already checked out", async () => {
        const res = await request(app)
            .post(`/api/tools/${ladder.id}/borrows`)
            .set("Authorization", `Bearer ${createToken({ id: alison.id })}`)
            .send({ dueAt });

        expect(res.status).toBe(409);
    });

    it("rejects borrowing your own tool", async () => {
        // the ladder is Nicholas's AND currently out, so both guard 2 and guard 3
        // would fire. 403 proves guard 2 runs first, which is the contract
        const res = await request(app)
            .post(`/api/tools/${ladder.id}/borrows`)
            .set("Authorization", `Bearer ${createToken({ id: nicholas.id })}`)
            .send({ dueAt });

        expect(res.status).toBe(403);
    });
});

describe("PATCH /api/borrows/:id/return", () => {
    it("rejects a third person marking a borrow returned", async () => {
        // Alison is neither the borrower nor the owner
        const res = await request(app)
            .patch(`/api/borrows/${borrowId}/return`)
            .set("Authorization", `Bearer ${createToken({ id: alison.id })}`);

        expect(res.status).toBe(403);
    });

    it("lets the borrower mark a borrow returned", async () => {
        const res = await request(app)
            .patch(`/api/borrows/${borrowId}/return`)
            .set("Authorization", `Bearer ${createToken({ id: parker.id })}`);

        expect(res.status).toBe(200);
        expect(res.body.returnedAt).toBeTruthy();
    });

    it("rejects returning a borrow that is already returned", async () => {
        const res = await request(app)
            .patch(`/api/borrows/${borrowId}/return`)
            .set("Authorization", `Bearer ${createToken({ id: parker.id })}`);

        expect(res.status).toBe(409);
    });

    it("shows the tool as available again in the catalog", async () => {
        const res = await request(app).get("/api/tools?available=true");

        const ids = res.body.map(tool => tool.id);
        expect(ids).toContain(ladder.id);
    });

    it("lets the tool owner mark a borrow returned", async () => {
        // a fresh borrow, because the last one is already back
        const borrow = await request(app)
            .post(`/api/tools/${ladder.id}/borrows`)
            .set("Authorization", `Bearer ${createToken({ id: alison.id })}`)
            .send({ dueAt });

        secondBorrowId = borrow.body.id;

        // Nicholas owns the ladder but didn't borrow it, and he's still allowed
        const res = await request(app)
            .patch(`/api/borrows/${secondBorrowId}/return`)
            .set("Authorization", `Bearer ${createToken({ id: nicholas.id })}`);

        expect(res.status).toBe(200);
    });
});