const express = require("express");
const router = express.Router();
const Receipt = require("../models/Receipt");
const Counter = require("../models/Counter");

// ✅ Get next available receipt number
router.get("/next", async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "receiptCounter" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    res.status(200).json({ nextReceiptNo: `RCPT-${counter.seq}` });
  } catch (error) {
    console.error("❌ Error fetching next receipt number:", error);
    res.status(500).json({ error: "Failed to fetch next receipt number" });
  }
});

// ✅ Save receipt
router.post("/save", async (req, res) => {
  try {
    const newReceipt = new Receipt(req.body);
    await newReceipt.save();
    res.status(200).json({
      message: "✅ Receipt saved successfully!",
      receipt: newReceipt,
    });
  } catch (error) {
    console.error("❌ Error saving receipt:", error);
    res.status(500).json({ error: "Failed to save receipt" });
  }
});

// ✅ Fetch unique group names
router.get("/groups", async (req, res) => {
  try {
    const groups = await Receipt.distinct("groupName");
    res.status(200).json(groups);
  } catch (error) {
    console.error("❌ Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch group names" });
  }
});
// ✅ Get total collections by agent
router.get("/agent/:name/total", async (req, res) => {
  try {
    const { name } = req.params;

    const receipts = await Receipt.find({ collectionAgent: name });

    let totalCash = 0;
    let totalOnline = 0;

    receipts.forEach((r) => {
      totalCash += parseFloat(r.cashAmount || 0);
      totalOnline += parseFloat(r.onlineAmount || 0);
    });

    res.status(200).json({
      totalCash,
      totalOnline,
      totalCollected: totalCash + totalOnline,
    });
  } catch (error) {
    console.error("❌ Error fetching agent totals:", error);
    res.status(500).json({ error: "Failed to fetch total collections" });
  }
});


module.exports = router;
