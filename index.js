const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const COMPANY_LOGIN = "dorchesterpt";
const API_KEY = "fb0e7c3c0955e3f1e1a7c3ca51e994e8be6069ef33f5d1c44d63ad468563a869";

let accessToken = null;

// Authenticate once and cache the token
async function authenticate() {
  const res = await axios.post("https://user-api.simplybook.me/login", {
    company: COMPANY_LOGIN,
    api_key: API_KEY,
  });
  accessToken = res.data.token;
}

// Endpoint: /book
app.post("/book", async (req, res) => {
  try {
    if (!accessToken) await authenticate();

    const { name, email, service_id, date, time } = req.body;

    const bookingRes = await axios.post(
      "https://user-api.simplybook.me/admin/booking",
      {
        client: {
          name: name,
          email: email,
        },
        booking: {
          start_date_time: `${date} ${time}`,
          service_id: service_id,
        },
      },
      {
        headers: {
          "X-Company-Login": COMPANY_LOGIN,
          "X-Token": accessToken,
        },
      }
    );

    res.json({ success: true, data: bookingRes.data });
  } catch (err) {
    console.error("Booking error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ping route
app.get("/", (req, res) => {
  res.send("SimplyBook backend running ✅");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
