import jwt from "jsonwebtoken";

// the password our server signs tokens with. Lives in .env locally. 

const SECRET = process.env.JWT_SECRET;

// this function creates a token and then stamps the payload with our secret 
// and returns a long string (the token) that can be sent to the client. 
// The client can then send it back to us in a header, and we can verify it.
// It expires in 7 days, so the user has to log in again. 

export function createToken(payload) {

  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// extracts the payload from a token 

export function verifyToken(token) {

//this is the reverse process. It makes sure the stamp is real and hasn't expired. 

  return jwt.verify(token, SECRET);
}

// defense answer: this proves the token came from our server and anyone can read what's inside a JWT, 
// so we only put the user's id in it, never a password. The secret is what stops someone from creating one themselves.