import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { App, notify } from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "@testing-library/jest-dom";

const queryClient = new QueryClient({
	// Disable the default retries on queries so tests won't time out
	defaultOptions: {
		queries: {
			retry: false,
		},
		mutations: {
			onError: notify,
		},
	},
});

const renderWithProviders = (children: React.ReactNode) =>
	render(
		<QueryClientProvider client={queryClient}>
			<ToastContainer />
			{children}
		</QueryClientProvider>,
	);

const newTaskContent = "New task";
const defaultTaskContent = "Default task";

const server = setupServer(
	rest.get("/tasks", (_, res, ctx) => {
		return res(ctx.json([{ id: 1, content: defaultTaskContent, done: false }]));
	}),

	rest.post("/tasks", (_, res, ctx) => {
		return res(ctx.json({ id: 2, content: newTaskContent, done: false }));
	}),

	rest.delete("/tasks/:id", (_, res, ctx) => {
		return res(ctx.json({ id: 1, content: defaultTaskContent, done: false }));
	}),

	rest.patch("/tasks/:id", (_, res, ctx) => {
		return res(ctx.json({ id: 1, content: defaultTaskContent, done: true }));
	}),
);

beforeAll(() => server.listen());
// Reset useQuery cache otherwise added tasks will be still displayed
afterEach(() => queryClient.resetQueries());
afterAll(() => server.close());

it("Displays the loading state", async () => {
	renderWithProviders(<App />);

	expect(await screen.findByTestId("loading-div")).toBeInTheDocument();
});

it("Displays the error", async () => {
	server.use(
		rest.get("/tasks", (_, res, ctx) => {
			return res.once(ctx.status(500));
		}),
	);

	renderWithProviders(<App />);

	expect(await screen.findByTestId("error-div")).toBeInTheDocument();
});

it("Displays tasks on the screen", async () => {
	renderWithProviders(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();
});

it("Displays no tasks message on the screen", async () => {
	server.use(
		rest.get("/tasks", (_, res, ctx) => {
			return res.once(ctx.json([]));
		}),
	);

	renderWithProviders(<App />);

	expect(await screen.findByText("No tasks to show")).toBeInTheDocument();
});

it("Shows the min task length input error", async () => {
	renderWithProviders(<App />);

	const addTaskButton = screen.getByTestId("add-task-btn");

	await userEvent.click(addTaskButton);

	expect((await screen.findByTestId("input-error-msg")).textContent).toEqual(
		"Task cannot be empty",
	);
});

it("Shows the max task length input error", async () => {
	renderWithProviders(<App />);

	const addTaskButton = screen.getByTestId("add-task-btn");
	const addTaskInput = screen.getByTestId("add-task-input");

	await userEvent.type(addTaskInput, "a".repeat(31));

	await userEvent.click(addTaskButton);

	expect((await screen.findByTestId("input-error-msg")).textContent).toEqual("Max 30 characters");
});

it("Adds a task", async () => {
	renderWithProviders(<App />);

	const addTaskButton = screen.getByTestId("add-task-btn");
	const addTaskInput = screen.getByTestId("add-task-input");

	await userEvent.type(addTaskInput, newTaskContent);

	await userEvent.click(addTaskButton);

	expect(await screen.findByText(newTaskContent)).toBeInTheDocument();
});

it("Shows an api error while adding a task", async () => {
	server.use(
		rest.post("/tasks", (_, res, ctx) => {
			return res.once(ctx.status(500));
		}),
	);

	renderWithProviders(<App />);

	const addTaskButton = screen.getByTestId("add-task-btn");
	const addTaskInput = screen.getByTestId("add-task-input");

	await userEvent.type(addTaskInput, newTaskContent);

	await userEvent.click(addTaskButton);

	expect(
		await screen.findByText("Something went wrong, please try again later"),
	).toBeInTheDocument();
	expect(screen.queryByText(newTaskContent)).not.toBeInTheDocument();
});

it("Deletes a task", async () => {
	renderWithProviders(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();

	const deleteButton = screen.getByTestId("delete-task-btn");

	await userEvent.click(deleteButton);

	expect(screen.getByText("No tasks to show")).toBeInTheDocument();
});

it("Shows an api error while deleting a task", async () => {
	server.use(
		rest.delete("/tasks/:id", (_, res, ctx) => {
			return res.once(ctx.status(500));
		}),
	);

	renderWithProviders(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();

	const deleteButton = screen.getByTestId("delete-task-btn");

	await userEvent.click(deleteButton);

	expect(
		await screen.findByText("Something went wrong, please try again later"),
	).toBeInTheDocument();
	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();
});

it("Edits a task", async () => {
	renderWithProviders(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();

	expect(screen.getByTestId("task-edit-checkbox")).not.toBeChecked();

	const editTaskDone = screen.getByTestId("task-edit-checkbox");

	await userEvent.click(editTaskDone);

	expect(await screen.findByTestId("task-edit-checkbox")).toBeChecked();
});

it("Shows an api error while editing a task", async () => {
	server.use(
		rest.patch("/tasks/:id", (_, res, ctx) => {
			return res.once(ctx.status(500));
		}),
	);

	renderWithProviders(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();

	expect(screen.getByTestId("task-edit-checkbox")).not.toBeChecked();

	const editTaskDone = screen.getByTestId("task-edit-checkbox");

	await userEvent.click(editTaskDone);

	expect(
		await screen.findByText("Something went wrong, please try again later"),
	).toBeInTheDocument();
	expect(await screen.findByTestId("task-edit-checkbox")).not.toBeChecked();
});
