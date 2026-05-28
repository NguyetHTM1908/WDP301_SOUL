const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const auth = require("../middleware/auth");

// Public routes
router.get("/", eventController.getEvents);

// Private routes (require login)
router.get("/me/registered", auth, eventController.getRegisteredEvents);
router.post("/:id/register", auth, eventController.registerEvent);
router.post("/:id/cancel", auth, eventController.cancelRegistration);

router.get("/:id", eventController.getEventById);

module.exports = router;

