const express = require("express");
const { processMockPayment } = require("../controllers/paymentController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/mock", requireAuth, processMockPayment);

module.exports = router;

