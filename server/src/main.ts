import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { PrismaClientExceptionFilter } from "./db/prisma-client-exception.filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);

	const config = new DocumentBuilder().setTitle("Tasks").setVersion("1.0").addTag("tasks").build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	const { httpAdapter } = app.get(HttpAdapterHost);
	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

	await app.listen(3000);
}

void bootstrap();
