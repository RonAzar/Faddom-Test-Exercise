const {
  CloudWatchClient,
  GetMetricDataCommand,
} = require("@aws-sdk/client-cloudwatch");

const cloudWatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

//Executing the SDK to the cloud after, looking at the documentation, discerning which variables need to be sent
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
          Period: period,
          Stat: "Maximum",
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
    return data.MetricDataResults[0];
  } catch (error) {
    console.error("Error fetching CloudWatch data:", error);
    throw error;
  }
};

module.exports = { getCPUUtilization };
