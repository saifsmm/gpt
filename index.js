const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const COMPANY_LOGIN = "dorchesterprt";
const USER_TOKEN = "0a2ee79bba79a1e506f5d9f975a88d2500afe68a9e91cb484ff743265aea6324"; // your real admin token
const SERVICE_ID = 238807;

const HEADERS = {
  "X-Company-Login": COMPANY_LOGIN,
  "X-User-Token": USER_TOKEN,
  "Content-Type": "application/json"
};

app.post("/auto-book", async (req, res) => {
  const { name, email, date } = req.body;

  try {
    // Get all providers
    const providerRes = await axios.get("https://user-api.simplybook.me/admin/provider", { headers: HEADERS });
    const providers = providerRes.data;

    if (!Array.isArray(providers)) {
      return res.status(500).json({
        success: false,
        message: "❌ Unexpected providers data format",
        data: providers
      });
    }

    for (let provider of providers) {
      const providerId = provider.id;

      // Get available slots for provider
      const slotUrl = `https://user-api.simplybook.me/admin/available-slots?provider_id=${providerId}&service_id=${SERVICE_ID}&date=${date}`;
      const slotRes = await axios.get(slotUrl, { headers: HEADERS });

      const slots = slotRes.data;
      if (Array.isArray(slots) && slots.length > 0) {
        const time = slots[0].start_time;

        // Book the first available slot
        const bookingRes = await axios.post(
          "https://user-api.simplybook.me/admin/booking",
          {
            client: { name, email },
            booking: {
              start_date_time: `${date} ${time}`,
              service_id: SERVICE_ID,
              provider_id: providerId
            }
          },
          { headers: HEADERS }
        );

        return res.json({
          success: true,
          message: `✅ Booking confirmed for ${name} on ${date} at ${time}`,
          provider: provider.name,
          booking_id: bookingRes.data.id
        });
      }
    }

    res.json({ success: false, message: "❌ No available time slots found on that date." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Error during booking attempt.",
      error: err.response?.data || err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("🟢 GPT x SimplyBook Auto-booking API is live.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auto-booking server running on port ${PORT}`);
});
