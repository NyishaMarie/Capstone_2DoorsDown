import db from "#db/client.js";
import bcrypt from "bcrypt";

// this function creates a new user. The password is hashed before it is stored

export async function createUser({email, password, full_name, neighborhood, bio}) {
    const sql = `
    INSERT INTO users
        (email, password, full_name, neighborhood, bio)
    VALUES
        ($1, $2, $3, $4, $5)
    RETURNING *
    `;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows: [user] } = await db.query(sql, [
        email.trim().toLowerCase(),
        hashedPassword,
        full_name,
        neighborhood,
        bio,
    ]);

    delete user.password;
    return user;
}

// returns the user if the email and password match, otherwise it's null

export async function getUserByEmailAndPassword(email, password) {
    const sql = `
    SELECT *
    FROM users
    WHERE email = $1
    `;

    const { rows: [user] } = await db.query(sql, [email.trim().toLowerCase()]);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    delete user.password;
    return user;
}

// returns the user with the given id

export async function getUserById(id) {
    const sql = `
    SELECT *
    FROM users
    WHERE id = $1
    `;

    const { rows: [user] } = await db.query(sql, [id]);

    if (user) delete user.password;
    return user;
}