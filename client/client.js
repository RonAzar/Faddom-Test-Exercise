document.getElementById("loadButton").addEventListener("click", function () {
  const period = parseInt(document.getElementById("period").value);
  const ipAddress = document.getElementById("ipAddress").value;
  const timePeriod = document.getElementById("timePeriod").value;

  if (isNaN(period) || period <= 0) {
    alert("Please enter a valid sample interval in seconds");
    return;
  }

  if (ipAddress == "") {
    alert("Please fill ip address field");
    return;
  }

  loadCPUData(ipAddress, timePeriod, period);
});

function loadCPUData(ipAddress, timePeriod, period) {
  //Setting the current time in the 2 variables
  const endTime = new Date();
  const startTime = new Date();

  if (timePeriod === "1") {
    startTime.setDate(endTime.getDate() - 1);
  } else if (timePeriod === "7") {
    startTime.setDate(endTime.getDate() - 7);
  } else if (timePeriod === "30") {
    startTime.setMonth(endTime.getMonth() - 1);
  } else if (timePeriod === "365") {
    startTime.setFullYear(endTime.getFullYear() - 1);
  }

  fetchDataAndPlotGraph(
    ipAddress,
    startTime.toISOString(),
    endTime.toISOString(),
    period
  );
}

//להעביר ל-service
function fetchDataAndPlotGraph(ipAddress, startTime, endTime, period) {
  fetch(`http://localhost:3000/cpu-usage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instanceId: ipAddress,
      startTime: startTime,
      endTime: endTime,
      period: period,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      plotGraph(data);
    })
    .catch((error) => {
      alert("Error fetching data:", error);
    });
}

function plotGraph(data) {
  const ctx = document.getElementById("cpuUsageChart").getContext("2d");

  const labels = data.Timestamps.map((timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours} ${ampm}`;
  });

  new Chart(ctx, {
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
