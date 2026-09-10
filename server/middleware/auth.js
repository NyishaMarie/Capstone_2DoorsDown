import { verifyToken } from "#utils/jwt.js";
import { getUserById } from "#db/queries/users.js";

// getUserFromToken runs on every request in app.js and it never sends a response 
// every path ends in next(). No token? next. Garbage token? next. Deleted user? next. 
// It only ever adds information; it never blocks.

export async function getUserFromToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
        const { id } = verifyToken(token);
        req.user = await getUserById(id);
    } catch {
    }

    next();
}

// requireUser goes on individual routes that need a login, 
// and it's the only one that can stop a request with a 401
// so it blocks the request when nobody is logged in

export function requireUser(req, res, next) {
    if (!req.user) {
        return res.status(401).send("You must be logged in to do that.");
    }
    next();
}