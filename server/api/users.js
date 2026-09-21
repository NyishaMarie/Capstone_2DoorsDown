import express from "express";
const router = express.Router();
export default router;

import { getUserById } from "#db/queries/users.js";
import { getToolsByOwnerId } from "#db/queries/tools.js";
import { getUserById, updateUserBio } from "#db/queries/users.js";
import { requireUser } from "#middleware/auth.js";

// PATCH /users/me — change your own bio
// "me" instead of an id, so there's no way to edit somebody else

router.patch("/me", requireUser, async (req, res) => {
  const { bio } = req.body;
  const user = await updateUserBio(req.user.id, bio);
  res.send(user);
});

// GET /users/:id — public profile. No login required to view a neighbor's
// profile, same as tool detail pages are public.

router.get("/:id", async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // getUserById returns raw snake_case columns; reshape to match the
    // camelCase contract the rest of the API already uses (see tools.js).
    const tools = await getToolsByOwnerId(user.id);

    res.json({
      id: user.id,
      fullName: user.full_name,
      neighborhood: user.neighborhood,
      bio: user.bio,
      tools,
    });
  } catch (err) {
    next(err);
  }
});