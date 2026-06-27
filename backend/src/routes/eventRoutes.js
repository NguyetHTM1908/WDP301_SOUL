const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

// Public routes
router.get("/", eventController.getEvents);
router.get("/calendar", eventController.getEventCalendar);

// Owner routes
router.post("/", auth, eventController.createEvent);
router.get("/me/created", auth, eventController.getMyEvents);
router.get("/me/created/:id", auth, eventController.getMyEventById);
router.patch("/:id", auth, eventController.updateEvent);
router.delete("/:id", auth, eventController.deleteEvent);

// User registration routes
router.get("/me/registered", auth, eventController.getRegisteredEvents);
router.post("/:id/register", auth, eventController.registerEvent);
router.post("/:id/cancel", auth, eventController.cancelRegistration);

// Admin routes
router.get(
  "/admin/pending",
  auth,
  adminOnly,
  eventController.getAdminPendingEvents
);

router.get(
  "/admin/all",
  auth,
  adminOnly,
  eventController.getAdminAllEvents
);

router.get(
  "/admin/:id",
  auth,
  adminOnly,
  eventController.getAdminEventById
);

router.patch(
  "/admin/:id/approve",
  auth,
  adminOnly,
  eventController.approveEvent
);

router.patch(
  "/admin/:id/reject",
  auth,
  adminOnly,
  eventController.rejectEvent
);

router.get(
  "/:id/registrations",
  auth,
  adminOnly,
  eventController.getEventRegistrations
);

router.get("/:id", eventController.getEventById);

module.exports = router;