import {
	type FrontmatterDiff,
	Indexer as GenericIndexer,
	type IndexerEvent as GenericIndexerEvent,
	type IndexerConfig,
} from "@real1ty-obsidian-plugins";
import { type App, TFile } from "obsidian";
import { BehaviorSubject, type Observable, Subject, type Subscription } from "rxjs";
import type { PeopleManagerSettings, PersonFrontmatter, RawPersonSource } from "../types";
import { sanitizePersonFrontmatter } from "../types";
import type { SettingsStore } from "./settings-store";

type IndexerEventType = "person-changed" | "person-deleted";

export interface IndexerEvent {
	type: IndexerEventType;
	filePath: string;
	oldPath?: string;
	source?: RawPersonSource;
	oldFrontmatter?: PersonFrontmatter;
	frontmatterDiff?: FrontmatterDiff;
}

/**
 * Wrapper around the generic Indexer that adds people-specific functionality
 */
export class PeopleIndexer {
	private settings: PeopleManagerSettings;
	private genericIndexer: GenericIndexer;
	private settingsSubscription: Subscription | null = null;
	private scanEventsSubject = new Subject<IndexerEvent>();
	public readonly events$: Observable<IndexerEvent>;
	public readonly indexingComplete$: Observable<boolean>;

	constructor(
		private app: App,
		settingsStore: SettingsStore
	) {
		this.settings = settingsStore.currentSettings;
		const configStore = new BehaviorSubject<IndexerConfig>(this.buildIndexerConfig());

		this.genericIndexer = new GenericIndexer(app, configStore);

		this.genericIndexer.events$.subscribe((genericEvent) => {
			void this.handleGenericEvent(genericEvent);
		});

		this.settingsSubscription = settingsStore.settings$.subscribe((newSettings: PeopleManagerSettings) => {
			const directoryChanged = this.settings.directory !== newSettings.directory;
			this.settings = newSettings;

			if (directoryChanged) {
				void this.genericIndexer.resync();
			} else {
				configStore.next(this.buildIndexerConfig());
			}
		});

		this.events$ = this.scanEventsSubject.asObservable();
		this.indexingComplete$ = this.genericIndexer.indexingComplete$;
	}

	private buildIndexerConfig(): IndexerConfig {
		return {
			includeFile: (filePath: string) => {
				const directory = this.settings.directory;
				if (!directory) return true;
				return filePath === directory || filePath.startsWith(`${directory}/`);
			},
			excludedDiffProps: new Set<string>(), // We want to track all frontmatter changes
			scanConcurrency: 10,
			debounceMs: 100,
		};
	}

	async start(): Promise<void> {
		if (this.settings.debugMode) {
			console.log("[PeopleIndexer] Starting indexer...");
		}
		await this.genericIndexer.start();
	}

	stop(): void {
		if (this.settings.debugMode) {
			console.log("[PeopleIndexer] Stopping indexer...");
		}
		this.genericIndexer.stop();
		this.settingsSubscription?.unsubscribe();
		this.settingsSubscription = null;
	}

	resync(): void {
		if (this.settings.debugMode) {
			console.log("[PeopleIndexer] Resyncing...");
		}
		void this.genericIndexer.resync();
	}

	private async handleGenericEvent(genericEvent: GenericIndexerEvent): Promise<void> {
		if (genericEvent.type === "file-deleted") {
			this.scanEventsSubject.next({
				type: "person-deleted",
				filePath: genericEvent.filePath,
				oldFrontmatter: genericEvent.oldFrontmatter,
			});
			return;
		}

		if (genericEvent.type === "file-changed" && genericEvent.source) {
			const { filePath, source, oldPath, oldFrontmatter, frontmatterDiff } = genericEvent;

			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (!(file instanceof TFile)) return;

			const sanitizedFrontmatter = sanitizePersonFrontmatter(source.frontmatter);

			const personSource: RawPersonSource = {
				filePath: file.path,
				mtime: file.stat.mtime,
				frontmatter: sanitizedFrontmatter,
				folder: file.parent?.path || "",
			};

			this.scanEventsSubject.next({
				type: "person-changed",
				filePath,
				oldPath,
				source: personSource,
				oldFrontmatter,
				frontmatterDiff,
			});

			if (this.settings.debugMode) {
				console.log("[PeopleIndexer] Person changed:", filePath, sanitizedFrontmatter);
			}
		}
	}
}
