import type { App } from "obsidian";
import { Notice } from "obsidian";
import type { Subscription } from "rxjs";
import type { PeopleManagerSettings } from "../types";
import type { PeopleManager } from "./people-manager";
import type { SettingsStore } from "./settings-store";

/**
 * Manages follow-up notifications for people
 */
export class NotificationManager {
	private intervalId: number | null = null;
	private settingsSubscription: Subscription | null = null;
	private settings: PeopleManagerSettings;

	constructor(
		_app: App,
		private peopleManager: PeopleManager,
		settingsStore: SettingsStore
	) {
		this.settings = settingsStore.currentSettings;

		this.settingsSubscription = settingsStore.settings$.subscribe((newSettings) => {
			const intervalChanged =
				this.settings.notificationCheckIntervalMinutes !== newSettings.notificationCheckIntervalMinutes ||
				this.settings.enableNotifications !== newSettings.enableNotifications;

			this.settings = newSettings;

			if (intervalChanged) {
				this.restart();
			}
		});
	}

	start(): void {
		if (!this.settings.enableNotifications) {
			return;
		}

		if (this.settings.debugMode) {
			console.log("[NotificationManager] Starting notification checks...");
		}

		// Initial check on startup
		if (this.settings.showNotificationOnStartup) {
			setTimeout(() => {
				this.checkFollowUps();
			}, 5000); // Wait 5 seconds after startup
		}

		// Set up periodic checks
		this.intervalId = window.setInterval(
			() => {
				this.checkFollowUps();
			},
			this.settings.notificationCheckIntervalMinutes * 60 * 1000
		);
	}

	stop(): void {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}

		if (this.settings.debugMode) {
			console.log("[NotificationManager] Stopped notification checks");
		}
	}

	restart(): void {
		this.stop();
		this.start();
	}

	private checkFollowUps(): void {
		if (!this.settings.enableNotifications) {
			return;
		}

		const upcomingPeople = this.peopleManager.getPeopleWithUpcomingFollowUps(this.settings.notificationLeadTimeHours);

		const overduePeople = this.peopleManager.getPeopleWithOverdueFollowUps();

		if (this.settings.debugMode) {
			console.log(`[NotificationManager] Check: ${upcomingPeople.length} upcoming, ${overduePeople.length} overdue`);
		}

		// Show notification for overdue follow-ups (higher priority)
		if (overduePeople.length > 0) {
			this.showOverdueNotification(overduePeople.length);
		}

		// Show notification for upcoming follow-ups
		if (upcomingPeople.length > 0) {
			this.showUpcomingNotification(upcomingPeople.length);
		}
	}

	private showUpcomingNotification(count: number): void {
		const message = count === 1 ? "You have 1 upcoming follow-up" : `You have ${count} upcoming follow-ups`;

		new Notice(`📅 ${message}`, 5000);

		if (this.settings.debugMode) {
			console.log("[NotificationManager] Showed upcoming notification:", count);
		}
	}

	private showOverdueNotification(count: number): void {
		const message = count === 1 ? "You have 1 overdue follow-up!" : `You have ${count} overdue follow-ups!`;

		new Notice(`⚠️ ${message}`, 8000);

		if (this.settings.debugMode) {
			console.log("[NotificationManager] Showed overdue notification:", count);
		}
	}

	/**
	 * Manually trigger a follow-up check
	 */
	triggerCheck(): void {
		this.checkFollowUps();
	}

	/**
	 * Cleanup subscriptions
	 */
	destroy(): void {
		this.stop();
		this.settingsSubscription?.unsubscribe();
		this.settingsSubscription = null;
	}
}
