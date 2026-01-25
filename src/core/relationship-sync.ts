import { type App, TFile } from "obsidian";
import type { Subscription } from "rxjs";
import type { IndexerEvent, PeopleIndexer } from "./indexer";
import type { SettingsStore } from "./settings-store";

/**
 * Manages bidirectional relationship syncing between people.
 * When person A's relationship property points to person B,
 * automatically updates B's relationship to point back to A.
 */
export class RelationshipSyncManager {
	private indexerSubscription: Subscription | null = null;
	private syncInProgress = new Set<string>();

	constructor(
		private app: App,
		private indexer: PeopleIndexer,
		private settingsStore: SettingsStore
	) {
		this.indexerSubscription = this.indexer.events$.subscribe((event) => {
			void this.handleIndexerEvent(event);
		});
	}

	private async handleIndexerEvent(event: IndexerEvent): Promise<void> {
		console.log("[RelationshipSync] Received event:", {
			type: event.type,
			filePath: event.filePath,
			hasFrontmatterDiff: !!event.frontmatterDiff,
		});

		if (event.type !== "person-changed" || !event.frontmatterDiff) {
			console.log("[RelationshipSync] Skipping - not a person-changed event or no frontmatter diff");
			return;
		}

		// Check if relationship property changed
		const relationshipChanged = event.frontmatterDiff.changes.some((change) => change.key === "relationship");
		console.log("[RelationshipSync] Relationship changed?", relationshipChanged, {
			allChanges: event.frontmatterDiff.changes.map((c) => c.key),
		});

		if (!relationshipChanged) {
			console.log("[RelationshipSync] Skipping - relationship property didn't change");
			return;
		}

		// Prevent infinite loops
		if (this.syncInProgress.has(event.filePath)) {
			console.log("[RelationshipSync] Skipping - sync already in progress for:", event.filePath);
			return;
		}

		const newRelationship = event.source?.frontmatter.relationship;
		const oldRelationship = event.oldFrontmatter?.relationship;

		console.log("[RelationshipSync] Processing relationship change:", {
			file: event.filePath,
			oldRelationship,
			newRelationship,
			oldType: typeof oldRelationship,
			newType: typeof newRelationship,
		});

		// Handle the change
		try {
			this.syncInProgress.add(event.filePath);
			console.log("[RelationshipSync] Added to syncInProgress:", event.filePath);

			// Remove old relationship link if it existed
			if (oldRelationship && typeof oldRelationship === "string") {
				console.log("[RelationshipSync] Attempting to remove old relationship:", oldRelationship);
				const oldTargetFile = this.extractFileFromWikiLink(oldRelationship);
				console.log("[RelationshipSync] Extracted old target file:", oldTargetFile?.path || "null");
				if (oldTargetFile) {
					await this.removeRelationshipLink(oldTargetFile, event.filePath);
				}
			}

			// Add new relationship link if it exists
			if (newRelationship && typeof newRelationship === "string") {
				console.log("[RelationshipSync] Attempting to add new relationship:", newRelationship);
				const newTargetFile = this.extractFileFromWikiLink(newRelationship);
				console.log("[RelationshipSync] Extracted new target file:", newTargetFile?.path || "null");
				if (newTargetFile) {
					await this.addRelationshipLink(newTargetFile, event.filePath);
				} else {
					console.warn("[RelationshipSync] Could not find target file for:", newRelationship);
				}
			}

			console.log("[RelationshipSync] Successfully completed sync for:", event.filePath);
		} catch (error) {
			console.error("[RelationshipSync] Error during sync:", error);
		} finally {
			this.syncInProgress.delete(event.filePath);
			console.log("[RelationshipSync] Removed from syncInProgress:", event.filePath);
		}
	}

	/**
	 * Extracts the file path from a wiki link like [[Person Name]] or [[Folder/Person Name]]
	 */
	private extractFileFromWikiLink(linkText: string): TFile | null {
		console.log("[RelationshipSync] Extracting file from wiki link:", linkText);

		// Remove wiki link brackets
		const cleaned = linkText.trim().replace(/^\[\[|\]\]$/g, "");
		console.log("[RelationshipSync] Cleaned link text:", cleaned);

		if (!cleaned) {
			console.log("[RelationshipSync] Empty cleaned text, returning null");
			return null;
		}

		// Handle aliases: [[File|Alias]] -> File
		const filePart = cleaned.split("|")[0].trim();
		console.log("[RelationshipSync] File part (without alias):", filePart);

		// Try to find the file
		const file = this.app.metadataCache.getFirstLinkpathDest(filePart, "");
		console.log("[RelationshipSync] getFirstLinkpathDest result:", {
			found: !!file,
			path: file?.path || "null",
			isFile: file instanceof TFile,
		});

		return file instanceof TFile ? file : null;
	}

	/**
	 * Adds a relationship link to the target person's frontmatter
	 */
	private async addRelationshipLink(targetFile: TFile, sourceFilePath: string): Promise<void> {
		console.log("[RelationshipSync] addRelationshipLink called:", {
			targetFile: targetFile.path,
			sourceFilePath,
			syncInProgress: Array.from(this.syncInProgress),
		});

		// Prevent syncing back to the same file
		if (this.syncInProgress.has(targetFile.path)) {
			console.log("[RelationshipSync] Target file already in syncInProgress, skipping:", targetFile.path);
			return;
		}

		try {
			this.syncInProgress.add(targetFile.path);
			console.log("[RelationshipSync] Added target to syncInProgress:", targetFile.path);

			const sourceName = this.getPersonNameFromPath(sourceFilePath);
			console.log("[RelationshipSync] Source person name:", sourceName);

			if (!sourceName) {
				console.log("[RelationshipSync] Could not extract source name, aborting");
				return;
			}

			console.log("[RelationshipSync] About to call processFrontMatter for:", targetFile.path);
			await this.app.fileManager.processFrontMatter(targetFile, (frontmatter) => {
				// Create wiki link
				const wikiLink = `[[${sourceName}]]`;
				console.log("[RelationshipSync] Inside processFrontMatter callback:", {
					targetFile: targetFile.path,
					wikiLink,
					currentRelationship: frontmatter.relationship,
				});

				frontmatter.relationship = wikiLink;
				console.log("[RelationshipSync] Set relationship to:", wikiLink);
			});

			console.log("[RelationshipSync] Successfully added relationship:", {
				target: targetFile.path,
				link: `[[${sourceName}]]`,
			});
		} catch (error) {
			console.error("[RelationshipSync] Error in addRelationshipLink:", error);
		} finally {
			this.syncInProgress.delete(targetFile.path);
			console.log("[RelationshipSync] Removed target from syncInProgress:", targetFile.path);
		}
	}

	/**
	 * Removes a relationship link from the target person's frontmatter
	 */
	private async removeRelationshipLink(targetFile: TFile, sourceFilePath: string): Promise<void> {
		console.log("[RelationshipSync] removeRelationshipLink called:", {
			targetFile: targetFile.path,
			sourceFilePath,
			syncInProgress: Array.from(this.syncInProgress),
		});

		// Prevent syncing back to the same file
		if (this.syncInProgress.has(targetFile.path)) {
			console.log("[RelationshipSync] Target file already in syncInProgress, skipping:", targetFile.path);
			return;
		}

		try {
			this.syncInProgress.add(targetFile.path);
			console.log("[RelationshipSync] Added target to syncInProgress:", targetFile.path);

			const sourceName = this.getPersonNameFromPath(sourceFilePath);
			console.log("[RelationshipSync] Source person name:", sourceName);

			if (!sourceName) {
				console.log("[RelationshipSync] Could not extract source name, aborting");
				return;
			}

			console.log("[RelationshipSync] About to call processFrontMatter for:", targetFile.path);
			await this.app.fileManager.processFrontMatter(targetFile, (frontmatter) => {
				const currentRelationship = frontmatter.relationship;
				console.log("[RelationshipSync] Inside processFrontMatter callback:", {
					targetFile: targetFile.path,
					currentRelationship,
				});

				if (!currentRelationship) {
					console.log("[RelationshipSync] No current relationship, nothing to remove");
					return;
				}

				// Check if the current relationship points to the source
				const linkedFile = this.extractFileFromWikiLink(String(currentRelationship));
				console.log("[RelationshipSync] Linked file check:", {
					linkedFilePath: linkedFile?.path || "null",
					sourceFilePath,
					matches: linkedFile?.path === sourceFilePath,
				});

				if (linkedFile?.path === sourceFilePath) {
					// Remove the relationship
					delete frontmatter.relationship;
					console.log("[RelationshipSync] Removed relationship from:", targetFile.path);
				}
			});

			console.log("[RelationshipSync] Successfully processed removeRelationshipLink for:", targetFile.path);
		} catch (error) {
			console.error("[RelationshipSync] Error in removeRelationshipLink:", error);
		} finally {
			this.syncInProgress.delete(targetFile.path);
			console.log("[RelationshipSync] Removed target from syncInProgress:", targetFile.path);
		}
	}

	/**
	 * Extracts the person name from a file path
	 */
	private getPersonNameFromPath(filePath: string): string | null {
		const parts = filePath.split("/");
		const fileName = parts[parts.length - 1];
		if (!fileName) {
			return null;
		}

		// Remove .md extension
		return fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
	}

	/**
	 * Cleanup subscriptions
	 */
	destroy(): void {
		this.indexerSubscription?.unsubscribe();
		this.indexerSubscription = null;
		this.syncInProgress.clear();
	}
}
