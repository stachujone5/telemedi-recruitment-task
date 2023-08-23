import { PickType } from "@nestjs/swagger";
import { IsString, Length, IsInt } from "class-validator";

export class TaskDto {
	@IsInt()
	id: number;
	@IsString()
	@Length(1, 30)
	content: string;
	done: boolean;
}

export class CreateTaskDto extends PickType(TaskDto, ["content"] as const) {}

export class UpdateTaskDto extends PickType(TaskDto, ["done"] as const) {}
