import { z } from "zod";

/**
 * Frontmatter structure for a person/contact in the CRM
 * Uses dynamic property names that can be configured in settings
 */
export interface PersonFrontmatter {
	// Core Identity
	segment?: string;
	city?: string;
	"original-city"?: string;
	"born-on"?: string;

	// Contact Information
	"first-contact"?: string;
	"second-contact"?: string;
	"last-contact"?: string;
	"contact-channel"?: string;

	// Business/Professional
	position?: string;
	status?: string;
	"status-business"?: string;
	"told-about-business"?: boolean | string;
	urgency?: string | number;

	// Relationship Metrics
	likability?: number | string;
	"social-energy"?: string | number;
	reliability?: string | number;
	"relationship-goal"?: string;
	relationship?: string;

	// Personal Attributes
	ambitions?: string;
	dreams?: string;
	interests?: string;
	values?: string;
	"personality-type"?: string;

	// Follow-up System
	"next-step"?: string;
	"follow-up-date-notification"?: string; // ISO date string
	dates?: string;

	// Notes
	"history-note"?: string;

	// Allow any additional custom fields
	[key: string]: unknown;
}

/**
 * Zod schema for validating person frontmatter
 */
export const PersonFrontmatterSchema = z
	.object({
		segment: z.string().optional(),
		city: z.string().optional(),
		"original-city": z.string().optional(),
		"born-on": z.string().optional(),
		"first-contact": z.string().optional(),
		"second-contact": z.string().optional(),
		"last-contact": z.string().optional(),
		"contact-channel": z.string().optional(),
		position: z.string().optional(),
		status: z.string().optional(),
		"status-business": z.string().optional(),
		"told-about-business": z.union([z.boolean(), z.string()]).optional(),
		urgency: z.union([z.string(), z.number()]).optional(),
		likability: z.union([z.string(), z.number()]).optional(),
		"social-energy": z.union([z.string(), z.number()]).optional(),
		reliability: z.union([z.string(), z.number()]).optional(),
		"relationship-goal": z.string().optional(),
		relationship: z.string().optional(),
		ambitions: z.string().optional(),
		dreams: z.string().optional(),
		interests: z.string().optional(),
		values: z.string().optional(),
		"personality-type": z.string().optional(),
		"next-step": z.string().optional(),
		"follow-up-date-notification": z.string().optional(),
		dates: z.string().optional(),
		"history-note": z.string().optional(),
	})
	.passthrough();

/**
 * Validated and sanitized person data
 */
export function sanitizePersonFrontmatter(data: unknown): PersonFrontmatter {
	const result = PersonFrontmatterSchema.safeParse(data);
	if (result.success) {
		return result.data;
	}
	return {};
}

/**
 * Represents a person in the in-memory cache
 */
export interface Person {
	filePath: string;
	name: string;
	frontmatter: PersonFrontmatter;
	mtime: number;
	folder: string;
}

/**
 * Raw source data from indexer
 */
export interface RawPersonSource {
	filePath: string;
	mtime: number;
	frontmatter: PersonFrontmatter;
	folder: string;
}
