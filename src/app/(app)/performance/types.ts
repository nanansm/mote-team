import type { MetaPerf } from "@/lib/meta";
import type { PlatformSummary, TopPost } from "@/lib/windsor";

export type IgData = {
  current: PlatformSummary;
  previous: PlatformSummary;
  top: TopPost[];
};

export type TiktokData = {
  current: PlatformSummary;
  previous: PlatformSummary;
};

export type ClientData = {
  id: string;
  name: string;
  ig: IgData | null;
  tiktok: TiktokData | null;
  meta: MetaPerf | null;
};
