import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { Task } from "@prisma/client";
import { CreateTaskDto, TaskDto, UpdateTaskDto } from "./tasks.dto";

@Injectable()
export class TasksService {
	constructor(private prisma: PrismaService) {}

	async getTasks(): Promise<Task[]> {
		return this.prisma.task.findMany();
	}

	async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
		return this.prisma.task.create({
			data: createTaskDto,
		});
	}

	async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
		return this.prisma.task.update({
			data: updateTaskDto,
			where: { id },
		});
	}

	async deleteTask(id: number): Promise<TaskDto> {
		return this.prisma.task.delete({ where: { id } });
	}
}
