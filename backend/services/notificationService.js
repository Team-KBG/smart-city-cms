const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

async function sendEmail(to, subject, html) {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.log(`📧 Email (dev mode) → ${to}: ${subject}`);
    return { success: true, mode: "dev" };
  }

  await mailTransporter.sendMail({
    from: `"Smart City CMS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return { success: true, mode: "sent" };
}

async function notifyComplaintRegistered(complaint) {
  if (!complaint.citizenEmail) return;

  const html = `
    <h2>Complaint Registered Successfully</h2>
    <p>Your complaint <strong>${complaint.complaintId}</strong> has been registered.</p>
    <p><strong>Title:</strong> ${complaint.title}</p>
    <p><strong>Category:</strong> ${complaint.category}</p>
    <p><strong>Status:</strong> ${complaint.status}</p>
    <p>Track your complaint anytime using your Complaint ID.</p>
  `;

  return sendEmail(complaint.citizenEmail, "Complaint Registered - Smart City CMS", html);
}

async function notifyStatusUpdated(complaint, oldStatus) {
  if (!complaint.citizenEmail) return;

  const html = `
    <h2>Complaint Status Updated</h2>
    <p>Complaint <strong>${complaint.complaintId}</strong> status changed from <strong>${oldStatus}</strong> to <strong>${complaint.status}</strong>.</p>
    <p><strong>Title:</strong> ${complaint.title}</p>
    ${complaint.department ? `<p><strong>Assigned Department:</strong> ${complaint.department}</p>` : ""}
  `;

  return sendEmail(complaint.citizenEmail, "Complaint Status Updated - Smart City CMS", html);
}

async function notifyComplaintResolved(complaint) {
  if (!complaint.citizenEmail) return;

  const html = `
    <h2>Complaint Resolved</h2>
    <p>Great news! Your complaint <strong>${complaint.complaintId}</strong> has been resolved.</p>
    <p><strong>Title:</strong> ${complaint.title}</p>
    <p>Thank you for helping improve our city.</p>
  `;

  return sendEmail(complaint.citizenEmail, "Complaint Resolved - Smart City CMS", html);
}

module.exports = {
  sendEmail,
  notifyComplaintRegistered,
  notifyStatusUpdated,
  notifyComplaintResolved,
};
