import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Task, Prisma } from "@prisma/client";

@Injectable()
export class TasksService {
	constructor(private prisma: PrismaService) {}

	async getTasks(): Promise<Task[]> {
		return this.prisma.task.findMany();
	}

	async createTask(data: Prisma.TaskCreateInput): Promise<Task> {
		return this.prisma.task.create({
			data,
		});
	}

	async updateTask(params: {
		where: Prisma.TaskWhereUniqueInput;
		data: Prisma.TaskUpdateInput;
	}): Promise<Task> {
		const { where, data } = params;
		return this.prisma.task.update({
			data,
			where,
		});
	}

	async deleteTask(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
		return this.prisma.task.delete({
			where,
		});
	}
}
