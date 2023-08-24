import { TasksController } from "./tasks.controller";
import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { PrismaService } from "src/db/prisma.service";

@Module({
	controllers: [TasksController],
	providers: [PrismaService, TasksService],
})
export class TasksModule {}
