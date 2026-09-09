import { describe, it, expect } from "vitest";
import "dotenv/config";
import { createToken, verifyToken } from "../utils/jwt.js";

describe("jwt utilities", () => {
    it("puts a payload in and gets the same payload back", () => {
        const token = createToken({ id: 1 });
        const payload = verifyToken(token);
        expect(payload.id).toBe(1);
    });

    it("refuses a token that has been tampered with", () => {
        const token = createToken({ id: 1 });
        expect(() => verifyToken(token + "x")).toThrow();
    });
});