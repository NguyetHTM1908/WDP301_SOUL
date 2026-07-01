const mongoose = require("mongoose");

function normalizeLocationKey(location, meetingLink, eventMode) {
  if (eventMode === "online") {
    return meetingLink && String(meetingLink).trim()
      ? `online:${String(meetingLink).trim().toLowerCase()}`
      : "online";
  }

  return location && String(location).trim()
    ? `offline:${String(location).trim().toLowerCase().replace(/\s+/g, " ")}`
    : "offline";
}

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
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
  {
    _id: false,
  }
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
      trim: true,
    },

    speakerName: {
      type: String,
      default: null,
      trim: true,
    },

    organizerName: {
      type: String,
      default: null,
      trim: true,
    },

    contactEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },

    bannerImage: {
      type: String,
      default: null,
      trim: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
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

    eventMode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
      default: "offline",
    },

    startDateTime: {
      type: Date,
      required: true,
    },

    endDateTime: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      default: null,
      trim: true,
    },

    meetingLink: {
      type: String,
      default: null,
      trim: true,
    },

    locationKey: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      default: null,
      min: 1,
    },

    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    participants: {
      type: [participantSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedReason: {
      type: String,
      default: null,
      trim: true,
    },

    lockAfterApproval: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "events",
  }
);

/**
 * Không dùng function(next) nữa để tránh lỗi:
 * next is not a function
 */
eventSchema.pre("validate", function () {
  this.locationKey = normalizeLocationKey(
    this.location,
    this.meetingLink,
    this.eventMode
  );
});

eventSchema.index({ approvalStatus: 1, status: 1, startDateTime: 1 });
eventSchema.index({ eventMode: 1 });
eventSchema.index({ locationKey: 1, startDateTime: 1, endDateTime: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ "participants.userId": 1 });

module.exports = mongoose.model("Event", eventSchema);