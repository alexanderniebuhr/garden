export const POST_STATES = [
	"experimental",
	"building",
	"idea",
	"sharing",
	"final",
] as const;

export type PostState = (typeof POST_STATES)[number];

export interface StateMeta {
	readonly label: string;
	readonly description: string;
	readonly hex: string;
	readonly pixi: number;
}

export const STATE_META: Record<PostState, StateMeta> = {
	experimental: {
		label: "Experimental",
		description: "Early seedling — a raw idea, just planted.",
		hex: "#F59E0B",
		pixi: 0xf59e0b,
	},
	building: {
		label: "Developing",
		description: "Growing — being actively worked on.",
		hex: "#3B82F6",
		pixi: 0x3b82f6,
	},
	idea: {
		label: "Understanding",
		description: "Maturing — deepening insight on the topic.",
		hex: "#A855F7",
		pixi: 0xa855f7,
	},
	sharing: {
		label: "Sharing",
		description: "Ready to share — polished enough for others.",
		hex: "#22C55E",
		pixi: 0x22c55e,
	},
	final: {
		label: "Final",
		description: "Evergreen — considered complete.",
		hex: "#06B6D4",
		pixi: 0x06b6d4,
	},
};
