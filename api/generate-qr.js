module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { target_url } = req.body;

  if (!target_url) {
    return res.status(400).json({ error: "target_url erforderlich" });
  }

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(target_url)}`;

  return res.status(200).json({
    image_url: qrApiUrl,
    target_url: target_url
  });
};
