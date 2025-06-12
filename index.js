const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const COMPANY_LOGIN = "dorchesterprt";
const USER_TOKEN = "0a2ee79bba79a1e506f5d9f975a88d2500afe68a9e91cb484ff743265aea6324"; // full access token
const SERVICE_ID = 238807; // Sale Registration

app.post("/book", async (req, res) => {
  const { name, email, date, time } = req.body;

  const startDateTime = `${date} ${time}`;

  try {
    const booking = await axios.post(
      "https://user-api.simplybook.me/admin/booking",
      {
        client: {
          name,
          email
        },
        booking: {
          start_date_time: startDateTime,
          service_id: SERVICE_ID
        }
      },
      {
        headers: {
          "X-Company-Login": COMPANY_LOGIN,
          "X-User-Token": USER_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    if (booking.data?.id) {
      res.json({
        success: true,
        message: `✅ Booking confirmed for ${name} on ${date} at ${time}`,
        booking_id: booking.data.id
      });
    } else {
      res.json({
        success: false,
        message: "Booking failed — check service ID or time.",
        response: booking.data
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Booking failed due to API error.",
      error: err.response?.data || err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("🟢 GPT-SimplyBook live booking is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
