import bcrypt from "bcrypt"; // ✅ fixed typo: brcypt ➝ bcrypt
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

// ✅ SIGNUP
export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10); // ✅ added await
    const user = await User.create({ email, password: hashed, skills });

    // Fire Inngest event
    await inngest.send({
      name: "user/signup",
      data: {
        email,
      },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // ✅ added await
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password); // ✅ use bcrypt

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return res.status(401).json({ error: "Unauthorized" });
    });

    res.json({ message: "Logout successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message }); // ✅ fixed error label
  }
};

// ✅ UPDATE USER (Admin Only)
export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;

  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" }); // ✅ fixed typo: "eeor" ➝ "error"
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    await User.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );

    return res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

// ✅ GET USERS (Admin Only)
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Fetch users failed", details: error.message }); // ✅ clearer error message
  }
};
