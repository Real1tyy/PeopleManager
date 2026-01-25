import { z } from "zod";
import { SETTINGS_DEFAULTS } from "../constants";

/**
 * General plugin settings
 */
const GeneralSettingsSchema = z
	.object({
		directory: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_DIRECTORY),
		enabled: z.boolean().catch(SETTINGS_DEFAULTS.DEFAULT_ENABLED),
		showRibbonIcon: z.boolean().catch(SETTINGS_DEFAULTS.DEFAULT_SHOW_RIBBON_ICON),
		debugMode: z.boolean().catch(SETTINGS_DEFAULTS.DEFAULT_DEBUG_MODE),
	})
	.strip();

/**
 * Notification settings for follow-ups
 */
const NotificationsSettingsSchema = z
	.object({
		enableNotifications: z.boolean().catch(SETTINGS_DEFAULTS.DEFAULT_ENABLE_NOTIFICATIONS),
		notificationCheckIntervalMinutes: z
			.number()
			.int()
			.min(1)
			.max(1440)
			.catch(SETTINGS_DEFAULTS.DEFAULT_NOTIFICATION_CHECK_INTERVAL_MINUTES),
		notificationLeadTimeHours: z
			.number()
			.int()
			.min(0)
			.max(168)
			.catch(SETTINGS_DEFAULTS.DEFAULT_NOTIFICATION_LEAD_TIME_HOURS),
		showNotificationOnStartup: z.boolean().catch(SETTINGS_DEFAULTS.DEFAULT_SHOW_NOTIFICATION_ON_STARTUP),
	})
	.strip();

/**
 * Property name mappings for frontmatter
 */
const PropsSettingsSchema = z
	.object({
		segmentProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_SEGMENT_PROP),
		cityProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_CITY_PROP),
		originalCityProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_ORIGINAL_CITY_PROP),
		bornOnProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_BORN_ON_PROP),
		firstContactProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_FIRST_CONTACT_PROP),
		secondContactProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_SECOND_CONTACT_PROP),
		lastContactProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_LAST_CONTACT_PROP),
		contactChannelProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_CONTACT_CHANNEL_PROP),
		positionProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_POSITION_PROP),
		statusProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_STATUS_PROP),
		statusBusinessProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_STATUS_BUSINESS_PROP),
		toldAboutBusinessProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_TOLD_ABOUT_BUSINESS_PROP),
		urgencyProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_URGENCY_PROP),
		likabilityProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_LIKABILITY_PROP),
		socialEnergyProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_SOCIAL_ENERGY_PROP),
		reliabilityProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_RELIABILITY_PROP),
		relationshipGoalProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_RELATIONSHIP_GOAL_PROP),
		relationshipProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_RELATIONSHIP_PROP),
		ambitionsProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_AMBITIONS_PROP),
		dreamsProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_DREAMS_PROP),
		interestsProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_INTERESTS_PROP),
		valuesProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_VALUES_PROP),
		personalityTypeProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_PERSONALITY_TYPE_PROP),
		nextStepProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_NEXT_STEP_PROP),
		followUpDateProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_FOLLOW_UP_DATE_PROP),
		datesProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_DATES_PROP),
		historyNoteProp: z.string().catch(SETTINGS_DEFAULTS.DEFAULT_HISTORY_NOTE_PROP),
	})
	.strip();

/**
 * Complete plugin settings schema combining all sub-schemas
 */
export const PeopleManagerSettingsSchema = GeneralSettingsSchema.extend(NotificationsSettingsSchema.shape)
	.extend(PropsSettingsSchema.shape)
	.extend({
		version: z.number().int().positive().catch(1),
	})
	.strip();

export type PeopleManagerSettings = z.infer<typeof PeopleManagerSettingsSchema>;

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: PeopleManagerSettings = {
	version: 1,
	...GeneralSettingsSchema.parse({}),
	...NotificationsSettingsSchema.parse({}),
	...PropsSettingsSchema.parse({}),
};

/**
 * Sanitize and validate settings with proper merging
 */
export function sanitizeSettings(settings: unknown): PeopleManagerSettings {
	const merged = {
		...DEFAULT_SETTINGS,
		...(typeof settings === "object" && settings !== null ? settings : {}),
	};
	const result = PeopleManagerSettingsSchema.safeParse(merged);
	if (result.success) {
		return result.data;
	}
	console.warn("[PeopleManager] Settings validation failed, using defaults:", result.error);
	return DEFAULT_SETTINGS;
}
