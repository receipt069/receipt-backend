const mongoose = require("mongoose");

const membersSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    personName: { type: String, required: true },
    personMobile: { type: String, required: true },
    personAddress: String,
    aadharPath: String,
    personPremium: String,
    premiumMonths: String,
    referenceName: String,
    referenceContact: String,
  },
  {
    timestamps: true,
    collection: "members", // 👈 must match your collection name exactly
  }
);

module.exports = mongoose.model("Members", membersSchema);
