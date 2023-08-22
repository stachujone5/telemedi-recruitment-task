import { Module } from "@nestjs/common";
import { TasksModule } from "./tasks/tasks.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [ConfigModule.forRoot(), TasksModule],
})
export class AppModule {}
