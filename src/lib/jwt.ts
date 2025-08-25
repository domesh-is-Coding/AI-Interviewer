import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyJwt(token: string) : {
    userId: string;
    email: string;
}| null {
  try {
    console.log("token in verifyJwt:", token, "& JWT_SECRET", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log({decoded})
    return decoded;
  } catch(error) {
    console.log({error})
    return null;
  }
}
