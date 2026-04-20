const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const VendorProfile = require("../models/VendorProfile");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(
    { sub: String(user._id), role: user.role },
    secret,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user) {
  return {
    id: String(user._id),
    role: user.role,
    email: user.email ?? null,
    phoneE164: user.phoneE164 ?? null,
    displayName: user.displayName ?? "",
    isActive: Boolean(user.isActive),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function registerCustomer(req, res) {
  try {
    const { email, phoneE164, password, displayName } = req.body ?? {};

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ ok: false, error: "Password must be at least 8 characters" });
    }

    if ((!email || typeof email !== "string") && (!phoneE164 || typeof phoneE164 !== "string")) {
      return res.status(400).json({ ok: false, error: "Either email or phoneE164 is required" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      role: "customer",
      email,
      phoneE164,
      passwordHash,
      displayName,
      isActive: true,
    });

    const token = signToken(user);
    return res.status(201).json({ ok: true, token, user: sanitizeUser(user) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, error: "Account already exists" });
    }
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function registerVendor(req, res) {
  try {
    const {
      email,
      phoneE164,
      password,
      displayName,
      businessName,
      description,
      eventTypes,
      threeDMaps,
    } = req.body ?? {};

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ ok: false, error: "Password must be at least 8 characters" });
    }

    if ((!email || typeof email !== "string") && (!phoneE164 || typeof phoneE164 !== "string")) {
      return res.status(400).json({ ok: false, error: "Either email or phoneE164 is required" });
    }

    if (!businessName || typeof businessName !== "object") {
      return res.status(400).json({ ok: false, error: "businessName must be an object like { en, ar }" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      role: "vendor",
      email,
      phoneE164,
      passwordHash,
      displayName,
      isActive: true,
    });

    const vendorProfile = await VendorProfile.create({
      user: user._id,
      businessName,
      description,
      eventTypes,
      threeDMaps,
      isVerified: false,
      isPublished: false,
    });

    const token = signToken(user);
    return res.status(201).json({
      ok: true,
      token,
      user: sanitizeUser(user),
      vendorProfile: {
        id: String(vendorProfile._id),
        user: String(vendorProfile.user),
        isVerified: vendorProfile.isVerified,
        isPublished: vendorProfile.isPublished,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, error: "Account already exists" });
    }
    return res.status(500).json({ ok: false, error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, phoneE164, password } = req.body ?? {};

    if (!password || typeof password !== "string") {
      return res.status(400).json({ ok: false, error: "Password is required" });
    }

    if ((!email || typeof email !== "string") && (!phoneE164 || typeof phoneE164 !== "string")) {
      return res.status(400).json({ ok: false, error: "Either email or phoneE164 is required" });
    }

    const query = email ? { email: String(email).toLowerCase().trim() } : { phoneE164: String(phoneE164).trim() };
    const user = await User.findOne(query).select("+passwordHash");

    if (!user || !user.isActive) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    return res.json({ ok: true, token, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  registerCustomer,
  registerVendor,
  login,
};

