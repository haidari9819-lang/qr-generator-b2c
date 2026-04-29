const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, qr_image_url, target_url } = req.body;

  console.log("Email Request:", { email, target_url });
  console.log("Resend Key:", process.env.RESEND_API_KEY ? "vorhanden" : "FEHLT!");

  if (!email || !qr_image_url) {
    return res.status(400).json({ error: "Email und QR-URL erforderlich" });
  }

  // Extract base64 content from data URL (e.g. "data:image/png;base64,...")
  const base64Match = qr_image_url.match(/^data:image\/(\w+);base64,(.+)$/);

  try {
    let emailPayload;

    if (base64Match) {
      // Send as inline attachment with CID reference
      const ext = base64Match[1];
      const base64Data = base64Match[2];

      emailPayload = {
        from: "onboarding@resend.dev",
        to: email,
        subject: "Dein QR-Code ist fertig!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e85d04;">Dein QR-Code ist bereit!</h2>
            <p>Hier ist dein generierter QR-Code:</p>
            <img src="cid:qrcode" alt="QR Code" style="width: 300px; height: 300px; display: block;" />
            <p>Dein QR-Code verweist auf: <strong>${target_url}</strong></p>
            <hr/>
            <a href="https://qr-docs.de"
               style="background: #e85d04; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Kostenlos testen auf QR-Docs.de
            </a>
          </div>
        `,
        attachments: [
          {
            filename: `qrcode.${ext}`,
            content: base64Data,
            content_id: "qrcode",
            inline: true,
          }
        ]
      };
    } else {
      // Fallback: treat as hosted URL
      emailPayload = {
        from: "onboarding@resend.dev",
        to: email,
        subject: "Dein QR-Code ist fertig!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e85d04;">Dein QR-Code ist bereit!</h2>
            <p>Hier ist dein generierter QR-Code:</p>
            <img src="${qr_image_url}" alt="QR Code" style="width: 300px; height: 300px; display: block;" />
            <p>Dein QR-Code verweist auf: <strong>${target_url}</strong></p>
            <hr/>
            <a href="https://qr-docs.de"
               style="background: #e85d04; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Kostenlos testen auf QR-Docs.de
            </a>
          </div>
        `
      };
    }

    const result = await resend.emails.send(emailPayload);

    console.log("Resend Result:", JSON.stringify(result));
    return res.status(200).json({ success: true, result });

  } catch (error) {
    console.log("Mail Fehler:", error.message);
    return res.status(500).json({ error: "Mail Fehler: " + error.message });
  }
};
