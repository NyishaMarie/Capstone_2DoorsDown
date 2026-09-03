DROP TABLE IF EXISTS borrows;
DROP TABLE IF EXISTS tools;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tools (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('power', 'hand', 'garden', 'automotive', 'ladder', 'outdoor', 'other')),
    condition TEXT NOT NULL CHECK (condition IN ('likeNew', 'good', 'fair', 'wellLoved')),
    photo_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
 );

 CREATE TABLE borrows (
    id             SERIAL PRIMARY KEY,
    tool_id        INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    borrower_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checked_out_at TIMESTAMP NOT NULL DEFAULT NOW(),
    due_at         TIMESTAMP NOT NULL,
    returned_at    TIMESTAMP,
    CONSTRAINT borrows_returned_after_checkout CHECK (returned_at IS NULL OR returned_at >= checked_out_at),
    CONSTRAINT borrows_due_after_checkout CHECK (due_at >= checked_out_at)
 );

 