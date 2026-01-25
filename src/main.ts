import { Notice, Plugin } from "obsidian";
import { PeopleIndexer } from "./core/indexer";
import { NotificationManager } from "./core/notification-manager";
import { PeopleManager } from "./core/people-manager";
import { RelationshipSyncManager } from "./core/relationship-sync";
import { SettingsStore } from "./core/settings-store";
import { PeopleManagerSettingsTab } from "./ui/settings-tab";

export default class PeopleManagerPlugin extends Plugin {
	settingsStore: SettingsStore;
	private indexer: PeopleIndexer | null = null;
	private peopleManager: PeopleManager | null = null;
	private notificationManager: NotificationManager | null = null;
	private relationshipSyncManager: RelationshipSyncManager | null = null;
	private ribbonIconEl: HTMLElement | null = null;

	async onload() {
		console.log("Loading People Manager");

		// Initialize settings store
		this.settingsStore = new SettingsStore(this);
		await this.settingsStore.loadSettings();

		// Add settings tab
		this.addSettingTab(new PeopleManagerSettingsTab(this.app, this));

		// Add ribbon icon if enabled
		this.updateRibbonIcon();

		// Add commands
		this.registerCommands();

		// Enable plugin if settings allow
		if (this.settingsStore.currentSettings.enabled) {
			await this.enablePlugin();
		}
	}

	onunload() {
		console.log("Unloading People Manager");
		this.disablePlugin();
	}

	async enablePlugin(): Promise<void> {
		if (this.indexer) {
			return; // Already enabled
		}

		try {
			// Initialize indexer
			this.indexer = new PeopleIndexer(this.app, this.settingsStore);

			// Initialize people manager
			this.peopleManager = new PeopleManager(this.app, this.indexer, this.settingsStore);

			// Initialize notification manager
			this.notificationManager = new NotificationManager(this.app, this.peopleManager, this.settingsStore);

			// Initialize relationship sync manager
			this.relationshipSyncManager = new RelationshipSyncManager(this.app, this.indexer, this.settingsStore);

			// Start systems
			await this.indexer.start();
			this.notificationManager.start();

			if (this.settingsStore.currentSettings.debugMode) {
				console.log("[PeopleManager] Plugin enabled successfully");
			}

			new Notice("People Manager enabled");
		} catch (error) {
			console.error("[PeopleManager] Failed to enable plugin:", error);
			new Notice("Failed to enable People Manager");
		}
	}

	disablePlugin(): void {
		this.relationshipSyncManager?.destroy();
		this.notificationManager?.destroy();
		this.peopleManager?.destroy();
		this.indexer?.stop();

		this.relationshipSyncManager = null;
		this.notificationManager = null;
		this.peopleManager = null;
		this.indexer = null;

		if (this.settingsStore.currentSettings.debugMode) {
			console.log("[PeopleManager] Plugin disabled");
		}
	}

	updateRibbonIcon(): void {
		// Remove existing icon
		if (this.ribbonIconEl) {
			this.ribbonIconEl.remove();
			this.ribbonIconEl = null;
		}

		// Add new icon if enabled
		if (this.settingsStore.currentSettings.showRibbonIcon) {
			this.ribbonIconEl = this.addRibbonIcon("users", "People Manager", () => {
				this.showPeopleStats();
			});
		}
	}

	private registerCommands(): void {
		// Command: Show people stats
		this.addCommand({
			id: "show-people-stats",
			name: "Show people statistics",
			callback: () => {
				this.showPeopleStats();
			},
		});

		// Command: Check follow-ups now
		this.addCommand({
			id: "check-followups-now",
			name: "Check follow-ups now",
			callback: () => {
				if (this.notificationManager) {
					this.notificationManager.triggerCheck();
				} else {
					new Notice("People Manager is not enabled");
				}
			},
		});

		// Command: Resync people
		this.addCommand({
			id: "resync-people",
			name: "Resync all people",
			callback: () => {
				if (this.indexer) {
					this.indexer.resync();
					new Notice("Resyncing people...");
				} else {
					new Notice("People Manager is not enabled");
				}
			},
		});
	}

	private showPeopleStats(): void {
		if (!this.peopleManager) {
			new Notice("People Manager is not enabled");
			return;
		}

		const stats = this.peopleManager.getStats();
		const message = `📊 People Manager Stats\n\nTotal People: ${stats.totalPeople}\nUpcoming Follow-ups: ${stats.upcomingFollowUps}\nOverdue Follow-ups: ${stats.overdueFollowUps}`;

		new Notice(message, 8000);
	}
}
