// server/db/queries/tools.js
import db from '../client.js';

const TOOL_COLUMNS = `
  tools.id,
  tools.name,
  tools.description,
  tools.category,
  tools.condition,
  tools.photo_url AS "photoUrl",
  tools.owner_id AS "ownerId",
  users.full_name AS "ownerName",
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

async function getTools({ category, availableOnly } = {}) {
  const conditions = [];
  const values = [];

  if (category) {
    values.push(category);
    conditions.push(`tools.category = $${values.length}`);
  }

  if (availableOnly) {
    conditions.push(`NOT EXISTS (
      SELECT 1 FROM borrows
      WHERE borrows.tool_id = tools.id
        AND borrows.returned_at IS NULL
    )`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT ${TOOL_COLUMNS}
     FROM tools
     JOIN users ON users.id = tools.owner_id
     ${whereClause}
     ORDER BY tools.created_at DESC`,
    values
  );

  return rows;
}

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

export { getTools, getToolById };