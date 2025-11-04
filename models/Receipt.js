// models/Receipt.js
const mongoose = require("mongoose");
const Counter = require("./Counter");

const receiptSchema = new mongoose.Schema({
  groupName: String,
  customerName: String,
  mobile: String,
  collectionDate: String,
  receiptNo: String,
  cashAmount: String,
  onlineAmount: String,
  collectionAgent: String,
  receivedTo: String,
});

// ✅ Auto-increment
receiptSchema.pre("save", async function (next) {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "receiptCounter" },
      { $inc: { seq: 1 } },      // ✅ increase by 1
      { new: true, upsert: true }
    );

    this.receiptNo = `RCPT-${counter.seq}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Receipt", receiptSchema);
