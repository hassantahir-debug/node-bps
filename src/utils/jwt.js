import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in the environment variables.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export { generateToken, verifyToken };
