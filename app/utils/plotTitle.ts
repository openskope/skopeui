/**
 * Splits a title longer than `maxLineLength` into two Plotly lines, at the
 * space nearest its middle. A title with no space stays on one line.
 */
export function wrapPlotTitle(title: string, maxLineLength: number): string {
  if (title.length <= maxLineLength) return title;
  const middle = title.length / 2;
  let split = -1;
  for (let i = 0; i < title.length; i++) {
    if (
      title[i] === " " &&
      (split < 0 || Math.abs(i - middle) < Math.abs(split - middle))
    ) {
      split = i;
    }
  }
  if (split < 0) return title;
  return `${title.slice(0, split)}<br>${title.slice(split + 1)}`;
}
