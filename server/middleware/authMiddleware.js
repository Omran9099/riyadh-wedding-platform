const jwt = require("jsonwebtoken");

const User = require("../models/User");
const VendorProfile = require("../models/VendorProfile");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, error: "Missing or invalid Authorization header" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ ok: false, error: "Server misconfigured (JWT_SECRET missing)" });
    }

    const payload = jwt.verify(token, secret);
    const userId = payload?.sub;
    if (!userId) {
      return res.status(401).json({ ok: false, error: "Invalid token" });
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (_err) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}

async function requireVerifiedVendor(req, res, next) {
  try {
    if (!req.user) {
      return res.status(500).json({ ok: false, error: "Auth middleware order error (req.user missing)" });
    }

    if (req.user.role !== "vendor") {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const profile = await VendorProfile.findOne({ user: req.user._id }).select("_id isVerified isPublished");
    if (!profile || !profile.isVerified) {
      return res.status(403).json({ ok: false, error: "Vendor not verified" });
    }

    req.vendorProfile = profile;
    return next();
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  requireAuth,
  requireVerifiedVendor,
};

