import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, UpdateTaskDto, TaskDto } from "./tasks.dto";

@Controller("tasks")
export class TasksController {
	constructor(private readonly tasksSerivce: TasksService) {}

	@Get()
	findAll(): Promise<TaskDto[]> {
		return this.tasksSerivce.getTasks();
	}

	@Post()
	create(@Body() createTaskDto: CreateTaskDto): Promise<TaskDto> {
		return this.tasksSerivce.createTask(createTaskDto);
	}

	@Patch(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateTaskDto: UpdateTaskDto,
	): Promise<TaskDto> {
		return this.tasksSerivce.updateTask({ where: { id }, data: updateTaskDto });
	}

	@Delete(":id")
	delete(@Param("id", ParseIntPipe) id: number): Promise<TaskDto> {
		return this.tasksSerivce.deleteTask({ id });
	}
}
