const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const eventPublicController = require("../controllers/event/eventPublicController");
const eventOwnerController = require("../controllers/event/eventOwnerController");
const eventAdminController = require("../controllers/event/eventAdminController");
const eventRegistrationController = require("../controllers/event/eventRegistrationController");

router.get("/", eventPublicController.getEvents);

router.get("/calendar", eventPublicController.getEventCalendar);

router.get(
  "/me/registered",
  auth,
  eventRegistrationController.getRegisteredEvents
);

router.get(
  "/me/calendar",
  auth,
  eventRegistrationController.getRegisteredEvents
);

router.post(
  "/:id/register",
  auth,
  eventRegistrationController.registerEvent
);

router.post(
  "/:id/cancel",
  auth,
  eventRegistrationController.cancelRegistration
);

router.post("/", auth, eventOwnerController.createEvent);

router.get("/me/created", auth, eventOwnerController.getMyEvents);

router.get("/me/created/:id", auth, eventOwnerController.getMyEventById);

router.patch("/:id", auth, eventOwnerController.updateEvent);

router.delete("/:id", auth, eventOwnerController.deleteEvent);

router.get(
  "/admin/pending",
  auth,
  adminOnly,
  eventAdminController.getAdminPendingEvents
);

router.get(
  "/admin/all",
  auth,
  adminOnly,
  eventAdminController.getAdminAllEvents
);

router.get(
  "/admin/:id",
  auth,
  adminOnly,
  eventAdminController.getAdminEventById
);

router.patch(
  "/admin/:id/approve",
  auth,
  adminOnly,
  eventAdminController.approveEvent
);

router.patch(
  "/admin/:id/reject",
  auth,
  adminOnly,
  eventAdminController.rejectEvent
);

router.get(
  "/:id/registrations/stats",
  eventRegistrationController.getEventRegistrationStats
);


router.get(
  "/:id/registrations",
  auth,
  eventRegistrationController.getEventRegistrations
);

router.get("/:id", eventPublicController.getEventById);

module.exports = router;