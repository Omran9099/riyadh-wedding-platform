const express = require("express");
const { listVendors, getVendorById, triggerCharityPickup } = require("../controllers/vendorController");

const router = express.Router();

router.get("/", listVendors);
router.post("/charity-pickup", triggerCharityPickup);
router.get("/:vendorId", getVendorById);

module.exports = router;

