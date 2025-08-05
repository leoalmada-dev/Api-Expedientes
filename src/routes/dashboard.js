const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const dashboardController = require("../controllers/dashboardController");

router.get("/", verifyToken, dashboardController.dashboardStats);

module.exports = router;
