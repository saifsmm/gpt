const express = require("express");
const app = express();
app.use(express.json());

app.post("/book", async (req, res) => {
  const { name, email, service_id, date, time } = req.body;

  console.log("Fake booking received:", { name, email, service_id, date, time });

  // Simulated success response
  res.json({
    success: true,
    message: `✅ Booking confirmed for ${name} on ${date} at ${time} for service ID ${service_id}`,
    booking_details: {
      name,
      email,
      service_id,
      date,
      time
    }
  });
});

app.get("/", (req, res) => {
  res.send("🟢 Dummy GPT Booking API is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
