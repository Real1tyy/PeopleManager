import type { App, TFile } from "obsidian";
import { BehaviorSubject, Subject } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IndexerEvent } from "../src/core/indexer";
import { RelationshipSyncManager } from "../src/core/relationship-sync";
import type { SettingsStore } from "../src/core/settings-store";
import type { PersonFrontmatter } from "../src/types";
import { DEFAULT_SETTINGS } from "../src/types/settings";
import { createMockApp, createMockFile } from "./mocks/obsidian";

describe("RelationshipSyncManager", () => {
	let mockApp: App;
	let mockIndexer: {
		events$: Subject<IndexerEvent>;
	};
	let mockSettingsStore: {
		currentSettings: typeof DEFAULT_SETTINGS;
		settings$: BehaviorSubject<typeof DEFAULT_SETTINGS>;
	};
	let _relationshipSyncManager: RelationshipSyncManager;

	beforeEach(() => {
		mockApp = createMockApp() as unknown as App;
		mockIndexer = {
			events$: new Subject<IndexerEvent>(),
		};
		mockSettingsStore = {
			currentSettings: { ...DEFAULT_SETTINGS, debugMode: false },
			settings$: new BehaviorSubject({ ...DEFAULT_SETTINGS, debugMode: false }),
		};

		_relationshipSyncManager = new RelationshipSyncManager(
			mockApp,
			mockIndexer as unknown,
			mockSettingsStore as SettingsStore
		);
	});

	describe("bidirectional relationship syncing", () => {
		it("should add relationship link to target person when source person links to them", async () => {
			const _aliceFile = createMockFile("People/Alice.md");
			const bobFile = createMockFile("People/Bob.md");

			// Mock file lookup
			vi.spyOn(mockApp.metadataCache, "getFirstLinkpathDest").mockReturnValueOnce(bobFile as TFile);

			// Mock frontmatter update
			const processFrontMatterSpy = vi
				.spyOn(mockApp.fileManager, "processFrontMatter")
				.mockImplementation(async (_file, callback) => {
					const frontmatter: PersonFrontmatter = {};
					callback(frontmatter);
					expect(frontmatter.relationship).toBe("[[Alice]]");
				});

			// Emit event: Alice now links to Bob
			const event: IndexerEvent = {
				type: "person-changed",
				filePath: "People/Alice.md",
				source: {
					filePath: "People/Alice.md",
					mtime: Date.now(),
					frontmatter: { relationship: "[[Bob]]" },
					folder: "People",
				},
				frontmatterDiff: {
					hasChanges: true,
					changes: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[Bob]]",
							changeType: "added",
						},
					],
					added: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[Bob]]",
							changeType: "added",
						},
					],
					modified: [],
					deleted: [],
				},
			};

			mockIndexer.events$.next(event);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(processFrontMatterSpy).toHaveBeenCalledWith(bobFile, expect.any(Function));
		});

		it("should remove relationship link from target person when source person removes link", async () => {
			const aliceFile = createMockFile("People/Alice.md");
			const bobFile = createMockFile("People/Bob.md");

			// Mock file lookup
			vi.spyOn(mockApp.metadataCache, "getFirstLinkpathDest")
				.mockReturnValueOnce(bobFile as TFile) // For old relationship
				.mockReturnValueOnce(aliceFile as TFile); // For checking Bob's current relationship

			// Mock frontmatter update
			const processFrontMatterSpy = vi
				.spyOn(mockApp.fileManager, "processFrontMatter")
				.mockImplementation(async (_file, callback) => {
					const frontmatter: PersonFrontmatter = { relationship: "[[Alice]]" };
					callback(frontmatter);
					expect(frontmatter.relationship).toBeUndefined();
				});

			// Emit event: Alice removes link to Bob
			const event: IndexerEvent = {
				type: "person-changed",
				filePath: "People/Alice.md",
				source: {
					filePath: "People/Alice.md",
					mtime: Date.now(),
					frontmatter: {},
					folder: "People",
				},
				oldFrontmatter: { relationship: "[[Bob]]" },
				frontmatterDiff: {
					hasChanges: true,
					changes: [
						{
							key: "relationship",
							oldValue: "[[Bob]]",
							newValue: undefined,
							changeType: "deleted",
						},
					],
					added: [],
					modified: [],
					deleted: [
						{
							key: "relationship",
							oldValue: "[[Bob]]",
							newValue: undefined,
							changeType: "deleted",
						},
					],
				},
			};

			mockIndexer.events$.next(event);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(processFrontMatterSpy).toHaveBeenCalledWith(bobFile, expect.any(Function));
		});

		it("should update both old and new target when relationship changes", async () => {
			const aliceFile = createMockFile("People/Alice.md");
			const bobFile = createMockFile("People/Bob.md");
			const charlieFile = createMockFile("People/Charlie.md");

			// Mock file lookup - returns the file for each wiki link extraction
			vi.spyOn(mockApp.metadataCache, "getFirstLinkpathDest").mockImplementation((linkpath: string) => {
				if (linkpath === "Bob") return bobFile as TFile;
				if (linkpath === "Charlie") return charlieFile as TFile;
				if (linkpath === "Alice") return aliceFile as TFile;
				return null;
			});

			const processFrontMatterSpy = vi.spyOn(mockApp.fileManager, "processFrontMatter").mockImplementation(async () => {
				// No-op for test
			});

			// Emit event: Alice changes link from Bob to Charlie
			const event: IndexerEvent = {
				type: "person-changed",
				filePath: "People/Alice.md",
				source: {
					filePath: "People/Alice.md",
					mtime: Date.now(),
					frontmatter: { relationship: "[[Charlie]]" },
					folder: "People",
				},
				oldFrontmatter: { relationship: "[[Bob]]" },
				frontmatterDiff: {
					hasChanges: true,
					changes: [
						{
							key: "relationship",
							oldValue: "[[Bob]]",
							newValue: "[[Charlie]]",
							changeType: "modified",
						},
					],
					added: [],
					modified: [
						{
							key: "relationship",
							oldValue: "[[Bob]]",
							newValue: "[[Charlie]]",
							changeType: "modified",
						},
					],
					deleted: [],
				},
			};

			mockIndexer.events$.next(event);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 20));

			// Should update both Bob (remove) and Charlie (add)
			expect(processFrontMatterSpy).toHaveBeenCalledTimes(2);

			// Verify the calls
			const calls = processFrontMatterSpy.mock.calls;
			const bobCall = calls.find((call) => call[0].path === "People/Bob.md");
			const charlieCall = calls.find((call) => call[0].path === "People/Charlie.md");

			expect(bobCall).toBeDefined();
			expect(charlieCall).toBeDefined();
		});

		it("should handle wiki links with aliases", async () => {
			const _aliceFile = createMockFile("People/Alice.md");
			const bobFile = createMockFile("People/Bob.md");

			// Mock file lookup
			vi.spyOn(mockApp.metadataCache, "getFirstLinkpathDest").mockReturnValueOnce(bobFile as TFile);

			// Mock frontmatter update
			const processFrontMatterSpy = vi
				.spyOn(mockApp.fileManager, "processFrontMatter")
				.mockImplementation(async (_file, callback) => {
					const frontmatter: PersonFrontmatter = {};
					callback(frontmatter);
					expect(frontmatter.relationship).toBe("[[Alice]]");
				});

			// Emit event: Alice links to Bob with alias
			const event: IndexerEvent = {
				type: "person-changed",
				filePath: "People/Alice.md",
				source: {
					filePath: "People/Alice.md",
					mtime: Date.now(),
					frontmatter: { relationship: "[[Bob|Bobby]]" },
					folder: "People",
				},
				frontmatterDiff: {
					hasChanges: true,
					changes: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[Bob|Bobby]]",
							changeType: "added",
						},
					],
					added: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[Bob|Bobby]]",
							changeType: "added",
						},
					],
					modified: [],
					deleted: [],
				},
			};

			mockIndexer.events$.next(event);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(processFrontMatterSpy).toHaveBeenCalledWith(bobFile, expect.any(Function));
		});

		it("should not sync if relationship property did not change", async () => {
			const processFrontMatterSpy = vi.spyOn(mockApp.fileManager, "processFrontMatter");

			// Emit event: Other property changed, not relationship
			const event: IndexerEvent = {
				type: "person-changed",
				filePath: "People/Alice.md",
				source: {
					filePath: "People/Alice.md",
					mtime: Date.now(),
					frontmatter: { status: "active" },
					folder: "People",
				},
				frontmatterDiff: {
					hasChanges: true,
					changes: [
						{
							key: "status",
							oldValue: undefined,
							newValue: "active",
							changeType: "added",
						},
					],
					added: [
						{
							key: "status",
							oldValue: undefined,
							newValue: "active",
							changeType: "added",
						},
					],
					modified: [],
					deleted: [],
				},
			};

			mockIndexer.events$.next(event);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(processFrontMatterSpy).not.toHaveBeenCalled();
		});

		it("should not sync if target file does not exist", async () => {
			// Mock file lookup to return null (file not found)
			vi.spyOn(mockApp.metadataCache, "getFirstLinkpathDest").mockReturnValueOnce(null);

			const processFrontMatterSpy = vi.spyOn(mockApp.fileManager, "processFrontMatter");

			// Emit event: Alice links to non-existent person
			const event: IndexerEvent = {
				type: "person-changed",
				filePath: "People/Alice.md",
				source: {
					filePath: "People/Alice.md",
					mtime: Date.now(),
					frontmatter: { relationship: "[[NonExistent]]" },
					folder: "People",
				},
				frontmatterDiff: {
					hasChanges: true,
					changes: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[NonExistent]]",
							changeType: "added",
						},
					],
					added: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[NonExistent]]",
							changeType: "added",
						},
					],
					modified: [],
					deleted: [],
				},
			};

			mockIndexer.events$.next(event);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(processFrontMatterSpy).not.toHaveBeenCalled();
		});

		it("should prevent infinite loops during sync", async () => {
			const _aliceFile = createMockFile("People/Alice.md");
			const bobFile = createMockFile("People/Bob.md");

			// Mock file lookup
			vi.spyOn(mockApp.metadataCache, "getFirstLinkpathDest").mockReturnValue(bobFile as TFile);

			let callCount = 0;
			vi.spyOn(mockApp.fileManager, "processFrontMatter").mockImplementation(async (_file, callback) => {
				callCount++;
				const frontmatter: PersonFrontmatter = {};
				callback(frontmatter);

				// Simulate the indexer detecting the change and emitting another event
				// This should be ignored due to syncInProgress tracking
				if (callCount === 1) {
					const recursiveEvent: IndexerEvent = {
						type: "person-changed",
						filePath: bobFile.path,
						source: {
							filePath: bobFile.path,
							mtime: Date.now(),
							frontmatter: { relationship: "[[Alice]]" },
							folder: "People",
						},
						frontmatterDiff: {
							hasChanges: true,
							changes: [
								{
									key: "relationship",
									oldValue: undefined,
									newValue: "[[Alice]]",
									changeType: "added",
								},
							],
							added: [
								{
									key: "relationship",
									oldValue: undefined,
									newValue: "[[Alice]]",
									changeType: "added",
								},
							],
							modified: [],
							deleted: [],
						},
					};
					mockIndexer.events$.next(recursiveEvent);
				}
			});

			// Emit initial event
			const event: IndexerEvent = {
				type: "person-changed",
				filePath: "People/Alice.md",
				source: {
					filePath: "People/Alice.md",
					mtime: Date.now(),
					frontmatter: { relationship: "[[Bob]]" },
					folder: "People",
				},
				frontmatterDiff: {
					hasChanges: true,
					changes: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[Bob]]",
							changeType: "added",
						},
					],
					added: [
						{
							key: "relationship",
							oldValue: undefined,
							newValue: "[[Bob]]",
							changeType: "added",
						},
					],
					modified: [],
					deleted: [],
				},
			};

			mockIndexer.events$.next(event);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			// Should only process frontmatter once, preventing infinite loop
			expect(callCount).toBe(1);
		});
	});

	describe("cleanup", () => {
		it("should unsubscribe from indexer events on destroy", () => {
			const subscriptions: unknown[] = [];
			vi.spyOn(mockIndexer.events$, "subscribe").mockImplementation((_observer) => {
				const subscription = {
					unsubscribe: vi.fn(),
					closed: false,
				};
				subscriptions.push(subscription);
				return subscription as unknown;
			});

			// Create a new manager to capture subscription
			const manager = new RelationshipSyncManager(mockApp, mockIndexer as unknown, mockSettingsStore as SettingsStore);

			manager.destroy();

			// Check that unsubscribe was called
			expect(subscriptions[0].unsubscribe).toHaveBeenCalled();
		});
	});
});
