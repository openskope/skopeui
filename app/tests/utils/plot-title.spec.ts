import { describe, expect, it } from "vitest";

import { wrapPlotTitle } from "@/utils/plotTitle";

describe("wrapPlotTitle", () => {
  it("keeps a short title on one line", () => {
    expect(wrapPlotTitle("Water-year (Oct–Sept) Precipitation (mm)", 44)).toBe(
      "Water-year (Oct–Sept) Precipitation (mm)",
    );
  });

  it("splits a long title at the space nearest its middle", () => {
    expect(
      wrapPlotTitle(
        "Water-year (Oct–Sept) Cotton Growing Degree Days (°C GDD)",
        44,
      ),
    ).toBe("Water-year (Oct–Sept) Cotton<br>Growing Degree Days (°C GDD)");
  });

  it("keeps a long title with no space on one line", () => {
    expect(wrapPlotTitle("a".repeat(50), 44)).toBe("a".repeat(50));
  });
});
