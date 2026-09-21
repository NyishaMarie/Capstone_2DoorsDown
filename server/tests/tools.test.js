import { describe, it, expect, beforeAll } from "vitest";
import "dotenv/config";
import request from "supertest";
import app from "../app.js";
import db from "#db/client.js";
import { createToken } from "#utils/jwt.js";

// Looked up dynamically instead of hardcoded ids, since ids depend on
// insert order in db/seed.js and could shift if the seed changes.
let sarah, parker, circularSaw;

beforeAll(async () => {
  const {
    rows: [sarahRow],
  } = await db.query(`SELECT id FROM users WHERE email = $1`, [
    "sarah@toolshed.dev",
  ]);
  sarah = sarahRow;

  const {
    rows: [parkerRow],
  } = await db.query(`SELECT id FROM users WHERE email = $1`, [
    "parker@toolshed.dev",
  ]);
  parker = parkerRow;

  // Circular Saw is owned by Sarah and has an active (not yet returned)
  // borrow from db/seed.js's buildBorrows — tool index 0 is one of the
  // 6 tools seeded as currently checked out.
  const {
    rows: [toolRow],
  } = await db.query(`SELECT id, owner_id AS "ownerId" FROM tools WHERE name = $1`, [
    "Circular Saw",
  ]);
  circularSaw = toolRow;
});

describe("GET /api/tools", () => {
  it("returns the full catalog", async () => {
    const res = await request(app).get("/api/tools");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("filters the catalog by category", async () => {
    const res = await request(app).get("/api/tools?category=ladder");

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const tool of res.body) {
      expect(tool.category).toBe("ladder");
    }
  });

  // P-04
  it("filters the catalog to available tools only", async () => {
    const res = await request(app).get("/api/tools?available=true");

    expect(res.status).toBe(200);
    for (const tool of res.body) {
      expect(tool.isAvailable).toBe(true);
    }
  });

  // P-04
  it("applies the category and availability filters together", async () => {
    const res = await request(app).get(
      "/api/tools?category=power&available=true"
    );

    expect(res.status).toBe(200);
    for (const tool of res.body) {
      expect(tool.category).toBe("power");
      expect(tool.isAvailable).toBe(true);
    }
  });
});

describe("POST /api/tools", () => {
  it("rejects creating a tool without a token", async () => {
    const res = await request(app).post("/api/tools").send({
      name: "Test Drill",
      description: "A tool created during a test run.",
      category: "power",
      condition: "good",
    });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/tools/:id", () => {
  it("rejects editing a tool you do not own", async () => {
    // Parker doesn't own Circular Saw — Sarah does.
    const token = createToken({ id: parker.id });

    const res = await request(app)
      .patch(`/api/tools/${circularSaw.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Hacked Name" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/tools/:id", () => {
  // P-09 (409)
  it("rejects deleting a tool that is currently borrowed", async () => {
    const token = createToken({ id: sarah.id });

    const res = await request(app)
      .delete(`/api/tools/${circularSaw.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
  });
});