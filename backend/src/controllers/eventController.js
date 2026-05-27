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

/**
 * @route   GET /api/events/:id
 * @desc    Get event detail by ID
 * @access  Public
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id).populate(
      "createdBy",
      "username fullName avatar"
    );

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Build response, exclude full participants array to keep it clean
    // but include registered count
    const responseData = event.toObject();

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching event detail:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getEvents,
  getEventById,
};
