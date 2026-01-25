import { vi } from "vitest";

// Setup DOM environment
global.window = global.window || ({} as Window & typeof globalThis);
global.document = global.document || ({} as Document);

// Mock console methods to avoid noise in tests
global.console = {
	...console,
	log: vi.fn(),
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};
