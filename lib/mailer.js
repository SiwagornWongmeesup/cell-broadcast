import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,   // ใส่อีเมลใน .env
    pass: process.env.GMAIL_PASS,   // ใส่ App Password ใน .env
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text, html });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
