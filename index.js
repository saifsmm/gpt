app.post("/auto-book", async (req, res) => {
  const { name, email, date } = req.body;

  try {
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

      const slotUrl = `https://user-api.simplybook.me/admin/available-slots?provider_id=${providerId}&service_id=${SERVICE_ID}&date=${date}`;
      const slotRes = await axios.get(slotUrl, { headers: HEADERS });

      const slots = slotRes.data;
      if (Array.isArray(slots) && slots.length > 0) {
        const time = slots[0].start_time;

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
