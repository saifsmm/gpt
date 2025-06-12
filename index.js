const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const COMPANY_LOGIN = "dorchesterprt";
const ACCESS_TOKEN = "6660416c396db825aab96f8f605f71bcdf76b936581289fa5d966134bb6788fe";

app.post("/book", async (req, res) => {
  const { name, email, date, time } = req.body;

  // Combine date + time for start_date_time
  const startDateTime = `${date} ${time}`;

  try {
    const response = await axios.post(
      "https://user-api.simplybook.me/admin/booking",
      {
        client: {
          name,
          email
        },
        booking: {
          start_date_time: startDateTime,
          service_id: 238807
        }
      },
      {
        headers: {
          "X-Company-Login": COMPANY_LOGIN,
          "X-Token": ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data && response.data.id) {
      res.json({
        success: true,
        message: `✅ Booking confirmed for ${name} on ${date} at ${time}`,
        booking_id: response.data.id
      });
    } else {
      res.json({
        success: false,
        message: "Booking failed — check service ID or time format.",
        response: response.data
      });
    }
  } catch (error) {
    console.error("Booking error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "❌ Booking failed due to API error.",
      error: error.response?.data || error.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("🟢 GPT booking server is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
