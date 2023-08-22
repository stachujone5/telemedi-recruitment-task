/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	extends: [
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"prettier",
	],
	parserOptions: {
		project: ["tsconfig.json"],
		sourceType: "module",
		tsconfigRootDir: __dirname,
	},
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ["*.cjs"],
};
