/**
 * Shared shapes for organic social performance (IG / TikTok / GMB). Kept
 * source-agnostic so the data providers (instagram.ts, repliz.ts, gmb.ts) and
 * the view layer don't depend on any one connector.
 */

export type PlatformSummary = {
  reach: number;
  views: number;
  engagement: number;
  newFollowers: number;
  followers: number;
  /** engagement rate % = engagement / reach */
  er: number;
};

export type TopPost = {
  permalink: string;
  type: string;
  engagement: number;
  reach: number;
  thumbnail: string | null;
};

/** Google Business Profile (Maps) metrics — discovery + actions + reviews. */
export type GmbSummary = {
  impressions: number;
  calls: number;
  websiteClicks: number;
  directions: number;
  foodOrders: number;
  /** Total average star rating (snapshot, not windowed). */
  rating: number;
  /** Total review count (snapshot). */
  reviews: number;
};

export type IgPerf = {
  current: PlatformSummary;
  previous: PlatformSummary;
  top: TopPost[];
};
export type TiktokPerf = {
  current: PlatformSummary;
  previous: PlatformSummary;
  top: TopPost[];
};
export type GmbPerf = { current: GmbSummary; previous: GmbSummary };
