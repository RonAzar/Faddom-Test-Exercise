import { fetchData } from "./services/services.js";
import { plotGraph } from "./graph_functions.js";
import { validatePeriod } from "./helpers_functions.js";

document.getElementById("loadButton").addEventListener("click", function () {
  const period = parseInt(document.getElementById("period").value);
  const ipAddress = document.getElementById("ipAddress").value;
  const timePeriod = document.getElementById("timePeriod").value;

  if (isNaN(period) || period <= 0) {
    alert("Please enter a valid sample interval in seconds");
    return;
  } else if (!validatePeriod(period, timePeriod)) {
    return;
  }
  if (ipAddress == "") {
    alert("Please fill ip address field");
    return;
  }

  loadCPUData(ipAddress, timePeriod, period);
});

// Fetches and plots CPU data based on the selected IP, time period, and sample interval
function loadCPUData(ipAddress, timePeriod, period) {
  const endTime = new Date();
  const startTime = new Date();

  switch (timePeriod) {
    case "1":
      startTime.setDate(endTime.getDate() - 1);
      break;
    case "7":
      startTime.setDate(endTime.getDate() - 7);
      break;
    case "30":
      startTime.setMonth(endTime.getMonth() - 1);
      break;
    case "365":
      startTime.setFullYear(endTime.getFullYear() - 1);
      break;
    default:
      alert("Invalid time period selected");
      return;
  }

  fetchData(ipAddress, startTime.toISOString(), endTime.toISOString(), period)
    .then((data) => plotGraph(data))
    .catch((error) => {
      alert("Error fetching data:", error);
    });
}
