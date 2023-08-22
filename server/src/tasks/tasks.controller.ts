import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { Task } from "@prisma/client";
import { CreateTaskDto, UpdateTaskDto } from "./tasks.dto";

@Controller("tasks")
export class TasksController {
	constructor(private readonly tasksSerivce: TasksService) {}

	@Get()
	findAll(): Promise<Task[]> {
		return this.tasksSerivce.getTasks();
	}

	@Post()
	create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
		return this.tasksSerivce.createTask(createTaskDto);
	}

	@Patch(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateTaskDto: UpdateTaskDto,
	): Promise<Task> {
		return this.tasksSerivce.updateTask({ where: { id }, data: updateTaskDto });
	}

	@Delete(":id")
	delete(@Param("id", ParseIntPipe) id: number): Promise<Task> {
		return this.tasksSerivce.deleteTask({ id });
	}
}
