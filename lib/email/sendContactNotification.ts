type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Sends a contact notification through Resend when credentials exist.
 * Returns false when email is not configured. Messages are always persisted
 * in PostgreSQL first; email failure never loses a message.
 */
export async function sendContactNotification(
  payload: ContactPayload
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey || !notifyEmail) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [notifyEmail],
      reply_to: payload.email,
      subject: `New contact: ${payload.subject}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Subject: ${payload.subject}`,
        "",
        payload.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend returned ${response.status}: ${errorText}`);
  }

  return true;
}
