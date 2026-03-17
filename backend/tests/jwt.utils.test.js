import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { generateToken } from "../utils/jwt.utils.js";

test("generateToken includes user id and role claims", () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";

    const token = generateToken({ _id: "507f1f77bcf86cd799439011", role: "student" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    assert.equal(decoded.id, "507f1f77bcf86cd799439011");
    assert.equal(decoded.role, "student");
});
