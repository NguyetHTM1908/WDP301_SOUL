const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const auth = require("../middleware/auth");

// Public routes
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);

// Private routes (require login)
router.post("/:id/register", auth, eventController.registerEvent);
router.post("/:id/cancel", auth, eventController.cancelRegistration);

module.exports = router;

