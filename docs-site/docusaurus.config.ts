import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
	title: "Plugin Name",
	tagline: "A brief description of your plugin's purpose and functionality.",
	favicon: "img/favicon.ico",

	url: "https://yourusername.github.io",
	baseUrl: "/plugin-name/",

	organizationName: "yourusername",
	projectName: "plugin-name",

	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",
	trailingSlash: false,

	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					path: "docs",
					routeBasePath: "/",
					sidebarPath: "./sidebars.ts",
					editUrl:
						"https://github.com/yourusername/plugin-name/edit/main/docs-site/",
					showLastUpdateAuthor: true,
					showLastUpdateTime: true,
				},
				blog: false,
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],

	themes: [
		[
			"@easyops-cn/docusaurus-search-local",
			{
				hashed: true,
				docsRouteBasePath: "/",
				indexDocs: true,
				indexBlog: false,
				indexPages: true,
				highlightSearchTermsOnTargetPage: true,
				searchBarShortcutHint: false,
			},
		],
	],

	themeConfig: {
		image: "img/docusaurus-social-card.jpg",
		colorMode: {
			defaultMode: "dark",
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: "Plugin Name",
			logo: {
				alt: "Plugin Name Logo",
				src: "img/logo.svg",
				href: "/",
			},
			items: [
				{
					to: "/features/overview",
					label: "Features",
					position: "left",
				},
				{
					href: "https://www.youtube.com/watch?v=bIVNj6fkTc8",
					label: "Video",
					position: "right",
				},
				{
					href: "https://github.com/Real1tyy/plugin-name",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Docs",
					items: [
						{
							label: "Plugin Name",
							to: "/",
						},
						{
							label: "Installation",
							to: "/installation",
						},
						{
							label: "Quick Start",
							to: "/quickstart",
						},
						{
							label: "Changelog",
							to: "/changelog",
						},
					],
				},
				{
					title: "Community",
					items: [
						{
							label: "Contributing & Support",
							to: "/contributing",
						},
						{
							label: "GitHub Issues",
							href: "https://github.com/yourusername/plugin-name/issues",
						},
					],
				},
				{
					title: "More",
					items: [
						{
							label: "YouTube Video",
							href: "https://www.youtube.com/watch?v=bIVNj6fkTc8",
						},
						{
							label: "Repository",
							href: "https://github.com/yourusername/plugin-name",
						},
						{
							label: "Releases",
							href: "https://github.com/yourusername/plugin-name/releases",
						},
					],
				},
				{
					title: "Support",
					items: [
						{
							label: "Support My Work",
							href: "https://github.com/yourusername#-support-my-work",
						},
					],
				},
			],
			copyright: `© ${new Date().getFullYear()} Plugin Name`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
			additionalLanguages: ["bash", "json", "typescript", "yaml"],
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
