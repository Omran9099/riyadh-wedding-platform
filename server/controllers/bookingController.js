const Booking = require("../models/Booking");
const VendorProfile = require("../models/VendorProfile");

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

async function createBooking(req, res) {
  try {
    const customerId = req.user?._id;
    if (!customerId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const {
      vendorProfileId,
      eventType,
      eventStartAt,
      eventEndAt,
      items = [],
      subtotal,
      discount,
      total,
      couponCode,
      notes,
    } = req.body ?? {};

    if (!vendorProfileId || !eventType || !eventStartAt || !eventEndAt || !subtotal || !total) {
      return res.status(400).json({ ok: false, error: "Missing required booking fields" });
    }

    const start = new Date(eventStartAt);
    const end = new Date(eventEndAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ ok: false, error: "Invalid event date range" });
    }

    const vendorProfile = await VendorProfile.findById(vendorProfileId);
    if (!vendorProfile || !vendorProfile.isPublished || !vendorProfile.isVerified) {
      return res.status(404).json({ ok: false, error: "Vendor not available for booking" });
    }

    const activeStatuses = ["hold", "pending", "confirmed", "completed"];
    const existingBookings = await Booking.find({
      vendorProfile: vendorProfile._id,
      status: { $in: activeStatuses },
      eventStartAt: { $lt: end },
      eventEndAt: { $gt: start },
    }).select("_id eventStartAt eventEndAt status");

    const hasConflict = existingBookings.some((b) =>
      overlaps(start, end, new Date(b.eventStartAt), new Date(b.eventEndAt))
    );

    if (hasConflict) {
      return res.status(409).json({ ok: false, error: "Selected time slot is no longer available" });
    }

    const booking = await Booking.create({
      customer: customerId,
      vendor: vendorProfile.user,
      vendorProfile: vendorProfile._id,
      eventType,
      eventStartAt: start,
      eventEndAt: end,
      status: "pending",
      items,
      subtotal,
      discount,
      total,
      couponCode,
      notes,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("availability-blocked", {
        vendorId: String(vendorProfile._id),
        date: start.toISOString(),
        bookingId: String(booking._id),
      });
    }

    return res.status(201).json({ ok: true, data: booking });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function listBookings(req, res) {
  try {
    const query = {};
    if (req.user.role === "customer") {
      query.customer = req.user._id;
    }
    if (req.user.role === "vendor") {
      query.vendor = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate("vendorProfile", "businessName slug")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ ok: true, data: bookings });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  createBooking,
  listBookings,
};

