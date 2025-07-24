import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

// ✅ Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all tickets (for user or admin)
export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role !== "user") {
      // Admin: get all tickets
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .populate("createdBy", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      // User: only their tickets
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", ["email", "_id"])
        .populate("createdBy", ["email", "_id"])
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get a single ticket by ID (user/admin)
export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      // Admin: can access any ticket
      ticket = await Ticket.findById(req.params.id)
        .populate("assignedTo", ["email", "_id"])
        .populate("createdBy", ["email", "_id"]);
    } else {
      // User: can only access their own ticket
      ticket = await Ticket.findOne({
        _id: req.params.id,
        createdBy: user._id,
      })
        .populate("assignedTo", ["email", "_id"])
        .populate("createdBy", ["email", "_id"]);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete a ticket (with Inngest logging)
export const deleteTicket = async (req, res) => {
  try {
    const user = req.user;

    // Only allow deleting tickets created by the user
    const ticket = await Ticket.findOneAndDelete({
      _id: req.params.id,
      createdBy: user._id,
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ message: "Ticket not found or unauthorized" });
    }

    // ✅ Send delete event to Inngest
    await inngest.send({
      name: "ticket/deleted",
      data: {
        ticketId: ticket._id.toString(),
        title: ticket.title,
        description: ticket.description,
        deletedAt: new Date().toISOString(),
        deletedBy: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
      },
    });

    return res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Update a ticket (optional, kept commented if unused)
// export const updateTicket = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, status, assignedTo } = req.body;

//     if (!title || !description || !status) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const updatedTicket = await Ticket.findByIdAndUpdate(
//       id,
//       { title, description, status, assignedTo },
//       { new: true }
//     );

//     if (!updatedTicket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     return res.status(200).json({
//       message: "Ticket updated successfully",
//       ticket: updatedTicket,
//     });
//   } catch (error) {
//     console.error("Error updating ticket", error.message);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
