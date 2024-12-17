import { formatTimestamps } from "./helpers_functions.js";

let chartInstance = null;

//Generates a graph based on cpu usage data received from the cloud
export function plotGraph(data) {
  const ctx = document.getElementById("cpuUsageChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = formatTimestamps(data.Timestamps);

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Metric Data",
          data: data.Values,
          borderColor: "red",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Percentage",
          },
          ticks: {
            stepSize: 0.5,
          },
        },
      },
    },
  });
}
