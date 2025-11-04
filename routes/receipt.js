const express = require("express");
const router = express.Router();
const Receipt = require("../models/Receipt");
const Counter = require("../models/Counter");

// /api/receipt/next  (peek only, does NOT increment)
router.get("/next", async (req, res) => {
  try {
    const counter = await Counter.findOne({ name: "receiptCounter" });
    const next = (counter?.seq ?? 0) + 1;
    res.json({ nextReceiptNo: `RCPT-${next}` });
  } catch (error) {
    console.error("❌ /next error:", error);
    res.status(500).json({ error: "Failed to get next receipt number" });
  }
});

// ✅ Save receipt (pre-save hook assigns receiptNo)
router.post("/save", async (req, res) => {
  try {
    // (optional) normalize agent name on write to reduce mismatches
    if (typeof req.body.collectionAgent === "string") {
      req.body.collectionAgent = req.body.collectionAgent.trim();
    }

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
// Optional query: ?date=DD-MM-YYYY  (filters by collectionDate)
router.get("/agent/:name/total", async (req, res) => {
  try {
    const raw = req.params.name ?? "";
    const nameTrim = decodeURIComponent(raw).trim();
    const { date } = req.query; // expected format "DD-MM-YYYY"

    // escape regex special chars for safety
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const matchAgent = {
      collectionAgent: { $regex: `^${escapeRegex(nameTrim)}$`, $options: "i" },
    };

    const matchDate = typeof date === "string" && date.trim()
      ? { collectionDate: date.trim() }
      : {};

    const match = { ...matchAgent, ...matchDate };

    const receipts = await Receipt.find(match).select("cashAmount onlineAmount");

    let totalCash = 0;
    let totalOnline = 0;

    for (const r of receipts) {
      totalCash += Number.parseFloat(r.cashAmount || 0) || 0;
      totalOnline += Number.parseFloat(r.onlineAmount || 0) || 0;
    }

    res.status(200).json({
      totalCash,
      totalOnline,
      totalCollected: totalCash + totalOnline,
      filter: {
        agent: nameTrim,
        date: date?.trim() || null,
      },
      count: receipts.length,
    });
  } catch (error) {
    console.error("❌ Error fetching agent totals:", error);
    res.status(500).json({ error: "Failed to fetch total collections" });
  }
});

module.exports = router;
