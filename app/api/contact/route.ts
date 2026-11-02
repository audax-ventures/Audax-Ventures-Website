import { Resend } from "resend";

const TO_ADDRESS = "info@audaxventures.ca";
const FROM_ADDRESS = "Audax Ventures Website <contact@audaxventures.ca>";

interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  services: string[];
  message: string;
  turnstileToken?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function verifyTurnstileToken(token: string, remoteIp: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("Contact form: TURNSTILE_SECRET_KEY is not configured.");
    return false;
  }

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed:", err);
    return false;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form: RESEND_API_KEY is not configured.");
    return Response.json(
      { error: "Email sending is not configured yet. Please email info@audaxventures.ca directly." },
      { status: 500 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, company, phone, services, message, turnstileToken } = payload;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  if (!turnstileToken) {
    return Response.json({ error: "Please complete the verification challenge." }, { status: 400 });
  }

  const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const verified = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!verified) {
    return Response.json(
      { error: "Verification failed. Please try the challenge again." },
      { status: 400 }
    );
  }

  const servicesLine = services?.length ? services.join(", ") : "Not specified";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email,
      subject: `New Contact Form Submission — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "—"}`,
        `Phone: ${phone || "—"}`,
        `Service(s) interested in: ${servicesLine}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; font-size: 14px; color: #0F172A;">
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company || "—")}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "—")}</p>
          <p><strong>Service(s) interested in:</strong> ${escapeHtml(servicesLine)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: "Failed to send message. Please email info@audaxventures.ca directly." }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return Response.json({ error: "Failed to send message. Please email info@audaxventures.ca directly." }, { status: 500 });
  }
}
