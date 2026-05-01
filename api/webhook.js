const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on("data", chunk => chunks.push(chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });
    const rawBody = Buffer.concat(chunks);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook Fehler:", err.message);
    return res.status(400).json({ error: err.message });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ Zahlung erfolgreich:", session.customer_email, session.subscription);
      // TODO: User in DB als Pro/Business markieren
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      console.log("❌ Abo gekündigt:", sub.customer);
      // TODO: User downgraden
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object;
      console.log("🔄 Abo geändert:", sub.customer, sub.status);
      break;
    }
    default:
      console.log("Unbekanntes Event:", event.type);
  }

  res.status(200).json({ received: true });
};
