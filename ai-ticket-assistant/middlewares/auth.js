import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔐 Check if Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🔍 Decode and verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧠 Attach user info to the request object
    req.user = decoded;

    next(); // ✅ Continue to next middleware/route handler
  } catch (error) {
    console.error("JWT Error:", error.message); // Useful for debugging
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
