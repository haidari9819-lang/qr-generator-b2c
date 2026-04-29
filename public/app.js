let qrImageUrl = "";

async function generateQR() {
  const url = document.getElementById("target_url").value.trim();
  const btn = document.getElementById("generateBtn");

  if (!url) {
    showStatus("Bitte eine URL eingeben!", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Wird generiert...";
  hideStatus();

  try {
    const response = await fetch("/api/generate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_url: url, size: 300 })
    });

    const data = await response.json();

    if (!response.ok) throw new Error("QR Code konnte nicht erstellt werden");

    qrImageUrl = data.image_url;

    const qrImage = document.getElementById("qrImage");
    qrImage.src = qrImageUrl;

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = qrImageUrl;

    document.getElementById("preview").classList.remove("hidden");
    showStatus("QR Code erfolgreich erstellt! ✅", "success");

  } catch (error) {
    showStatus("Fehler: " + error.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "QR Code generieren";
  }
}

async function sendEmail() {
  const email = document.getElementById("email").value.trim();
  const url = document.getElementById("target_url").value.trim();
  const btn = document.getElementById("sendBtn");

  if (!email) {
    showStatus("Bitte eine E-Mail eingeben!", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Wird gesendet...";

  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        qr_image_url: qrImageUrl,
        target_url: url
      })
    });

    if (!response.ok) throw new Error("E-Mail konnte nicht gesendet werden");

    showStatus("E-Mail erfolgreich gesendet! Bitte Postfach prüfen 📧", "success");

  } catch (error) {
    showStatus("Fehler: " + error.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "QR Code per E-Mail senden 📧";
  }
}

function showStatus(message, type) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = type;
  status.classList.remove("hidden");
}

function hideStatus() {
  document.getElementById("status").classList.add("hidden");
}
