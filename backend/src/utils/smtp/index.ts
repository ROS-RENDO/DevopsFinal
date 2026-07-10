import nodemailer from 'nodemailer';

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
};

const smtpHost = getRequiredEnv('SMTP_HOST');
const smtpPort = Number(getRequiredEnv('SMTP_PORT'));
const smtpUser = getRequiredEnv('SMTP_USER');
const smtpPass = getRequiredEnv('SMTP_PASS');
const smtpFrom = process.env.SMTP_FROM || `no-reply@${smtpHost.replace(/.*@/, '')}`;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  await transporter.sendMail({
    from: smtpFrom,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};

export const sendMfaEmail = async (recipientEmail: string, code: string): Promise<void> => {
  const subject = 'Your verification code';
  const text = `Your MFA verification code is: ${code}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h2 style="margin-bottom: 0.5rem;">Your verification code</h2>
      <p>Use the code below to complete sign in.</p>
      <p style="font-size: 1.5rem; font-weight: 700; margin: 1rem 0;">${code}</p>
      <p style="color: #555;">This code expires in 10 minutes.</p>
    </div>
  `;

  await sendMail({
    to: recipientEmail,
    subject,
    text,
    html,
  });
};
