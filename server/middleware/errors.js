export function handlePostgresErrors(err, req, res, next) {
switch (err.code) {
    case "22P02":
        return res.status(400).json({ error: "That id has to be a number." });

    case "23505":
        return res.status(400).json({ error: "Email already registered" });

    case "23503":
        return res.status(400).json({ error: "That user or tool does not exist." });

    case "23514":
      switch (err.constraint) {
        case "tools_category_check":
            return res.status(400).json({ error: "That is not one of our categories." });
        case "tools_condition_check":
            return res.status(400).json({ error: "That is not one of our condition options." });
        case "borrows_due_after_checkout":
            return res.status(400).json({ error: "The due date has to be today or later." });
        default:
            return res.status(400).json({ error: "Some of that information isn't allowed." });
      }

    default:
        return next(err);
    }
}