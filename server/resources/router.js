const express = require("express");
const { getInstanceIdFromIP } = require("../services/ec2Service");
const { getCPUUtilization } = require("../services/cloudWatchService");

const router = express.Router();

// Handle POST request to get CPU usage data based on instance ID, time range, and period
router.post("/cpu-usage", async (req, res) => {
  const { instanceId, startTime, endTime, period } = req.body;

  try {
    const ipAddress = await getInstanceIdFromIP(instanceId);

    const data = await getCPUUtilization(
      ipAddress,
      new Date(startTime),
      new Date(endTime),
      period
    );

    res.json({
      Timestamps: data.Timestamps,
      Values: data.Values,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing request",
      error: error.message,
    });
  }
});

module.exports = router;
