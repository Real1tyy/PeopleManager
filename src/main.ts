import { getActiveFileOrThrow } from "@real1ty-obsidian-plugins/file/file-operations";
import { Plugin } from "obsidian";

type PluginSettings = Record<string, never>;

const DEFAULT_SETTINGS: PluginSettings = {};

export default class PluginNamePlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		console.log("Loading Plugin Name");

		await this.loadSettings();

		// Add ribbon icon
		this.addRibbonIcon("dice", "Plugin Name", () => {
			console.log("Plugin Name ribbon icon clicked");
		});

		// Add command
		this.addCommand({
			id: "open-sample-modal",
			name: "Open sample modal",
			callback: () => {
				console.log("Sample command executed");
			},
		});

		// Example command using shared utilities
		this.addCommand({
			id: "get-active-file",
			name: "Get active file",
			callback: () => {
				try {
					const file = getActiveFileOrThrow(this.app);
					console.log(`Active file: ${file.path}`);
				} catch {
					console.error("No active file");
				}
			},
		});

		// Add settings tab
		// this.addSettingTab(new PluginNameSettingTab(this.app, this));
	}

	onunload() {
		console.log("Unloading Plugin Name");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Uncomment to add settings tab
// import { App, PluginSettingTab, Setting } from "obsidian";
//
// class PluginNameSettingTab extends PluginSettingTab {
// 	plugin: PluginNamePlugin;
//
// 	constructor(app: App, plugin: PluginNamePlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}
//
// 	display(): void {
// 		const { containerEl } = this;
//
// 		containerEl.empty();
//
// 		new Setting(containerEl)
// 			.setName("Setting name")
// 			.setDesc("Setting description")
// 			.addText((text) =>
// 				text
// 					.setPlaceholder("Enter value")
// 					.setValue(this.plugin.settings.someSetting)
// 					.onChange(async (value) => {
// 						this.plugin.settings.someSetting = value;
// 						await this.plugin.saveSettings();
// 					})
// 			);
// 	}
// }
