import { verifyToken } from "../utils/jwt.js";

const checkToken = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export { checkToken };
