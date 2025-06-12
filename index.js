const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const COMPANY_LOGIN = "dorchesterprt";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Dubai#2021";

let userToken = null;

// 🔐 Get Admin User Token
async function getUserToken() {
  try {
    const res = await axios.post("https://user-api.simplybook.me/login", {
      jsonrpc: "2.0",
      method: "getUserToken",
      params: {
        company: COMPANY_LOGIN,
        login: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      },
      id: 1
    });

    userToken = res.data.result.user_token;
    console.log("✅ Admin user_token acquired.");
  } catch (err) {
    console.error("❌ Failed to get user_token:", err.response?.data || err.message);
  }
}

// 🟢 Book Route
app.post("/book", async (req, res) => {
  const { name, email, date, time } = req.body;

  const startDateTime = `${date} ${time}`;

  try {
    if (!userToken) {
      await getUserToken();
    }

    const booking = await axios.post(
      "https://user-api.simplybook.me/admin/booking",
      {
        client: { name, email },
        booking: {
          start_date_time: startDateTime,
          service_id: 238807
        }
      },
      {
        headers: {
          "X-Company-Login": COMPANY_LOGIN,
          "X-User-Token": userToken,
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
        message: "Booking failed — check service ID or time format.",
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

// Default route
app.get("/", (req, res) => {
  res.send("🟢 GPT-SimplyBook backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await getUserToken(); // Get token on startup
});
