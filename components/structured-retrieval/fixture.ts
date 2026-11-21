/**
 * Shared synthetic fixture for every figure in the structured-retrieval article.
 * Campaigns, creators, and metrics are invented; none describe customer data.
 */

export type CampaignId = "cedar" | "birch";
export type Platform = "TikTok" | "Instagram";

export const campaigns: Record<CampaignId, { name: string; tone: "model" | "user" }> = {
  cedar: { name: "Cedar launch", tone: "model" },
  birch: { name: "Birch launch", tone: "user" },
};

export const creators = {
  mara: "@mara.studio",
  juno: "@juno.eats",
  theo: "@theo.moves",
} as const;

export type CreatorId = keyof typeof creators;

export interface Post {
  id: string;
  campaign: CampaignId;
  creator: CreatorId;
  platform: Platform;
  views: number;
  interactions: number;
}

export const posts: Post[] = [
  { id: "c1", campaign: "cedar", creator: "mara", platform: "TikTok", views: 18400, interactions: 736 },
  { id: "c2", campaign: "cedar", creator: "mara", platform: "TikTok", views: 9200, interactions: 506 },
  { id: "c3", campaign: "cedar", creator: "juno", platform: "TikTok", views: 26100, interactions: 783 },
  { id: "c4", campaign: "cedar", creator: "juno", platform: "TikTok", views: 12800, interactions: 704 },
  { id: "c5", campaign: "cedar", creator: "theo", platform: "TikTok", views: 31500, interactions: 882 },
  { id: "c6", campaign: "cedar", creator: "theo", platform: "TikTok", views: 7600, interactions: 494 },
  { id: "c7", campaign: "cedar", creator: "mara", platform: "Instagram", views: 14200, interactions: 923 },
  { id: "c8", campaign: "cedar", creator: "juno", platform: "Instagram", views: 8900, interactions: 418 },
  { id: "b1", campaign: "birch", creator: "mara", platform: "TikTok", views: 22300, interactions: 1137 },
  { id: "b2", campaign: "birch", creator: "theo", platform: "TikTok", views: 15700, interactions: 659 },
  { id: "b3", campaign: "birch", creator: "juno", platform: "Instagram", views: 11400, interactions: 593 },
  { id: "b4", campaign: "birch", creator: "theo", platform: "Instagram", views: 6800, interactions: 279 },
];

export const postById = Object.fromEntries(posts.map((post) => [post.id, post])) as Record<string, Post>;

/** Interactions divided by views: the example definition used throughout the article. */
export const rate = (post: Pick<Post, "views" | "interactions">) => post.interactions / post.views;

export const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export const num = (value: number) => value.toLocaleString("en-US");

export const postLabel = (post: Post) => `${creators[post.creator]} · ${post.platform}`;

/** Strategies compared in the controlled synthetic benchmark. */
export const strategies = [
  { id: "A", name: "Raw rows" },
  { id: "B", name: "Campaign summaries only" },
  { id: "C", name: "Metadata-enriched rows" },
  { id: "D", name: "Dual tier" },
  { id: "E", name: "Multi-tier hierarchical" },
] as const;

export type StrategyId = (typeof strategies)[number]["id"];
