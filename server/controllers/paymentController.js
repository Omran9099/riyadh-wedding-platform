const Booking = require("../models/Booking");

function generateMockPaymentId() {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function processMockPayment(req, res) {
  try {
    const { bookingId, method = "card" } = req.body ?? {};
    if (!bookingId) {
      return res.status(400).json({ ok: false, error: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ ok: false, error: "Booking not found" });
    }

    // Customer or admin can pay this booking in local mock mode.
    const isOwner = String(booking.customer) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: "Booking cannot be paid in current status" });
    }

    booking.status = "confirmed";
    await booking.save();

    return res.json({
      ok: true,
      data: {
        paymentId: generateMockPaymentId(),
        provider: "local-mock",
        method,
        status: "succeeded",
        amount: booking.total,
        bookingId: String(booking._id),
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  processMockPayment,
};

