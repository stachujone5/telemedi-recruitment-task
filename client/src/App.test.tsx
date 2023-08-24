import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { App } from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

const client = new QueryClient({
	// Disable the default retries on queries and mutations so tests won't time out
	defaultOptions: {
		queries: {
			retry: false,
		},
		mutations: {
			retry: false,
		},
	},
});

const renderWithQueryClient = (children: React.ReactNode) =>
	render(<QueryClientProvider client={client}>{children}</QueryClientProvider>);

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
afterEach(() => client.resetQueries());
afterAll(() => server.close());

it("Displays the loading state", async () => {
	renderWithQueryClient(<App />);

	expect(await screen.findByTestId("loading-div")).toBeInTheDocument();
});

it("Displays the error", async () => {
	server.use(
		rest.get("/tasks", (_, res, ctx) => {
			return res.once(ctx.status(500));
		}),
	);

	renderWithQueryClient(<App />);

	expect(await screen.findByTestId("error-div")).toBeInTheDocument();
});

it("Displays tasks on the screen", async () => {
	renderWithQueryClient(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();
});

it("Displays no tasks message on the screen", async () => {
	server.use(
		rest.get("/tasks", (_, res, ctx) => {
			return res.once(ctx.json([]));
		}),
	);

	renderWithQueryClient(<App />);

	expect(await screen.findByText("No tasks to show")).toBeInTheDocument();
});

it("Shows the min task length input error", async () => {
	renderWithQueryClient(<App />);

	const addTaskButton = screen.getByTestId("add-task-btn");

	await userEvent.click(addTaskButton);

	expect((await screen.findByTestId("input-error-msg")).textContent).toEqual(
		"Task cannot be empty",
	);
});

it("Shows the max task length input error", async () => {
	renderWithQueryClient(<App />);

	const addTaskButton = screen.getByTestId("add-task-btn");
	const addTaskInput = screen.getByTestId("add-task-input");

	await userEvent.type(addTaskInput, "a".repeat(31));

	await userEvent.click(addTaskButton);

	expect((await screen.findByTestId("input-error-msg")).textContent).toEqual("Max 30 characters");
});

it("Adds a task", async () => {
	renderWithQueryClient(<App />);

	const addTaskButton = screen.getByTestId("add-task-btn");
	const addTaskInput = screen.getByTestId("add-task-input");

	await userEvent.type(addTaskInput, newTaskContent);

	await userEvent.click(addTaskButton);

	expect(await screen.findByText(newTaskContent)).toBeInTheDocument();
});

it("Deletes a task", async () => {
	renderWithQueryClient(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();

	const deleteButton = screen.getByTestId("delete-task-btn");

	await userEvent.click(deleteButton);

	expect(screen.getByText("No tasks to show")).toBeInTheDocument();
});

it("Edits a task", async () => {
	renderWithQueryClient(<App />);

	expect(await screen.findByText(defaultTaskContent)).toBeInTheDocument();

	expect(screen.getByTestId("task-edit-checkbox")).not.toBeChecked();

	const editTaskDone = screen.getByTestId("task-edit-checkbox");

	await userEvent.click(editTaskDone);

	expect(await screen.findByTestId("task-edit-checkbox")).toBeChecked();
});
