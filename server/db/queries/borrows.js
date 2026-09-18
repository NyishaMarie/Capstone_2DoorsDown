// all the SQL about borrows. six functions, N-11

import db from '../client.js';

// every function returns this same shape so BorrowRow works everywhere
// isOverdue is figured out in SQL so React never does date math

const BORROW_COLUMNS = `
    borrows.id,
    borrows.tool_id AS "toolId",
    tools.name AS "toolName",
    tools.photo_url AS "toolPhotoUrl",
    borrows.borrower_id AS "borrowerId",
    borrower.full_name AS "borrowerName",
    tools.owner_id AS "ownerId",
    owner.full_name AS "ownerName",
    owner.neighborhood AS "ownerNeighborhood",
    borrows.checked_out_at AS "checkedOutAt",
    borrows.due_at AS "dueAt",
    borrows.returned_at AS "returnedAt",
    (borrows.returned_at IS NULL AND borrows.due_at < NOW()) AS "isOverdue"
`;

// we need the users table twice, once for each person, so it gets two names

const BORROW_JOINS = `
    FROM borrows
    JOIN tools ON tools.id = borrows.tool_id
    JOIN users AS borrower ON borrower.id = borrows.borrower_id
    JOIN users AS owner ON owner.id = tools.owner_id
`;

// the seed passes checked_out_at and returned_at, the borrow route doesn't
// so those two get defaults and the route only has to send a due date
export async function createBorrow({
    tool_id,
    borrower_id,
    due_at,
    checked_out_at = new Date(),
    returned_at = null,
}) {
    const sql = `
    INSERT INTO borrows (tool_id, borrower_id, checked_out_at, due_at, returned_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `;

    const { rows: [row] } = await db.query(sql, [
        tool_id, borrower_id, checked_out_at, due_at, returned_at,
    ]);

  // Returning would only give us the borrows columns, no tool or user names
  // so we read it straight back and get the full shape
    return getBorrowById(row.id);
}

export async function getBorrowById(id) {
    const sql = `
    SELECT ${BORROW_COLUMNS}
    ${BORROW_JOINS}
    WHERE borrows.id = $1
    `;

    const { rows: [borrow] } = await db.query(sql, [id]);
    return borrow || null;
}

// the 409 guard on borrowing. null here means the tool is free
export async function getActiveBorrowByToolId(toolId) {
    const sql = `
    SELECT ${BORROW_COLUMNS}
    ${BORROW_JOINS}
    WHERE borrows.tool_id = $1
        AND borrows.returned_at IS NULL
    `;

    const { rows: [borrow] } = await db.query(sql, [toolId]);
    return borrow || null;
}

// everything this person has borrowed, for /borrows/mine
// still-out ones first, then newest
export async function getBorrowsByBorrowerId(borrowerId) {
    const sql = `
    SELECT ${BORROW_COLUMNS}
    ${BORROW_JOINS}
    WHERE borrows.borrower_id = $1
    ORDER BY (borrows.returned_at IS NULL) DESC, borrows.checked_out_at DESC
    `;

    const { rows } = await db.query(sql, [borrowerId]);
    return rows;
}

// borrows on tools this person owns, for /borrows/lent
// same shape and order, we just filter on the other side
export async function getBorrowsByOwnerId(ownerId) {
    const sql = `
    SELECT ${BORROW_COLUMNS}
    ${BORROW_JOINS}
    WHERE tools.owner_id = $1
    ORDER BY (borrows.returned_at IS NULL) DESC, borrows.checked_out_at DESC
    `;

    const { rows } = await db.query(sql, [ownerId]);
    return rows;
}

// stamps the return time, then reads the row back so the caller gets the full shape
export async function returnBorrow(id) {
    const sql = `
    UPDATE borrows
    SET returned_at = NOW()
    WHERE id = $1
    RETURNING id
    `;

    const { rows: [row] } = await db.query(sql, [id]);
    if (!row) return null;

    return getBorrowById(row.id);
}