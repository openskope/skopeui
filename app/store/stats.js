import { std, mean, median } from "mathjs";

const EMPTY_SUMMARY_STATISTICS = {
  stdDev: "N/A",
  mean: "N/A",
  median: "N/A",
};

const DEFAULT_PRECISION = 2;

export function summarize(timeseries) {
  // returns { stdDev, mean, median }
  const values = timeseries.y;
  if (values.length === 0) {
    return EMPTY_SUMMARY_STATISTICS;
  }
  const precision = timeseries.precision ?? DEFAULT_PRECISION;
  return {
    stdDev: std(values).toPrecision(precision),
    mean: mean(values).toPrecision(precision),
    median: median(values).toPrecision(precision),
  };
}

export function filterTimeSeries({ timeseries, temporalRange, minYear }) {
  console.log("filtering timeseries: ", timeseries);
  if (timeseries.x.length > 0) {
    const minOffset = temporalRange[0] - minYear;
    const maxOffset = temporalRange[1] - minYear;
    const x = timeseries.x.slice(minOffset, maxOffset);
    const y = timeseries.y.slice(minOffset, maxOffset);
    return { x, y, name: timeseries.options.name };
  } else {
    return { x: [], y: [] };
  }
}

export function toISODate(year) {
  return `${year.toString().padStart(4, "0")}-01-01`;
}

export function extractYear(isoDateString) {
  // FIXME: brittle, do some error handling / checking
  return parseInt(isoDateString.split("-")[0]);
}
