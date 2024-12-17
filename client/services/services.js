import { API_URL, CPU_USAGE_ENDPOINT } from "../config.js";

//Sending the request to the client side and receiving CPU consumption data from the server
export async function fetchData(ipAddress, startTime, endTime, period) {
  const response = await fetch(`${API_URL}${CPU_USAGE_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instanceId: ipAddress,
      startTime,
      endTime,
      period,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}
