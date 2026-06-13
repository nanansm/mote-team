/** Shared date-range resolver for Performance (drives Windsor + Meta).
 *  All windows are computed in WIB (Asia/Jakarta) — see lib/tz. Pure. */
import {
  firstOfMonth,
  jakartaMidnight,
  jakartaParts,
  todayJakarta,
  ymdJakarta,
  ymdOffset,
} from "./tz";

export type DateWindow = { from: string; to: string };
export type ResolvedRange = {
  current: DateWindow;
  previous: DateWindow;
  /** IG follower_count_1d only supports the last 30 days. */
  includeFollowerDelta: boolean;
};

const DAY = 86_400_000;

export function resolveRange(preset: string): ResolvedRange {
  const today = todayJakarta();
  const back = (n: number) => ymdOffset(-n);
  const { year, month } = jakartaParts();

  let from: string;
  let to: string;
  switch (preset) {
    case "today":
      from = today;
      to = today;
      break;
    case "yesterday":
      from = back(1);
      to = back(1);
      break;
    case "last_7d":
      from = back(6);
      to = today;
      break;
    case "last_14d":
      from = back(13);
      to = today;
      break;
    case "last_28d":
      from = back(27);
      to = today;
      break;
    case "last_30d":
      from = back(29);
      to = today;
      break;
    case "last_month": {
      const pm = month === 1 ? 12 : month - 1;
      const py = month === 1 ? year - 1 : year;
      from = firstOfMonth(py, pm);
      // day before the 1st of this month = last day of previous month
      to = ymdOffset(-1, jakartaMidnight(firstOfMonth(year, month)));
      break;
    }
    case "maximum":
      from = back(364);
      to = today;
      break;
    case "this_month":
    default:
      from = firstOfMonth(year, month);
      to = today;
      break;
  }
  return resolveCustom(from, to);
}

export function resolveCustom(from: string, to: string): ResolvedRange {
  const fromD = jakartaMidnight(from);
  const toD = jakartaMidnight(to);
  const lenDays = Math.max(
    1,
    Math.round((toD.getTime() - fromD.getTime()) / DAY) + 1,
  );
  const prevTo = new Date(fromD.getTime() - DAY);
  const prevFrom = new Date(prevTo.getTime() - (lenDays - 1) * DAY);
  return {
    current: { from, to },
    previous: { from: ymdJakarta(prevFrom), to: ymdJakarta(prevTo) },
    includeFollowerDelta: Date.now() - fromD.getTime() <= 31 * DAY,
  };
}
