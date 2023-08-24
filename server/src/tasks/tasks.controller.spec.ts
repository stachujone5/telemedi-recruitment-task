import { Test, TestingModule } from "@nestjs/testing";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { TaskDto, CreateTaskDto, UpdateTaskDto } from "./tasks.dto";

const testTask: TaskDto = {
	id: 1,
	content: "Test Task 1 Content",
	done: false,
};

const nonExistentTaskId = 999;

describe("Tasks Controller", () => {
	let controller: TasksController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TasksController],
			providers: [
				{
					provide: TasksService,
					useValue: {
						getTasks: jest.fn().mockResolvedValue([testTask]),
						createTask: jest
							.fn()
							.mockImplementation((createTaskDto: CreateTaskDto) =>
								Promise.resolve({ ...testTask, ...createTaskDto }),
							),
						updateTask: jest.fn().mockImplementation((id: number, updateTaskDto: UpdateTaskDto) => {
							if (id === nonExistentTaskId) {
								return Promise.reject({ message: "Task not found", statusCode: 404 });
							}

							return Promise.resolve({ content: testTask.content, done: updateTaskDto.done, id });
						}),
						deleteTask: jest.fn().mockImplementation((id: number) => {
							if (id === nonExistentTaskId) {
								return Promise.reject({ message: "Task not found", statusCode: 404 });
							}
							return Promise.resolve({ ...testTask, id });
						}),
					},
				},
			],
		}).compile();

		controller = module.get<TasksController>(TasksController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("findAll", () => {
		it("should get an array of tasks", async () => {
			await expect(controller.findAll()).resolves.toEqual([testTask]);
		});
	});

	describe("create", () => {
		it("should create a new task", async () => {
			const createTaskDto: CreateTaskDto = {
				content: "New Task Content",
			};

			await expect(controller.create(createTaskDto)).resolves.toEqual({
				id: testTask.id,
				done: false,
				...createTaskDto,
			});
		});
	});

	describe("update", () => {
		it("should update a task", async () => {
			const updateTaskDto: UpdateTaskDto = {
				done: true,
			};
			await expect(controller.update(testTask.id, updateTaskDto)).resolves.toEqual({
				id: testTask.id,
				content: testTask.content,
				...updateTaskDto,
			});
		});

		it("should handle updating a non-existent task", async () => {
			const updateTaskDto: UpdateTaskDto = {
				done: true,
			};
			await expect(controller.update(nonExistentTaskId, updateTaskDto)).rejects.toEqual({
				message: "Task not found",
				statusCode: 404,
			});
		});
	});

	describe("delete", () => {
		it("should delete a task", async () => {
			await expect(controller.delete(testTask.id)).resolves.toEqual(testTask);
		});

		it("should handle deleting a non-existent task", async () => {
			await expect(controller.delete(nonExistentTaskId)).rejects.toEqual({
				message: "Task not found",
				statusCode: 404,
			});
		});
	});
});
