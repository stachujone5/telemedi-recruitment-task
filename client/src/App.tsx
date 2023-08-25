import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardCheck, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const BASE_API_URL = "http://localhost:3000";

const TASKS_QUERY_KEY = ["tasks"];

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

const taskFormSchema = z.object({
	taskContent: z
		.string()
		.min(1, { message: "Task cannot be empty" })
		.max(30, { message: "Max 30 characters" }),
});

export const App = () => {
	const {
		register,
		reset,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof taskFormSchema>>({
		resolver: zodResolver(taskFormSchema),
	});

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

	const handleEdit = (id: number, done: boolean) => {
		editTask({ id, done: !done });
	};

	const handleDelete = (id: number) => {
		deleteTask(id);
	};

	const onSubmit = (data: z.infer<typeof taskFormSchema>) => {
		addTask(data.taskContent);
		reset();
	};

	return (
		<div className="flex h-screen w-screen items-center justify-center bg-gray-900">
			<div className="flex h-96 max-w-[24rem] flex-col overflow-hidden rounded-lg bg-gray-800 p-8 text-gray-200 shadow-lg">
				<div className="mb-6 flex items-center">
					<ClipboardCheck className="text-blue-600" />

					<h1 className="ml-3 text-lg font-semibold">Tasks</h1>
				</div>
				{isError && (
					<div
						data-testid="error-div"
						className="flex flex-grow flex-col items-center justify-center text-center text-red-500"
					>
						<p>Something went wrong</p>
						<p>Please try again later</p>
					</div>
				)}
				{isLoading && (
					<div data-testid="loading-div" className="flex-grow animate-pulse rounded bg-gray-900" />
				)}
				{tasks &&
					(tasks.length > 0 ? (
						<div className="flex-grow overflow-y-auto">
							{tasks.map((task) => (
								<div key={task.id} className="flex h-10">
									<input
										data-testid="task-edit-checkbox"
										className="peer hidden"
										type="checkbox"
										id={task.id.toString()}
										checked={task.done}
										onChange={() => handleEdit(task.id, task.done)}
									/>
									<label
										className="flex h-10 flex-grow cursor-pointer items-center rounded px-2 transition-colors hover:bg-gray-900 peer-checked:[&>*:nth-child(1)]:border-[#10b981] peer-checked:[&>*:nth-child(1)]:bg-[#10b981] peer-checked:[&>*:nth-child(1)]:text-white peer-checked:[&>*:nth-child(2)]:text-[#9ca3af] peer-checked:[&>*:nth-child(2)]:line-through"
										htmlFor={task.id.toString()}
									>
										<span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-500 text-transparent ">
											<Check />
										</span>
										<span className="ml-4 text-sm">{task.content}</span>
									</label>
									<button
										data-testid="delete-task-btn"
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
					))}
				<form className="mt-2 flex items-center" onSubmit={handleSubmit(onSubmit)}>
					<input
						data-testid="add-task-input"
						id="addTask"
						className="h-8 w-full bg-transparent font-medium focus:outline-none"
						type="text"
						placeholder="add a new task"
						autoFocus={true}
						{...register("taskContent")}
					/>

					<button
						data-testid="add-task-btn"
						className="rounded-md p-2 transition-colors hover:bg-green-500"
						type="submit"
					>
						<Plus />
					</button>
				</form>
				{errors.taskContent?.message && (
					<p data-testid="input-error-msg" className="text-xs text-red-500">
						{errors.taskContent.message}
					</p>
				)}
			</div>
		</div>
	);
};
