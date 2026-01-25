import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import obsidianmd from "eslint-plugin-obsidianmd";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	// Base recommended configs
	js.configs.recommended,
	...tseslint.configs.recommended,
	...obsidianmd.configs.recommended,
	eslintConfigPrettier,

	// Global ignores
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/main.js",
			"**/styles.css",
			"**/*.d.ts",
			"**/docs-site/**",
			"**/build/**",
			"**/coverage/**",
			"**/.cache/**",
			".eslintcache",
			"**/shared/**/*.js", // Exclude compiled JS files
			"**/src/**/*.js", // Exclude compiled JS files
			"**/tests/**/*.js", // Exclude compiled JS files
		],
	},

	// TypeScript/JavaScript files configuration
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.js", ".prettierrc.mjs", "vitest.config.ts", "version-bump.mjs"],
					defaultProject: "tsconfig.json",
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"no-console": "warn",
			"prefer-const": "error",
		},
	},

	// TypeScript declaration files
	{
		files: ["**/*.d.ts"],
		rules: {
			"@typescript-eslint/triple-slash-reference": "off",
		},
	},
]);
