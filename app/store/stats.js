import { std, mean, median } from "mathjs";

const EMPTY_SUMMARY_STATISTICS = {
  stdDev: "N/A",
  mean: "N/A",
  median: "N/A",
};

export function summarize(timeseries) {
  // returns { stdDev, mean, median }
  const values = timeseries.y;
  if (values.length === 0) {
    return EMPTY_SUMMARY_STATISTICS;
  }
  return {
    stdDev: std(values).toFixed(6),
    mean: mean(values).toFixed(6),
    median: median(values).toFixed(6),
  };
}

export function filterTimeSeries({ timeseries, temporalRange, minYear }) {
  if (timeseries.x.length > 0) {
    const minOffset = temporalRange[0] - minYear;
    const maxOffset = temporalRange[1] - minYear;
    const x = timeseries.x.slice(minOffset, maxOffset);
    const y = timeseries.y.slice(minOffset, maxOffset);
    return { x, y };
  } else {
    return { x: [], y: [] };
  }
}
