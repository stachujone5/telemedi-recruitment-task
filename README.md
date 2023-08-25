# Telemedi Recruitment Task

This project is a todo list monorepo with NestJS on the backend and React on the frontend.

## Getting Started

### Prerequisites

Make sure you have `pnpm` installed globally. If not, you can install it using npm or yarn:

```bash
npm install -g pnpm
```

### Running Apps in Development Mode

To run the applications in development mode using `pnpm dev`, follow these steps:

### Backend Setup

1. Navigate to the `server` directory:

```bash
cd server
```

2. Create a `.env` file if it doesn't exist by copying from the `.env.example` file:

```bash
cp .env.example .env
```

3. Start the development database by running Docker Compose:

```bash
docker-compose up -d
```

4. Install the backend dependencies:

```bash
pnpm install
```

5. Run the backend server on http://localhost:8000 in development mode:

```bash
pnpm dev
```

### Frontend Setup

1. Navigate to the `client` directory:

```bash
cd client
```

2. Install the frontend dependencies:

```bash
pnpm install
```

3. Run the frontend server on http://localhost:3000 in development mode:

```bash
pnpm dev
```

### Running Tests Manually

To run the frontend tests manually:

1. Navigate to the `client` directory:

```bash
cd client
```

2. Install the dependencies:

```bash
pnpm install
```

3. Run the tests:

```bash
pnpm test
```

To run the backend tests manually:

1. Navigate to the `server` directory:

```bash
cd server
```

2. Install the dependencies:

```bash
pnpm install
```

3. Run the tests:

```bash
pnpm test
```

### Building and Running with Docker Compose

Important Note: The Docker Compose configuration provided already includes dummy environment data, so there is no need for an additional .env file. You can directly proceed with the following steps.

To build and run the app using Docker Compose:

1. Build and start the Docker containers using Docker Compose:

```bash
docker-compose up
```

2. Access the applications:

Frontend (React): http://localhost:8000
Backend (NestJS): http://localhost:3000

### Additional Notes

Backend and frontend tests can be run within Docker containers:

Frontend Tests in Docker:

```bash
docker exec -it telemedi-recruitment-task-client-1 pnpm test
```

Backend Tests in Docker:

```bash
docker exec -it telemedi-recruitment-task-server-1 pnpm test
```

## Technologies

- React
- Typescript
- TailwindCSS
- React Query
- React Hook Form
- Zod
- NestJS
- Prisma
- PostgreSQL
- Docker
- Frontend tested with Vitest, MSW and React Testing Library
- Backend tested with Jest
