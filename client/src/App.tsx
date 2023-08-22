import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardCheck, Plus, X } from "lucide-react";
import { KeyboardEvent, useRef } from "react";
import { z } from "zod";

const TASKS_QUERY_KEY = ["tasks"];

const BASE_API_URL = "http://localhost:3000";

const taskSchema = z.object({ content: z.string(), done: z.boolean(), id: z.number() });

const getTasks = async () => {
	const response = await fetch(`${BASE_API_URL}/tasks`);

	if (!response.ok) {
		throw new Error();
	}

	const data = await response.json();

	return z.array(taskSchema).parse(data);
};

const addTaskFn = async (content: string) => {
	const response = await fetch(`${BASE_API_URL}/tasks`, {
		method: "POST",
		body: JSON.stringify({ content }),
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error();
	}

	const data = await response.json();

	return taskSchema.parse(data);
};

const editTaskFn = async ({ id, done }: { id: number; done: boolean }) => {
	const response = await fetch(`${BASE_API_URL}/tasks/${id}`, {
		method: "PATCH",
		body: JSON.stringify({ done }),
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error();
	}

	const data = await response.json();

	return taskSchema.parse(data);
};

const deleteTaskFn = async (id: number) => {
	const response = await fetch(`${BASE_API_URL}/tasks/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error();
	}

	const data = await response.json();

	return taskSchema.parse(data);
};

export const App = () => {
	const taskInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();
	const {
		data: tasks,
		isLoading,
		isError,
	} = useQuery({
		queryKey: TASKS_QUERY_KEY,
		queryFn: getTasks,
	});

	const { mutate: addTask } = useMutation({
		mutationFn: addTaskFn,
		onSuccess: (newTask) => {
			const tasks = z.array(taskSchema).safeParse(queryClient.getQueryData(TASKS_QUERY_KEY));

			if (tasks.success) {
				queryClient.setQueryData(TASKS_QUERY_KEY, [...tasks.data, newTask]);
			}
		},
	});

	const { mutate: editTask } = useMutation({
		mutationFn: editTaskFn,
		onSuccess: (updatedTask) => {
			const tasks = z.array(taskSchema).safeParse(queryClient.getQueryData(TASKS_QUERY_KEY));

			if (tasks.success) {
				queryClient.setQueryData(
					TASKS_QUERY_KEY,
					tasks.data.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
				);
			}
		},
	});

	const { mutate: deleteTask } = useMutation({
		mutationFn: deleteTaskFn,
		onSuccess: (deletedTask) => {
			const tasks = z.array(taskSchema).safeParse(queryClient.getQueryData(TASKS_QUERY_KEY));

			if (tasks.success) {
				queryClient.setQueryData(
					TASKS_QUERY_KEY,
					tasks.data.filter((task) => task.id !== deletedTask.id),
				);
			}
		},
	});

	const handleAdd = () => {
		if (taskInputRef.current) {
			addTask(taskInputRef.current.value);
			taskInputRef.current.value = "";
		}
	};

	const handleTaskInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" && taskInputRef.current) {
			addTask(taskInputRef.current.value);
			taskInputRef.current.value = "";
		}
	};

	const handleEdit = (id: number, done: boolean) => {
		editTask({ id, done: !done });
	};

	const handleDelete = (id: number) => {
		deleteTask(id);
	};

	return (
		<div className="flex h-screen w-screen items-center justify-center font-medium">
			<div className="flex h-full flex-grow items-center justify-center bg-gray-100 text-gray-600">
				<div className="flex h-full flex-grow items-center justify-center bg-gray-900">
					<div className="flex h-96 w-96 max-w-full flex-col overflow-hidden rounded-lg bg-gray-800 p-8 text-gray-200 shadow-lg">
						<div className="mb-6 flex items-center">
							<ClipboardCheck className="text-blue-600" />

							<h4 className="ml-3 text-lg font-semibold">Tasks</h4>
						</div>

						{isError && (
							<div className="flex flex-grow flex-col items-center justify-center text-center text-red-500">
								<p>Something went wrong</p>
								<p>Please try again later</p>
							</div>
						)}

						{isLoading && <div className="flex-grow animate-pulse rounded bg-gray-900" />}

						{tasks && tasks.length > 0 ? (
							<div className="flex-grow overflow-y-auto">
								{tasks.map((task) => (
									<div key={task.id} className="flex h-10">
										<input
											className="hidden"
											type="checkbox"
											id={task.id.toString()}
											checked={task.done}
											onChange={() => handleEdit(task.id, task.done)}
										/>
										<label
											className="flex h-10 flex-grow cursor-pointer items-center rounded px-2 transition-colors hover:bg-gray-900"
											htmlFor={task.id.toString()}
										>
											<span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-500 text-transparent">
												<Check />
											</span>
											<span className="ml-4 text-sm">{task.content}</span>
										</label>
										<button
											onClick={() => handleDelete(task.id)}
											className="rounded-md p-2 transition-colors hover:bg-red-400"
										>
											<X />
										</button>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-grow items-center justify-center text-center text-white">
								<p>No tasks to show</p>
							</div>
						)}

						<div className="mt-2 flex items-center">
							<input
								className="h-8 flex-grow bg-transparent font-medium focus:outline-none"
								type="text"
								placeholder="add a new task"
								ref={taskInputRef}
								onKeyDown={handleTaskInputKeyDown}
							/>
							<button
								className="rounded-md p-2 transition-colors hover:bg-green-500"
								onClick={handleAdd}
							>
								<Plus />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
