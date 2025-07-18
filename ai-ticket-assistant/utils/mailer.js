import nodemailer from 'nodemailer'

export const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        secure: false, // true for 465, false for other ports
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: "maddison53@ethereal.email",
            pass: "jn7jnAPss4f63QBp6D",
  },
});
        const info = await transporter.sendMail({
        from: '"Inngest TMS',
        to,
        subject,
        text, // plain‑text body
        html: "<b>Hello world?</b>", // HTML body
  });
  console.log("message sent:", info.messageId);
  return info
    } catch (error) {
        console.log("❌ Mail Error", error.message)
        throw error;
        
    }
}