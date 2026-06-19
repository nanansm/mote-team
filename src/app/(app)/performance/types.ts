import type { KolAggregate } from "@/lib/kol";
import type { MetaPerf } from "@/lib/meta";
import type { GmbSummary, PlatformSummary, TopPost } from "@/lib/windsor";

export type IgData = {
  current: PlatformSummary;
  previous: PlatformSummary;
  top: TopPost[];
};

export type TiktokData = {
  current: PlatformSummary;
  previous: PlatformSummary;
  top: TopPost[];
};

export type GmbData = {
  current: GmbSummary;
  previous: GmbSummary;
};

export type KolTopLite = {
  id: string;
  username: string;
  link: string | null;
  interaction: number;
  er: number;
};

export type KolData = {
  aggregate: KolAggregate;
  top: KolTopLite[];
};

export type ClientData = {
  id: string;
  name: string;
  ig: IgData | null;
  tiktok: TiktokData | null;
  gmb: GmbData | null;
  meta: MetaPerf | null;
  kol: KolData | null;
};
