const mongoose = require("mongoose");

function normalizeLocationKey(location, meetingLink) {
  const raw =
    location && String(location).trim()
      ? String(location).trim()
      : meetingLink && String(meetingLink).trim()
      ? `online:${String(meetingLink).trim()}`
      : "online";

  return raw.toLowerCase().replace(/\s+/g, " ").trim();
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

    startDateTime: {
      type: Date,
      required: true,
      index: true,
    },

    endDateTime: {
      type: Date,
      required: true,
      index: true,
    },

    location: {
      type: String,
      default: null,
      trim: true,
    },

    locationKey: {
      type: String,
      required: true,
      index: true,
    },

    meetingLink: {
      type: String,
      default: null,
      trim: true,
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

    // Trạng thái thời gian của event
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },

    // Trạng thái duyệt bởi admin
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
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
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "events",
  }
);

eventSchema.pre("validate", function (next) {
  this.locationKey = normalizeLocationKey(this.location, this.meetingLink);
  next();
});

eventSchema.index({ approvalStatus: 1, status: 1, startDateTime: 1 });
eventSchema.index({ locationKey: 1, startDateTime: 1, endDateTime: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ "participants.userId": 1 });

module.exports = mongoose.model("Event", eventSchema);