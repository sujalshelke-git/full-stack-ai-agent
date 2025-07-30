import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // ✅ Step 1: Fetch the ticket
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId).populate("createdBy");
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // ✅ Step 2: Set initial status to TODO
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      // ✅ Step 3: AI Analysis
      const aiResponse = await analyzeTicket(ticket);

      // ✅ Step 4: Update ticket with AI suggestions
      const relatedskills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: ["low", "medium", "high"].includes(aiResponse.priority)
              ? aiResponse.priority
              : "medium",
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        }
        return skills;
      });

      // ✅ Step 5: Assign a moderator or fallback to admin
      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: { $elemMatch: { $regex: relatedskills.join("|"), $options: "i" } },
        });

        if (!user) {
          user = await User.findOne({ role: "admin" });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        return user;
      });

      // ✅ Step 6: Send email to assigned moderator
      await step.run("send-email-notification", async () => {
        if (moderator && moderator.email) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.email,
            "🎫 New Ticket Assigned",
            `You have been assigned a ticket: ${finalTicket.title}`
          );
        }
      });

      return { success: true };
    } catch (err) {
      console.error("❌ Error running the step", err.message);
      return { success: false };
    }
  }
);


// import { inngest } from "../client.js";
// import Ticket from "../../models/ticket.js";
// import User from "../../models/user.js";
// import { NonRetriableError } from "inngest";
// import { sendMail } from "../../utils/mailer.js";
// import analyzeTicket from "../../utils/ai.js";

// export const onTicketCreated = inngest.createFunction(
//   { id: "on-ticket-created", retries: 2 },
//   { event: "ticket/created" },
//   async ({ event, step }) => {
//     try {
//       const { ticketId } = event.data;
//       console.log("🚀 Ticket event received:", ticketId);

//       // ✅ Step 1: Fetch the ticket
//       const ticket = await step.run("fetch-ticket", async () => {
//         const ticketObject = await Ticket.findById(ticketId).populate("createdBy");
//         if (!ticketObject) {
//           throw new NonRetriableError("Ticket not found");
//         }
//         return ticketObject;
//       });

//       // ✅ Step 2: Optional: Set initial status to TODO (can be skipped if not needed)
//       // await step.run("update-ticket-status", async () => {
//       //   await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
//       // });

//       // ✅ Step 3: AI Analysis
//       let aiResponse = null;
//       try {
//         aiResponse = await analyzeTicket(ticket);
//       } catch (err) {
//         console.warn("⚠️ AI analysis failed:", err.message);
//       }

//       // ✅ Step 4: Update ticket with AI suggestions
//       const relatedskills = await step.run("ai-processing", async () => {
//         let skills = [];
//         if (aiResponse) {
//           const priority = ["low", "medium", "high"].includes(aiResponse.priority)
//             ? aiResponse.priority
//             : "medium";

//           await Ticket.findByIdAndUpdate(ticket._id, {
//             priority,
//             helpfulNotes: aiResponse.helpfulNotes || "",
//             status: "IN_PROGRESS",
//             relatedSkills: aiResponse.relatedSkills || [],
//           });

//           skills = aiResponse.relatedSkills || [];
//         }
//         return skills;
//       });

//       // ✅ Step 5: Assign a moderator or fallback to admin
//       const moderator = await step.run("assign-moderator", async () => {
//         let user = null;

//         if (relatedskills.length > 0) {
//           const skillPattern = relatedskills.join("|");
//           user = await User.findOne({
//             role: "moderator",
//             skills: { $elemMatch: { $regex: skillPattern, $options: "i" } },
//           });
//         }

//         if (!user) {
//           user = await User.findOne({ role: "admin" });
//         }

//         await Ticket.findByIdAndUpdate(ticket._id, {
//           assignedTo: user?._id || null,
//         });

//         console.log("✅ Ticket assigned to:", user?.email || "No moderator found");
//         return user;
//       });

//       // ✅ Step 6: Send email to assigned moderator
//       await step.run("send-email-notification", async () => {
//         if (moderator?.email) {
//           try {
//             const finalTicket = await Ticket.findById(ticket._id);
//             await sendMail(
//               moderator.email,
//               "🎫 New Ticket Assigned",
//               `You have been assigned a ticket: ${finalTicket.title}`
//             );
//             console.log("📧 Email sent to:", moderator.email);
//           } catch (err) {
//             console.error("❌ Email failed:", err.message);
//           }
//         }
//       });

//       return { success: true };
//     } catch (err) {
//       console.error("❌ Error running the function:", err.message);
//       return { success: false };
//     }
//   }
// );
