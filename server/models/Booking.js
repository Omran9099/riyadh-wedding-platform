const mongoose = require("mongoose");

const { Schema } = mongoose;

const BOOKING_STATUSES = [
  "draft", // being assembled client-side, not yet held
  "hold", // temporarily held for real-time conflict checks
  "pending", // requested, awaiting vendor action
  "confirmed",
  "cancelled",
  "completed",
  "expired",
];

const moneySchema = new Schema(
  {
    currency: { type: String, default: "SAR", uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const localizedTextSchema = new Schema(
  {
    en: { type: String, trim: true, default: "" },
    ar: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const bookingItemSchema = new Schema(
  {
    // Since "Package" isn't defined yet, we store a snapshot of what was booked.
    kind: { type: String, enum: ["package", "addon", "custom"], required: true },
    sku: { type: String, trim: true, default: "" },
    title: { type: localizedTextSchema, default: () => ({}) },
    description: { type: localizedTextSchema, default: () => ({}) },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: moneySchema, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: BOOKING_STATUSES, required: true },
    at: { type: Date, default: () => new Date() },
    by: { type: Schema.Types.ObjectId, ref: "User" }, // who triggered the change (optional for system)
    note: { type: String, trim: true, maxlength: 400, default: "" },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendorProfile: { type: Schema.Types.ObjectId, ref: "VendorProfile", required: true, index: true },

    eventType: { type: String, enum: ["wedding", "corporate", "mini_event", "seasonal_venue"], required: true },
    eventStartAt: { type: Date, required: true, index: true },
    eventEndAt: { type: Date, required: true, index: true },

    // Real-time conflict checks: a hold expires automatically
    holdExpiresAt: { type: Date },

    status: { type: String, enum: BOOKING_STATUSES, default: "draft", index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },

    items: { type: [bookingItemSchema], default: [] }, // "package bundles" are represented by multiple items

    subtotal: { type: moneySchema, required: true },
    discount: { type: moneySchema, default: undefined },
    total: { type: moneySchema, required: true },

    couponCode: { type: String, trim: true, uppercase: true, default: "" },

    notes: { type: String, trim: true, maxlength: 2000, default: "" },

    cancellation: {
      type: new Schema(
        {
          reason: { type: String, trim: true, maxlength: 400, default: "" },
          cancelledAt: { type: Date },
          cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
        },
        { _id: false }
      ),
      default: undefined,
    },
  },
  { timestamps: true }
);

// Common query patterns
bookingSchema.index({ vendorProfile: 1, eventStartAt: 1, eventEndAt: 1, status: 1 });
bookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-remove expired holds (only when holdExpiresAt exists)

// Ensure correct time ranges
bookingSchema.pre("validate", function validateRange(next) {
  if (this.eventStartAt && this.eventEndAt && this.eventEndAt <= this.eventStartAt) {
    this.invalidate("eventEndAt", "eventEndAt must be after eventStartAt");
  }
  next();
});

// Track status changes automatically
bookingSchema.pre("save", function trackStatus(next) {
  if (this.isModified("status")) {
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({ status: this.status, at: new Date() });
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);

