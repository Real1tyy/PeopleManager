import { describe, expect, it } from "vitest";
import { sanitizePersonFrontmatter, sanitizeSettings } from "../src/types";

describe("Types", () => {
	describe("sanitizePersonFrontmatter", () => {
		it("should return empty object for invalid data", () => {
			const result = sanitizePersonFrontmatter(null);
			expect(result).toEqual({});
		});

		it("should accept valid person frontmatter", () => {
			const data = {
				segment: "Gym",
				city: "Brno",
				"first-contact": "2024-01-01",
				"status-business": "Prospect",
			};
			const result = sanitizePersonFrontmatter(data);
			expect(result.segment).toBe("Gym");
			expect(result.city).toBe("Brno");
		});

		it("should pass through unknown fields", () => {
			const data = {
				segment: "Gym",
				customField: "custom value",
			};
			const result = sanitizePersonFrontmatter(data);
			expect(result.segment).toBe("Gym");
			expect(result.customField).toBe("custom value");
		});
	});

	describe("sanitizeSettings", () => {
		it("should return default settings for invalid data", () => {
			const result = sanitizeSettings(null);
			expect(result.directory).toBe("People");
			expect(result.enabled).toBe(true);
		});

		it("should merge partial settings with defaults", () => {
			const result = sanitizeSettings({ directory: "CustomFolder" });
			expect(result.directory).toBe("CustomFolder");
			expect(result.enabled).toBe(true);
		});
	});
});
