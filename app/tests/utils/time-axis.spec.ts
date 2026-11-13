import { describe, expect, it } from "vitest";

import type { Time } from "@/types/metadata";
import {
  axisYears,
  resolveTemporalLabels,
  stepAlongAxis,
  stepFromText,
  timeCoverageLabel,
  timeSpan,
  timestepKey,
  yearOfTimestep,
} from "@/utils/timeAxis";

const annual: Time = {
  kind: "regular",
  precision: "year",
  count: 1898,
  origin: "0103",
  end: "2000",
  step: "P1Y",
  values: null,
};

describe("time axis labels", () => {
  it("defaults annual presentation to Year and Current year", () => {
    expect(resolveTemporalLabels(annual)).toEqual({
      axis: "Year",
      current: "Current year",
    });
  });

  it.each([undefined, null, { precision: "month" }, { precision: "unknown" }])(
    "uses neutral presentation labels without a supported precision: %j",
    (time) => {
      expect(resolveTemporalLabels(time)).toEqual({
        axis: "Time",
        current: "Current time",
      });
    },
  );

  it("accepts explicit presentation labels without changing the time axis", () => {
    const before = structuredClone(annual);
    expect(
      resolveTemporalLabels(annual, {
        axis_label: " Year (CE) ",
        current_label: " Displayed year ",
      }),
    ).toEqual({ axis: "Year (CE)", current: "Displayed year" });
    expect(annual).toEqual(before);
  });

  it("falls back independently for missing, null, or blank labels", () => {
    expect(
      resolveTemporalLabels(annual, { axis_label: "Calendar year" }),
    ).toEqual({
      axis: "Calendar year",
      current: "Current year",
    });
    expect(
      resolveTemporalLabels(annual, { axis_label: null, current_label: "  " }),
    ).toEqual({
      axis: "Year",
      current: "Current year",
    });
    expect(
      resolveTemporalLabels(annual, {
        axis_label: "",
        current_label: "Map year",
      }),
    ).toEqual({
      axis: "Year",
      current: "Map year",
    });
  });

  it("reads the year of a key or an ISO date", () => {
    expect(yearOfTimestep("0103")).toBe(103);
    expect(yearOfTimestep("0590-01-01")).toBe(590);
  });

  it("spans the first and last years of the axis", () => {
    expect(timeSpan(annual)).toEqual([103, 2000]);
  });

  it("labels the coverage with the step", () => {
    expect(timeCoverageLabel(annual)).toBe("103–2000 CE, annual");
  });

  it("labels a single year without a range or unknown step", () => {
    expect(
      timeCoverageLabel({ ...annual, origin: "2009", end: "2009", step: null }),
    ).toBe("2009 CE");
  });
});

describe("time axis steps", () => {
  it("keys a year with four digits", () => {
    expect(timestepKey(590)).toBe("0590");
    expect(timestepKey(2000)).toBe("2000");
  });

  it("lists every year of a regular annual axis", () => {
    const years = axisYears({ ...annual, origin: "0103", end: "0106" });
    expect(years).toEqual([103, 104, 105, 106]);
  });

  it("lists the years of an enumerated axis", () => {
    const years = axisYears({
      ...annual,
      kind: "enumerated",
      step: null,
      values: ["1900", "1950", "2000"],
    });
    expect(years).toEqual([1900, 1950, 2000]);
  });

  it("steps along the axis within the selected range", () => {
    const years = [1900, 1950, 2000, 2050];
    expect(stepAlongAxis(years, 1950, 1, [1900, 2050])).toBe(2000);
    expect(stepAlongAxis(years, 1950, -1, [1900, 2050])).toBe(1900);
    expect(stepAlongAxis(years, 2000, 1, [1900, 2000])).toBe(2000);
    expect(stepAlongAxis(years, 1960, 1, [1900, 2050])).toBe(2000);
  });

  it("reads a typed year within the selected range", () => {
    const years = [1900, 1950, 2000, 2050];
    expect(stepFromText(years, " 1950 ", [1900, 2050])).toBe(1950);
    expect(stepFromText([590, 591], "0590", [590, 591])).toBe(590);
  });

  it("moves a typed year missing from the axis to the one before it", () => {
    expect(stepFromText([1900, 1950, 2000], "1960", [1900, 2000])).toBe(1950);
  });

  it("rejects text that isn't a year in the selected range", () => {
    const years = [1900, 1950, 2000];
    expect(stepFromText(years, "2050", [1900, 2000])).toBeNull();
    expect(stepFromText(years, "1850", [1900, 2000])).toBeNull();
    expect(stepFromText(years, "abc", [1900, 2000])).toBeNull();
    expect(stepFromText(years, "", [1900, 2000])).toBeNull();
  });
});
