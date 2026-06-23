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

function getHtmlLayout(title, content) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Smart City Portal</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Citizen Complaint Management</p>
      </div>
      <div style="padding: 24px; color: #1e293b; background-color: #ffffff; line-height: 1.6;">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">${title}</h2>
        ${content}
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          This is an automated notification from the Smart City Complaint Management System. Please do not reply directly to this email. If you have questions, please log in to your dashboard.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; 2026 Municipal Corporation. All rights reserved.
      </div>
    </div>
  `;
}

async function notifyComplaintRegistered(complaint) {
  if (!complaint.citizenEmail) return;

  const content = `
    <p>Dear citizen,</p>
    <p>Your complaint has been successfully registered on the Smart City CMS portal. Our automated priority engine and routing system have assigned it to the appropriate department.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Complaint ID:</strong> <span style="font-family: monospace; font-size: 14px;">${complaint.complaintId}</span></p>
      <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${complaint.title}</p>
      <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${complaint.category}</p>
      <p style="margin: 0 0 8px 0;"><strong>Priority:</strong> ${complaint.priority}</p>
      <p style="margin: 0;"><strong>Status:</strong> <span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">${complaint.status}</span></p>
    </div>
    
    <p>You can track the live status of your report at any time using your Complaint ID in the tracker.</p>
  `;

  const html = getHtmlLayout("Complaint Registered Successfully", content);
  return sendEmail(complaint.citizenEmail, `Complaint Registered [${complaint.complaintId}] - Smart City CMS`, html);
}

async function notifyStatusUpdated(complaint, oldStatus) {
  if (!complaint.citizenEmail) return;

  const content = `
    <p>Dear citizen,</p>
    <p>The status of your complaint has been updated by the municipal team.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Complaint ID:</strong> <span style="font-family: monospace; font-size: 14px;">${complaint.complaintId}</span></p>
      <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${complaint.title}</p>
      <p style="margin: 0 0 8px 0;"><strong>Previous Status:</strong> ${oldStatus}</p>
      <p style="margin: 0 0 8px 0;"><strong>Current Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">${complaint.status}</span></p>
      ${complaint.department ? `<p style="margin: 0;"><strong>Assigned Department:</strong> ${complaint.department}</p>` : ""}
    </div>
    
    <p>We will keep you informed as our field staff resolves this issue.</p>
  `;

  const html = getHtmlLayout("Complaint Status Updated", content);
  return sendEmail(complaint.citizenEmail, `Complaint Status Update [${complaint.complaintId}] - Smart City CMS`, html);
}

async function notifyComplaintResolved(complaint) {
  if (!complaint.citizenEmail) return;

  const content = `
    <p>Dear citizen,</p>
    <p>Good news! Your complaint has been resolved by our department staff.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Complaint ID:</strong> <span style="font-family: monospace; font-size: 14px;">${complaint.complaintId}</span></p>
      <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${complaint.title}</p>
      <p style="margin: 0 0 8px 0;"><strong>Resolution Status:</strong> <span style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">${complaint.status}</span></p>
      <p style="margin: 0;"><strong>Resolved At:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <p>Please log in to your dashboard to review the resolution and submit feedback. Your feedback directly impacts our department rankings and SLA scores.</p>
  `;

  const html = getHtmlLayout("Civic Complaint Resolved", content);
  return sendEmail(complaint.citizenEmail, `Complaint Resolved [${complaint.complaintId}] - Smart City CMS`, html);
}

async function notifyComplaintAssigned(complaint) {
  if (!complaint.citizenEmail) return;

  const content = `
    <p>Dear citizen,</p>
    <p>Your complaint has been assigned to the designated department for resolution.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Complaint ID:</strong> <span style="font-family: monospace; font-size: 14px;">${complaint.complaintId}</span></p>
      <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${complaint.title}</p>
      <p style="margin: 0 0 8px 0;"><strong>Assigned Department:</strong> ${complaint.department || 'General Administration'}</p>
      <p style="margin: 0 0 8px 0;"><strong>Priority:</strong> ${complaint.priority}</p>
      <p style="margin: 0;"><strong>Status:</strong> <span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">${complaint.status}</span></p>
    </div>
    
    <p>Our department team is reviewing the issue and will begin execution shortly.</p>
  `;

  const html = getHtmlLayout("Complaint Assigned to Department", content);
  return sendEmail(complaint.citizenEmail, `Complaint Assigned [${complaint.complaintId}] - Smart City CMS`, html);
}

module.exports = {
  sendEmail,
  notifyComplaintRegistered,
  notifyStatusUpdated,
  notifyComplaintResolved,
  notifyComplaintAssigned,
};
