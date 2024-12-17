require("dotenv").config(); // טוען משתני סביבה מ-.env
const express = require("express");
const cors = require("cors");

// AWS SDK ייבוא המחלקות הנדרשות
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const {
  CloudWatchClient,
  GetMetricDataCommand,
} = require("@aws-sdk/client-cloudwatch");

// יצירת קליינטים של AWS באמצעות משתני הסביבה
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const cloudWatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = express();
app.use(express.json());
app.use(cors());

// ===============================
// פונקציה להמרת IP ל-Instance ID
// ===============================
const getInstanceIdFromIP = async (ipAddress) => {
  const params = {
    Filters: [
      {
        Name: "private-ip-address", // פילטר לפי כתובת IP פרטית
        Values: [ipAddress],
      },
    ],
  };

  try {
    const command = new DescribeInstancesCommand(params);
    const response = await ec2Client.send(command);

    // אם נמצאו מופעים, נשלוף את ה-Instance ID
    if (
      response.Reservations &&
      response.Reservations.length > 0 &&
      response.Reservations[0].Instances.length > 0
    ) {
      const instanceId = response.Reservations[0].Instances[0].InstanceId;
      return instanceId;
    } else {
      throw new Error(`No instance found for IP address: ${ipAddress}`);
    }
  } catch (error) {
    console.error("Error fetching Instance ID:", error);
    throw error;
  }
};

// ===============================
// פונקציה לשליפת CPUUtilization
// ===============================
const getCPUUtilization = async (instanceId, startTime, endTime, period) => {
  const params = {
    MetricDataQueries: [
      {
        Id: "cpuUsage",
        MetricStat: {
          Metric: {
            Namespace: "AWS/EC2",
            MetricName: "CPUUtilization",
            Dimensions: [
              {
                Name: "InstanceId",
                Value: instanceId,
              },
            ],
          },
          Period: period, // מרווח דגימה
          Stat: "Average", // ממוצע נתונים
        },
        ReturnData: true,
      },
    ],
    StartTime: startTime,
    EndTime: endTime,
  };

  try {
    const command = new GetMetricDataCommand(params);
    const data = await cloudWatchClient.send(command);
    return data.MetricDataResults[0]; // מחזיר את התוצאות בלבד
  } catch (error) {
    console.error("Error fetching CloudWatch data:", error);
    throw error;
  }
};

// ===============================
// Route - API לקריאה מהלקוח
// ===============================
app.post("/cpu-usage", async (req, res) => {
  const { instanceId, startTime, endTime, period } = req.body;

  try {
    // שלב 1: המרת IP ל-Instance ID
    const ipAddress = await getInstanceIdFromIP(instanceId);

    // שלב 2: שליפת נתוני CPUUtilization מ-CloudWatch
    const data = await getCPUUtilization(
      ipAddress,
      new Date(startTime),
      new Date(endTime),
      period
    );

    // שלב 3: החזרת התוצאה בפורמט ידידותי
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

// ===============================
// הפעלת השרת
// ===============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
