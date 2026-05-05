import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const SECRET = JWT_SECRET || "fallback_secret_for_development_only";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const signToken = (payload: TokenPayload) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};
