import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ticketing-system",
  name: "AI Ticket App", // Optional: Just a readable name
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
