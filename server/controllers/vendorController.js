const VendorProfile = require("../models/VendorProfile");

async function listVendors(req, res) {
  try {
    const {
      eventType,
      city,
      verified = "true",
      published = "true",
      limit = "20",
      page = "1",
    } = req.query;

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);

    const query = {};
    if (verified === "true") query.isVerified = true;
    if (published === "true") query.isPublished = true;
    if (city) query.serviceAreaCities = { $in: [String(city).toLowerCase()] };
    if (eventType) query["eventTypes.key"] = String(eventType);

    const [vendors, total] = await Promise.all([
      VendorProfile.find(query)
        .populate("user", "displayName")
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      VendorProfile.countDocuments(query),
    ]);

    return res.json({
      ok: true,
      data: vendors,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function getVendorById(req, res) {
  try {
    const { vendorId } = req.params;
    const vendor = await VendorProfile.findById(vendorId).populate("user", "displayName");
    if (!vendor) {
      return res.status(404).json({ ok: false, error: "Vendor not found" });
    }
    return res.json({ ok: true, data: vendor });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function triggerCharityPickup(_req, res) {
  try {
    return res.status(200).json({
      ok: true,
      data: {
        requestId: `charity_${Date.now()}`,
        status: "queued",
        message: "Charity pickup request queued successfully",
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  listVendors,
  getVendorById,
  triggerCharityPickup,
};

