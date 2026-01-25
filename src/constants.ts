const PLUGIN_ID = "people-manager";

// Concurrency control for parallel file processing
export const SCAN_CONCURRENCY = 10;

// Command IDs (without plugin prefix)
export const COMMAND_IDS = {
	SHOW_STATS: "show-stats",
	CHECK_FOLLOWUPS: "check-followups",
	RESYNC_PEOPLE: "resync-people",
	CREATE_PERSON: "create-person",
	SHOW_OVERDUE: "show-overdue-followups",
	SHOW_UPCOMING: "show-upcoming-followups",
} as const;

export const FULL_COMMAND_IDS = Object.fromEntries(
	Object.entries(COMMAND_IDS).map(([key, value]) => [key, `${PLUGIN_ID}:${value}`])
) as {
	[K in keyof typeof COMMAND_IDS]: `${typeof PLUGIN_ID}:${(typeof COMMAND_IDS)[K]}`;
};

export const SETTINGS_DEFAULTS = {
	// General Settings
	DEFAULT_DIRECTORY: "People",
	DEFAULT_ENABLED: true,
	DEFAULT_SHOW_RIBBON_ICON: true,
	DEFAULT_DEBUG_MODE: false,

	// Notification Settings
	DEFAULT_ENABLE_NOTIFICATIONS: true,
	DEFAULT_NOTIFICATION_CHECK_INTERVAL_MINUTES: 60,
	DEFAULT_NOTIFICATION_LEAD_TIME_HOURS: 24,
	DEFAULT_SHOW_NOTIFICATION_ON_STARTUP: true,

	// Property Names (frontmatter keys)
	DEFAULT_SEGMENT_PROP: "segment",
	DEFAULT_CITY_PROP: "city",
	DEFAULT_ORIGINAL_CITY_PROP: "original-city",
	DEFAULT_BORN_ON_PROP: "born-on",
	DEFAULT_FIRST_CONTACT_PROP: "first-contact",
	DEFAULT_SECOND_CONTACT_PROP: "second-contact",
	DEFAULT_LAST_CONTACT_PROP: "last-contact",
	DEFAULT_CONTACT_CHANNEL_PROP: "contact-channel",
	DEFAULT_POSITION_PROP: "position",
	DEFAULT_STATUS_PROP: "status",
	DEFAULT_STATUS_BUSINESS_PROP: "status-business",
	DEFAULT_TOLD_ABOUT_BUSINESS_PROP: "told-about-business",
	DEFAULT_URGENCY_PROP: "urgency",
	DEFAULT_LIKABILITY_PROP: "likability",
	DEFAULT_SOCIAL_ENERGY_PROP: "social-energy",
	DEFAULT_RELIABILITY_PROP: "reliability",
	DEFAULT_RELATIONSHIP_GOAL_PROP: "relationship-goal",
	DEFAULT_RELATIONSHIP_PROP: "relationship",
	DEFAULT_AMBITIONS_PROP: "ambitions",
	DEFAULT_DREAMS_PROP: "dreams",
	DEFAULT_INTERESTS_PROP: "interests",
	DEFAULT_VALUES_PROP: "values",
	DEFAULT_PERSONALITY_TYPE_PROP: "personality-type",
	DEFAULT_NEXT_STEP_PROP: "next-step",
	DEFAULT_FOLLOW_UP_DATE_PROP: "follow-up-date-notification",
	DEFAULT_DATES_PROP: "dates",
	DEFAULT_HISTORY_NOTE_PROP: "history-note",

	// Business Status Values
	STATUS_PROSPECT: "Prospect",
	STATUS_INFO_SESSION: "Info Session",
	STATUS_FOLLOW_UP: "Follow-up",
	STATUS_CLOSE: "Close",
	STATUS_CUSTOMER: "Customer",
	STATUS_PARTNER: "Partner",

	// Segment Values
	SEGMENT_COLD_APPROACH: "Cold Approach",
	SEGMENT_WARM: "Warm",
	SEGMENT_FAMILY: "Family",
	SEGMENT_BUSINESS: "Business",
	SEGMENT_GYM: "Gym",
	SEGMENT_UNIVERSITY: "University",
	SEGMENT_WORK: "Work",
} as const;
