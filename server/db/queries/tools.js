
import db from '../client.js';

// isAvailable and dueAt aren't columns on the tools table, instead they are in the borrows table. 
// This is a subquery, a query in another query. We show relation through this: borrows.tool_id = tool.id
// returned_at IS NULL (meaning: checked out and
// not yet given back). If no such row exists, the tool is available.
const TOOL_COLUMNS = `
  tools.id,
  tools.name,
  tools.description,
  tools.category,
  tools.condition,
  tools.owner_id AS "ownerId",
  users.full_name AS "ownerName",
  users.neighborhood AS "ownerNeighborhood",
  NOT EXISTS (
    SELECT 1 FROM borrows
    WHERE borrows.tool_id = tools.id
      AND borrows.returned_at IS NULL
  ) AS "isAvailable",
  (
    SELECT due_at FROM borrows
    WHERE borrows.tool_id = tools.id
      AND borrows.returned_at IS NULL
  ) AS "dueAt"
`;
 
// These include both filters, just one, just the other or neither. 
async function getTools({ category, availableOnly } = {}) {
  const availableCondition = `NOT EXISTS (
    SELECT 1 FROM borrows
    WHERE borrows.tool_id = tools.id
      AND borrows.returned_at IS NULL
  )`;

  let sqlFilter = '';
  let values = [];

  if (category && availableOnly) {
    sqlFilter = `WHERE tools.category = $1 AND ${availableCondition}`;
    values = [category];
  } else if (category) {
    sqlFilter = `WHERE tools.category = $1`;
    values = [category];
  } else if (availableOnly) {
    sqlFilter = `WHERE ${availableCondition}`;
  }
 

  const { rows } = await db.query(
    `SELECT ${TOOL_COLUMNS}
     FROM tools
     JOIN users ON users.id = tools.owner_id
     ${sqlFilter}
     ORDER BY tools.created_at DESC`,
    values
  );

  return rows;
}

// GET /tools/:id — one tool. rows[0] is either the matching row or
// undefined; `|| null` turns "not found" into a plain null instead of
// undefined, which is easier for the route to check with an if statement.
async function getToolById(id) {
  const { rows } = await db.query(
    `SELECT ${TOOL_COLUMNS}
     FROM tools
     JOIN users ON users.id = tools.owner_id
     WHERE tools.id = $1`,
    [id]
  );

  return rows[0] || null;
}

// This is how a logged-in neighbor sees their own listings, including
// ones that are currently out on loan.
async function getToolsByOwnerId(ownerId) {
  const { rows } = await db.query(
    `SELECT ${TOOL_COLUMNS}
     FROM tools
     JOIN users ON users.id = tools.owner_id
     WHERE tools.owner_id = $1
     ORDER BY tools.created_at DESC`,
    [ownerId]
  );

  return rows;
}


async function createTool({ owner_id, name, description, category, condition, photo_url }) {
  const {
    // db.query always returns { rows: [...] }. INSERT ... RETURNING only
    // ever gives back one row (the one we just created), so we destructure
    // straight down to that single row and call it `tool`.
    rows: [tool],
  } = await db.query(
    `INSERT INTO tools
       (owner_id, name, description, category, condition, photo_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING
       id,
       owner_id AS "ownerId",
       name,
       description,
       category,
       condition,
       created_at AS "createdAt"`,
    [owner_id, name, description, category, condition, photo_url || null]
  );

  return tool;
}

// COALESCE($1, name) reads as "use $1, unless $1 is NULL, in which case
// keep whatever `name` already is in the row." The pg driver turns a JS
// `undefined` into SQL NULL when it's sent as a parameter. 

async function updateTool(id, { name, description, category, condition, photo_url }) {
  const {
    rows: [tool],
  } = await db.query(
    `UPDATE tools
     SET
       name        = COALESCE($1, name),
       description = COALESCE($2, description),
       category    = COALESCE($3, category),
       condition   = COALESCE($4, condition),
       photo_url   = COALESCE($5, photo_url)
     WHERE id = $6
     RETURNING
       id,
       owner_id AS "ownerId",
       name,
       description,
       category,
       condition,
       photo_url AS "photoUrl",
       created_at AS "createdAt"`,
    [name, description, category, condition, photo_url, id]
  );

  return tool;
}


async function deleteTool(id) {
  await db.query(`DELETE FROM tools WHERE id = $1`, [id]);
}

// Before deleting a tool, the route needs to know if it's
// currently lent out. This runs the same "is there an open borrow"
// check that TOOL_COLUMNS uses for isAvailable, but as its own yes/no
// function instead of a column, since the route needs to check it
// *before* running the DELETE, not as part of displaying a tool.

async function hasActiveBorrow(toolId) {
  const { rows } = await db.query(
    `SELECT 1 FROM borrows
     WHERE tool_id = $1 AND returned_at IS NULL`,
    [toolId]
  );

  return rows.length > 0;
}

export {
  getTools,
  getToolById,
  getToolsByOwnerId,
  createTool,
  updateTool,
  deleteTool,
  hasActiveBorrow,
};