import { SettingsStore as GenericSettingsStore } from "@real1ty-obsidian-plugins";
import type { Plugin } from "obsidian";
import { PeopleManagerSettingsSchema } from "../types";

export class SettingsStore extends GenericSettingsStore<typeof PeopleManagerSettingsSchema> {
	constructor(plugin: Plugin) {
		super(plugin, PeopleManagerSettingsSchema);
	}
}
