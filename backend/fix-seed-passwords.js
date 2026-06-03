/**
 * One-time fix: update demo user password hashes to match Admin@123 / User@123.
 * Run: node fix-seed-passwords.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const HASHES = {
  "admin@soul.com": "$2b$10$aZNR27yMewRS93tPRdlm5OC7oVeHJqM.WoySg0L2Z0K.nBFWEToYO",
  "user1@soul.com": "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
  "user2@soul.com": "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const [email, passwordHash] of Object.entries(HASHES)) {
    const result = await User.updateOne({ email }, { $set: { passwordHash } });
    console.log(email, "-> matched:", result.matchedCount, "modified:", result.modifiedCount);
  }
  await mongoose.disconnect();
  console.log("Done. You can login with Admin@123 / User@123 now.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
