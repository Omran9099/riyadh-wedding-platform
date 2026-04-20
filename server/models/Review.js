const mongoose = require("mongoose");

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    en: { type: String, trim: true, default: "" },
    ar: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const reviewSchema = new Schema(
  {
    vendorProfile: { type: Schema.Types.ObjectId, ref: "VendorProfile", required: true, index: true },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", index: true }, // optional but recommended

    rating: { type: Number, required: true, min: 1, max: 5, index: true },

    title: { type: localizedTextSchema, default: () => ({}) },
    body: { type: localizedTextSchema, default: () => ({}) },

    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Prevent duplicate reviews for same booking when booking is present
reviewSchema.index(
  { booking: 1, customer: 1 },
  { unique: true, partialFilterExpression: { booking: { $type: "objectId" } } }
);

module.exports = mongoose.model("Review", reviewSchema);

