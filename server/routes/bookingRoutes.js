const express = require("express");
const { createBooking, listBookings } = require("../controllers/bookingController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, listBookings);
router.post("/", requireAuth, createBooking);

module.exports = router;

