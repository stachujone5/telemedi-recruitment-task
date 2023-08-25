import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
	},
	server: {
		port: 8000,
	},
	preview: {
		host: "0.0.0.0",
		port: 8000,
	},
});
