const mongoose = require("mongoose");

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    en: { type: String, trim: true, default: "" },
    ar: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const mapEmbedSchema = new Schema(
  {
    provider: { type: String, trim: true, default: "custom" }, // e.g. "matterport", "google", "custom"
    url: { type: String, trim: true, required: true },
    title: { type: localizedTextSchema, default: () => ({}) },
  },
  { _id: false }
);

const seasonalAvailabilitySchema = new Schema(
  {
    // Months 1-12; vendor can be available seasonally (e.g., winter venues)
    months: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((m) => Number.isInteger(m) && m >= 1 && m <= 12),
        message: "months must be integers in range 1..12",
      },
    },
    // Weekdays 0-6 (Sun-Sat)
    weekdays: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: "weekdays must be integers in range 0..6",
      },
    },
    blackoutDates: { type: [Date], default: [] },
    dateRanges: {
      type: [
        new Schema(
          {
            start: { type: Date, required: true },
            end: { type: Date, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { _id: false }
);

const eventTypeSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      enum: ["wedding", "corporate", "mini_event", "seasonal_venue"],
    },
    label: { type: localizedTextSchema, default: () => ({}) },
  },
  { _id: false }
);

const locationSchema = new Schema(
  {
    city: { type: localizedTextSchema, default: () => ({ en: "Riyadh", ar: "الرياض" }) },
    address: { type: localizedTextSchema, default: () => ({}) },
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
        validate: {
          validator: (arr) =>
            arr === undefined ||
            (Array.isArray(arr) &&
              arr.length === 2 &&
              Number.isFinite(arr[0]) &&
              Number.isFinite(arr[1]) &&
              arr[0] >= -180 &&
              arr[0] <= 180 &&
              arr[1] >= -90 &&
              arr[1] <= 90),
          message: "geo.coordinates must be [lng, lat]",
        },
      },
    },
  },
  { _id: false }
);

const vendorProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"],
    },

    businessName: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, default: () => ({}) },

    categories: { type: [String], default: [], index: true }, // future-friendly tags (e.g. "venue", "catering")
    eventTypes: { type: [eventTypeSchema], default: [] },

    location: { type: locationSchema, default: () => ({}) },
    serviceAreaCities: { type: [String], default: ["riyadh"], index: true },

    seasonalAvailability: { type: seasonalAvailabilitySchema, default: () => ({}) },

    threeDMaps: { type: [mapEmbedSchema], default: [] },
    gallery: {
      type: [
        new Schema(
          {
            url: { type: String, trim: true, required: true },
            alt: { type: localizedTextSchema, default: () => ({}) },
            sortOrder: { type: Number, default: 0 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    contact: {
      type: new Schema(
        {
          email: { type: String, trim: true, lowercase: true, default: "" },
          phoneE164: { type: String, trim: true, default: "" },
          website: { type: String, trim: true, default: "" },
          instagram: { type: String, trim: true, default: "" },
          whatsapp: { type: String, trim: true, default: "" },
        },
        { _id: false }
      ),
      default: () => ({}),
    },

    isVerified: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

vendorProfileSchema.index({ "location.geo": "2dsphere" });

module.exports = mongoose.model("VendorProfile", vendorProfileSchema);

