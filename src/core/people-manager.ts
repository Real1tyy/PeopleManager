import type { App } from "obsidian";
import { BehaviorSubject, type Subscription } from "rxjs";
import type { Person } from "../types";
import type { IndexerEvent, PeopleIndexer } from "./indexer";
import type { SettingsStore } from "./settings-store";

/**
 * Manages the in-memory cache of all people
 * Key: person name (filename without extension)
 * Value: Person data
 */
export class PeopleManager {
	private peopleCache = new Map<string, Person>();
	private indexerSubscription: Subscription | null = null;
	private settingsSubscription: Subscription | null = null;
	public readonly people$: BehaviorSubject<Map<string, Person>>;

	constructor(
		_app: App,
		private indexer: PeopleIndexer,
		settingsStore: SettingsStore
	) {
		this.people$ = new BehaviorSubject<Map<string, Person>>(new Map());

		// Subscribe to indexer events
		this.indexerSubscription = this.indexer.events$.subscribe((event) => {
			this.handleIndexerEvent(event);
		});

		// Subscribe to settings changes
		this.settingsSubscription = settingsStore.settings$.subscribe((settings) => {
			if (settings.debugMode) {
				console.log("[PeopleManager] People cache size:", this.peopleCache.size);
			}
		});
	}

	private handleIndexerEvent(event: IndexerEvent): void {
		if (event.type === "person-changed" && event.source) {
			const name = this.getPersonNameFromPath(event.filePath);
			if (!name) return;

			const person: Person = {
				filePath: event.filePath,
				name,
				frontmatter: event.source.frontmatter,
				mtime: event.source.mtime,
				folder: event.source.folder,
			};

			// Handle file renames
			if (event.oldPath) {
				const oldName = this.getPersonNameFromPath(event.oldPath);
				if (oldName) {
					this.peopleCache.delete(oldName);
				}
			}

			this.peopleCache.set(name, person);
			this.people$.next(new Map(this.peopleCache));
		} else if (event.type === "person-deleted") {
			const name = this.getPersonNameFromPath(event.filePath);
			if (name) {
				this.peopleCache.delete(name);
				this.people$.next(new Map(this.peopleCache));
			}
		}
	}

	private getPersonNameFromPath(filePath: string): string | null {
		const parts = filePath.split("/");
		const fileName = parts[parts.length - 1];
		if (!fileName) return null;

		// Remove .md extension
		return fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
	}

	/**
	 * Get all people in the cache
	 */
	getAllPeople(): Person[] {
		return Array.from(this.peopleCache.values());
	}

	/**
	 * Get a person by name
	 */
	getPerson(name: string): Person | undefined {
		return this.peopleCache.get(name);
	}

	/**
	 * Get people with upcoming follow-ups (within specified hours)
	 */
	getPeopleWithUpcomingFollowUps(withinHours: number): Person[] {
		const now = new Date();
		const threshold = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

		return this.getAllPeople().filter((person) => {
			const followUpDate = person.frontmatter["follow-up-date-notification"];
			if (!followUpDate) return false;

			try {
				const date = new Date(followUpDate);
				return date >= now && date <= threshold;
			} catch {
				return false;
			}
		});
	}

	/**
	 * Get overdue follow-ups
	 */
	getPeopleWithOverdueFollowUps(): Person[] {
		const now = new Date();

		return this.getAllPeople().filter((person) => {
			const followUpDate = person.frontmatter["follow-up-date-notification"];
			if (!followUpDate) return false;

			try {
				const date = new Date(followUpDate);
				return date < now;
			} catch {
				return false;
			}
		});
	}

	/**
	 * Filter people by segment
	 */
	getPeopleBySegment(segment: string): Person[] {
		return this.getAllPeople().filter((person) => person.frontmatter.segment === segment);
	}

	/**
	 * Filter people by status
	 */
	getPeopleByStatus(status: string): Person[] {
		return this.getAllPeople().filter((person) => person.frontmatter["status-business"] === status);
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return {
			totalPeople: this.peopleCache.size,
			upcomingFollowUps: this.getPeopleWithUpcomingFollowUps(24).length,
			overdueFollowUps: this.getPeopleWithOverdueFollowUps().length,
		};
	}

	/**
	 * Cleanup subscriptions
	 */
	destroy(): void {
		this.indexerSubscription?.unsubscribe();
		this.settingsSubscription?.unsubscribe();
		this.indexerSubscription = null;
		this.settingsSubscription = null;
		this.peopleCache.clear();
		this.people$.complete();
	}
}
