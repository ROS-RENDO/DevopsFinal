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
    from: '"Servd App" <noreply@servd.com>',
    to,
    subject: "Your Servd Verification Code",
    text: `Welcome to Servd!\n\nYour 6-digit verification code is: ${code}\n\nIt expires in 10 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f7f7f7; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          
          <div style="background: #111111; padding: 24px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Servd</h1>
          </div>
          
          <div style="padding: 40px 32px;">
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #111111; font-weight: 700;">Secure Login</h2>
            <p style="margin: 0 0 24px; color: #555555; font-size: 15px; line-height: 1.6;">
              Please use the verification code below to securely sign in to your Servd account.
            </p>
            
            <div style="background: #f9f9f9; border: 1.5px dashed #cccccc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111111;">
                ${code}
              </span>
            </div>
            
            <p style="margin: 0; color: #888888; font-size: 13px; line-height: 1.5;">
              This code will expire in <strong>10 minutes</strong>.<br/>
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #fafafa; padding: 20px 32px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
              © ${new Date().getFullYear()} Servd, Inc. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    `,
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
