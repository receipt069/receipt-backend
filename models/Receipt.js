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

// ✅ Auto-increment receipt number ONLY on save()
receiptSchema.pre("save", async function (next) {
  if (this.receiptNo) return next(); // allow overriding manually

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "receiptCounter" },
      { $inc: { seq: 1 } },          // ✅ increment by 1
      { new: true, upsert: true }    // return updated value
    );

    this.receiptNo = `RCPT-${counter.seq}`;
    next();
  } catch (err) {
    console.error("❌ Error generating receipt number:", err);
    next(err);
  }
});

module.exports = mongoose.model("Receipt", receiptSchema);
