import { Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
	constructor(private readonly tasksSerivce: TasksService) {}

	@Get()
	findAll(): string {
		return "Get tasks";
	}

	@Post()
	create(): string {
		return "Create task";
	}

	@Patch(":id")
	update(@Param("id") id: string): string {
		console.log(id);

		return "Update task";
	}

	@Delete(":id")
	delete(@Param("id") id: string): string {
		console.log(id);

		return "Delete task";
	}
}
