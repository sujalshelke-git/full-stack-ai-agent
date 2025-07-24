import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createTicket,
  getTicket,
  getTickets,
  deleteTicket, // ✅ New: Delete controller
  // updateTicket,
} from "../controllers/ticket.js";

const router = express.Router();

// 🔐 All routes are protected by 'authenticate' middleware
router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.delete("/:id", authenticate, deleteTicket); // ✅ New: Delete ticket route
// router.put("/:id", authenticate, updateTicket);

export default router;
