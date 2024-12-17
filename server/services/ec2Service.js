const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate the EC2 instance ID associated with a given private IP address.
const getInstanceIdFromIP = async (ipAddress) => {
  const params = {
    Filters: [
      {
        Name: "private-ip-address",
        Values: [ipAddress],
      },
    ],
  };

  try {
    const command = new DescribeInstancesCommand(params);
    const response = await ec2Client.send(command);

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

module.exports = { getInstanceIdFromIP };
