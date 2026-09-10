//this file server/app.js is for the Express application. It builds the API, export default app. It sets up the main app, middleware, and routes.

import express from "express";
const app = express();
export default app;

import cors from "cors";
import apiRouter from "#api/index.js";
import { getUserFromToken } from "#middleware/auth.js";

// order matters. CORS first or the browser rejects the response

app.use(cors({ origin: process.env.CORS_ORIGIN }));

// reads the JSON body so req.body exists before any route uses it

app.use(express.json());

// runs on every request. Attaches req.user when a valid token was sent

app.use(getUserFromToken);

app.use("/api", apiRouter);

// TODO - Nyisha N-05: Postgres error handler goes here, before the catch-all.

// anything that reaches here is a real bug on our side

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Sorry! Something went wrong.");
});