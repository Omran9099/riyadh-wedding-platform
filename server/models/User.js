const mongoose = require("mongoose");

const { Schema } = mongoose;

const USER_ROLES = ["customer", "vendor", "admin"];

const userSchema = new Schema(
  {
    role: { type: String, enum: USER_ROLES, required: true, default: "customer", index: true },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    phoneE164: {
      type: String,
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, "Invalid E.164 phone format"],
    },

    passwordHash: { type: String, required: true, select: false },

    displayName: { type: String, trim: true, maxlength: 120 },

    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Require at least one of email or phone
userSchema.pre("validate", function validateContact(next) {
  const hasEmail = Boolean(this.email);
  const hasPhone = Boolean(this.phoneE164);
  if (!hasEmail && !hasPhone) {
    this.invalidate("email", "Either email or phoneE164 is required");
    this.invalidate("phoneE164", "Either email or phoneE164 is required");
  }
  next();
});

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);
userSchema.index(
  { phoneE164: 1 },
  { unique: true, partialFilterExpression: { phoneE164: { $type: "string" } } }
);

module.exports = mongoose.model("User", userSchema);

