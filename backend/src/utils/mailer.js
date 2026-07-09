const nodemailer = require('nodemailer');

// We'll configure this to use Ethereal Email by default for testing if real SMTP isn't provided.
let transporter;

async function initMailer() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal for local dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });
    console.log(`[Mailer] Using Ethereal Email. Test account: ${testAccount.user}`);
  }
}

initMailer();

const sendMfaEmail = async (to, code) => {
  if (!transporter) await initMailer();
  
  const info = await transporter.sendMail({
    from: '"Servd Security" <security@servd.com>',
    to,
    subject: "Your Servd Verification Code",
    text: `Your 6-digit verification code is: ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:sans-serif;padding:20px;max-width:500px;margin:0 auto;border:1px solid #e5e5e5;border-radius:12px;">
            <h2 style="margin-top:0;">Your Verification Code</h2>
            <p>Use the following 6-digit code to securely access your Servd account:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:4px;padding:20px;background:#f5f5f5;border-radius:8px;text-align:center;margin:24px 0;">
              ${code}
            </div>
            <p style="color:#777;font-size:14px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
           </div>`,
  });

  console.log("Message sent: %s", info.messageId);
  if (info.messageId.includes('ethereal')) {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

module.exports = {
  sendMfaEmail
};
