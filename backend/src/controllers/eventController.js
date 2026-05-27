const Event = require("../models/Event");

/**
 * @route   GET /api/events
 * @desc    Get list of events
 * @access  Public
 */
const getEvents = async (req, res) => {
  try {
    const { status, eventType, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(query)
      .sort({ startDateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "username fullName avatar");

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getEvents,
};
