const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

// Public routes
router.get("/", eventController.getEvents);

// Admin routes
router.post("/", auth, adminOnly, eventController.createEvent);
router.patch("/:id", auth, adminOnly, eventController.updateEvent);
router.delete("/:id", auth, adminOnly, eventController.deleteEvent);
router.get("/:id/registrations", auth, adminOnly, eventController.getEventRegistrations);
router.delete(
  "/:id/registrations/:userId",
  auth,
  adminOnly,
  eventController.removeEventRegistration
);

// Private routes (require login)
router.get("/me/registered", auth, eventController.getRegisteredEvents);
router.post("/:id/register", auth, eventController.registerEvent);
router.post("/:id/cancel", auth, eventController.cancelRegistration);

router.get("/:id", eventController.getEventById);

module.exports = router;

