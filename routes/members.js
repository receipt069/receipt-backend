const express = require("express");
const router = express.Router();
const Members = require("../models/Members"); // 👈 this model refers to members collection

// GET /api/members/search?group=MARUTHI&search=COM
router.get("/search", async (req, res) => {
  try {
    const { group, search } = req.query;

    if (!group) return res.status(400).json([]);

    const filter = { groupName: group };

    if (search && search.trim()) {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.personName = { $regex: new RegExp(escapeRegex(search), "i") };
    }

    const members = await Members.find(filter)
      .select("personName personMobile")
      .limit(20);

    res.json(members);
  } catch (error) {
    console.error("❌ Error searching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

module.exports = router;
