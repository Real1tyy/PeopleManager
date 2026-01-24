import type { App } from "obsidian";
import { PluginSettingTab, Setting } from "obsidian";
import type PeopleManagerPlugin from "../main";

export class PeopleManagerSettingsTab extends PluginSettingTab {
	plugin: PeopleManagerPlugin;

	constructor(app: App, plugin: PeopleManagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "People Manager Settings" });

		this.renderGeneralSettings(containerEl);
		this.renderNotificationSettings(containerEl);
		this.renderDisplaySettings(containerEl);
		this.renderAdvancedSettings(containerEl);
		this.renderFooter(containerEl);
	}

	private renderGeneralSettings(containerEl: HTMLElement): void {
		containerEl.createEl("h3", { text: "General" });

		new Setting(containerEl)
			.setName("Enable plugin")
			.setDesc("Enable or disable the People Manager plugin.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settingsStore.currentSettings.enabled).onChange(async (value) => {
					await this.plugin.settingsStore.updateSettings((settings) => ({
						...settings,
						enabled: value,
					}));
					if (value) {
						await this.plugin.enablePlugin();
					} else {
						this.plugin.disablePlugin();
					}
				})
			);

		new Setting(containerEl)
			.setName("People directory")
			.setDesc("Directory to scan for people files (leave empty for entire vault)")
			.addText((text) =>
				text
					.setPlaceholder("People")
					.setValue(this.plugin.settingsStore.currentSettings.directory)
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettings((settings) => ({
							...settings,
							directory: value.trim(),
						}));
					})
			);
	}

	private renderNotificationSettings(containerEl: HTMLElement): void {
		containerEl.createEl("h3", { text: "Follow-up Notifications" });

		new Setting(containerEl)
			.setName("Enable notifications")
			.setDesc("Show notifications for upcoming follow-ups")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settingsStore.currentSettings.enableNotifications).onChange(async (value) => {
					await this.plugin.settingsStore.updateSettings((settings) => ({
						...settings,
						enableNotifications: value,
					}));
				})
			);

		new Setting(containerEl)
			.setName("Notification check interval")
			.setDesc("How often to check for due follow-ups (in minutes)")
			.addSlider((slider) =>
				slider
					.setLimits(5, 1440, 5)
					.setValue(this.plugin.settingsStore.currentSettings.notificationCheckIntervalMinutes)
					.setDynamicTooltip()
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettings((settings) => ({
							...settings,
							notificationCheckIntervalMinutes: value,
						}));
					})
			);

		new Setting(containerEl)
			.setName("Notification lead time")
			.setDesc("Show notification this many hours before follow-up is due")
			.addSlider((slider) =>
				slider
					.setLimits(0, 168, 1)
					.setValue(this.plugin.settingsStore.currentSettings.notificationLeadTimeHours)
					.setDynamicTooltip()
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettings((settings) => ({
							...settings,
							notificationLeadTimeHours: value,
						}));
					})
			);

		new Setting(containerEl)
			.setName("Show notifications on startup")
			.setDesc("Show pending follow-ups when Obsidian starts")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settingsStore.currentSettings.showNotificationOnStartup).onChange(async (value) => {
					await this.plugin.settingsStore.updateSettings((settings) => ({
						...settings,
						showNotificationOnStartup: value,
					}));
				})
			);
	}

	private renderDisplaySettings(containerEl: HTMLElement): void {
		containerEl.createEl("h3", { text: "Display" });

		new Setting(containerEl)
			.setName("Show ribbon icon")
			.setDesc("Show quick access icon in the left sidebar")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settingsStore.currentSettings.showRibbonIcon).onChange(async (value) => {
					await this.plugin.settingsStore.updateSettings((settings) => ({
						...settings,
						showRibbonIcon: value,
					}));
					this.plugin.updateRibbonIcon();
				})
			);
	}

	private renderAdvancedSettings(containerEl: HTMLElement): void {
		containerEl.createEl("h3", { text: "Advanced" });

		new Setting(containerEl)
			.setName("Debug mode")
			.setDesc("Enable debug logging in the console")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settingsStore.currentSettings.debugMode).onChange(async (value) => {
					await this.plugin.settingsStore.updateSettings((settings) => ({
						...settings,
						debugMode: value,
					}));
				})
			);
	}

	private renderFooter(containerEl: HTMLElement): void {
		const footerEl = containerEl.createDiv("setting-item");
		const linksContainer = footerEl.createDiv();
		linksContainer.style.display = "flex";
		linksContainer.style.gap = "1rem";
		linksContainer.style.justifyContent = "center";
		linksContainer.style.marginTop = "2rem";

		linksContainer.createEl("a", {
			text: "Documentation",
			href: "https://github.com/Real1tyy/people-manager",
		});

		linksContainer.createEl("a", {
			text: "Support",
			href: "https://github.com/sponsors/Real1tyy",
		});
	}
}
