//Generates a uniform format for each timestamp so that the nearest round hour is displayed next to am/pm depending on the time.
export function formatTimestamps(timestamps) {
  return timestamps.map((timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    if (hours != 12) {
      hours = hours % 12;
    }

    return `${hours} ${ampm}`;
  });
}

//The function checks that the period is correct according to Amazon's CloudWatch guidelines.
export function validatePeriod(period, timePeriod) {
  switch (true) {
    case period < 60 && timePeriod > 1:
      alert(
        "Data points with a period of less than 60 seconds are only available for 3 hours."
      );
      return false;

    case period === 60 && timePeriod > 15:
      alert(
        "Data points with a period of 60 seconds (1-minute) are only available for 15 days."
      );
      return false;

    case period === 300 && timePeriod > 63:
      alert(
        "Data points with a period of 300 seconds (5-minute) are only available for 63 days."
      );
      return false;

    case period === 3600 && timePeriod > 455:
      alert(
        "Data points with a period of 3600 seconds (1 hour) are only available for 455 days (15 months)."
      );
      return false;

    default:
      return true;
  }
}
