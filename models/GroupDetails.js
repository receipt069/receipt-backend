const mongoose = require("mongoose");

const groupDetailsSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    noOfMonths: String,
    premiumAmount: String,
    perPersonPremium: String,
    dateCreated: Date,
  },
  {
    timestamps: true,
    collection: "group_details", // 👈 must EXACTLY match your collection name
  }
);

module.exports = mongoose.model("GroupDetails", groupDetailsSchema);
