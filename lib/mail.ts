import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Gmail SMTP not configured");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
}

export async function sendWishEmail(params: {
  to: string;
  fromName: string;
  wishText: string;
  category: string;
}) {
  const { to, fromName, wishText, category } = params;
  const transport = getTransporter();

  const categoryNames: Record<string, string> = {
    health: "Health",
    wealth: "Wealth",
    luck: "Luck",
    friendship: "Friendship",
    love: "Love",
  };

  const subject = `You've received a ${categoryNames[category] || ""} blessing from ${fromName}`;

  const html = `
    <div style="max-width:480px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;background:#fdfaf5;border-radius:12px;border:1px solid #e8dcc8;">
      <h2 style="color:#8B7355;margin:0 0 8px;">✨ A Wish for You</h2>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        <strong>${fromName}</strong> sent you a heartfelt ${categoryNames[category]?.toLowerCase() || ""} blessing from <em>Orient Wisdom</em>:
      </p>
      <div style="background:#fff;border-left:4px solid #8B7355;padding:16px;margin:16px 0;border-radius:4px;">
        <p style="color:#333;font-size:15px;line-height:1.7;margin:0;">${wishText.replace(/\n/g, "<br>")}</p>
      </div>
      <p style="color:#999;font-size:12px;margin:0;">
        Sent with ❤️ via <a href="https://orientwisdom.com" style="color:#8B7355;">Orient Wisdom</a>
      </p>
    </div>
  `;

  const text = `✨ A Wish for You\n\n${fromName} sent you a ${categoryNames[category]?.toLowerCase() || ""} blessing from Orient Wisdom:\n\n"${wishText}"\n\n—— Sent with ❤️ via Orient Wisdom (https://orientwisdom.com)`;

  const info = await transport.sendMail({
    from: `"Orient Wisdom" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return { messageId: info.messageId };
}
