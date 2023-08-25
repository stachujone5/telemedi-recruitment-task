import React from "react";
import ReactDOM from "react-dom/client";
import { App, notify } from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			onError: notify,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
			<ToastContainer />
		</QueryClientProvider>
	</React.StrictMode>,
);
