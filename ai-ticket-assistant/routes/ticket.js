import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createTicket,
  getTicket,
  getTickets,
  // updateTicket, // Uncomment if you implement it
} from "../controllers/ticket.js";

const router = express.Router();

// 🔐 All routes are protected by 'authenticate' middleware
router.post("/", authenticate, createTicket);        // ✅ Create new ticket
router.get("/", authenticate, getTickets);           // ✅ Get all tickets for user/admin
router.get("/:id", authenticate, getTicket);         // ✅ Get ticket by ID
// router.put("/:id", authenticate, updateTicket);    // ⬅️ Optional: Update ticket endpoint

export default router;
