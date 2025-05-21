const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'We received your message',
      html: `
        <h3>Thank you for contacting us!</h3>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>Travel Agency Team</p>
      `
    });

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not send message' });
  }
});

module.exports = router; 