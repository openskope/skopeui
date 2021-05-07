import { std, mean, median } from "mathjs";

const EMPTY_SUMMARY_STATISTICS = {
  stdDev: "N/A",
  mean: "N/A",
  median: "N/A",
};

const DEFAULT_PRECISION = 2;

/**
 * Returns an object structure with { stdDev, mean, median } statistics for
 * the given timeseries.
 * @param {*} timeseries
 * @returns  {stdDev, mean, median} over the given timeseries
 */
export function summarize(timeseries) {
  // FIXME: replacing null values with 0 may work for some data but not all
  // need to clarify how to handle NODATA
  const values = timeseries.y.map((v) => (v == null ? 0 : v));
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
