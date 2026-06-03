const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "cancelled"],
      required: true,
      default: "registered",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    speakerName: {
      type: String,
      default: null,
    },
    organizerName: {
      type: String,
      default: null,
    },
    contactEmail: {
      type: String,
      default: null,
      trim: true,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image"],
          default: "image",
        },
      },
    ],
    eventType: {
      type: String,
      enum: ["workshop", "talkshow", "webinar", "community_event", null],
      default: null,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    meetingLink: {
      type: String,
      default: null,
    },
    capacity: {
      type: Number,
      default: null,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    participants: [participantSchema],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ status: 1 });
eventSchema.index({ startDateTime: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ "participants.userId": 1 });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
