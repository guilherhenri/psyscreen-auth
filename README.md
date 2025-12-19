<div align="center">

# PsyScreen Auth Microservice

Authentication microservice built with NestJS and Kafka for event-driven architecture in psychological screening systems.

</div>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white" alt="Kafka"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- **pnpm** (recommended) or npm/yarn
- **Docker** and **Docker Compose** for running dependencies
- **Node.js 22+**

### Installation & Running

All commands should be executed from the **root directory** of the project.

**1. Clone the Repository**

```bash
git clone https://github.com/guilherhenri/psyscreen-auth.git
cd psyscreen-auth
```

**2. Set Up Environment Variables**

Copy the example file or create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Or create manually with the following variables:

```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_USER=auth
DATABASE_PASSWORD=auth123
DATABASE_NAME=auth
DATABASE_PORT=5482
JWT_PRIVATE_KEY=your-rsa-private-key-base64
JWT_PUBLIC_KEY=your-rsa-public-key-base64
KAFKAJS_NO_PARTITIONER_WARNING=1
KAFKA_BROKER=localhost:9092
```

> **Note:** Generate RSA keys using `ssh-keygen -t rsa -b 2048 -m PEM` and convert them to base64: `base64 -i private_key.pem` and `base64 -i public_key.pem`

**3. Start Dependencies (PostgreSQL + Kafka)**

```bash
docker compose up -d
```

**4. Install Dependencies & Run Migrations**

```bash
pnpm install
pnpm migration:run:dev
```

**5. Start the Microservice**

```bash
pnpm start:dev
```

🎉 **All done!** The microservice is now listening to Kafka topics and ready to process authentication commands.

---

## Docker Deployment

**Pull the image:**

```bash
docker pull guilherhenri/psyscreen-auth:latest
```

**Run the container:**

```bash
docker run -d \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_USER=auth \
  -e DATABASE_PASSWORD=your-password \
  -e DATABASE_NAME=auth \
  -e DATABASE_PORT=5432 \
  -e JWT_PRIVATE_KEY=your-private-key \
  -e JWT_PUBLIC_KEY=your-public-key \
  -e KAFKA_BROKER=kafka:9092 \
  guilherhenri/psyscreen-auth:latest
```

---

## Kafka Topics

The service listens to the following Kafka topics:

| Topic                   | Handler                         | Description         |
| ----------------------- | ------------------------------- | ------------------- |
| `auth.command.register` | `register-user-command.handler` | User registration   |
| `auth.command.login`    | `login-user-command.handler`    | User authentication |
| `auth.command.refresh`  | `refresh-token-command.handler` | Token refresh       |
| `auth.command.jwks`     | `jwks-keys-command.handler`     | JWKS keys retrieval |

**Consumer Group:** `auth-consumer`

---

## Tests

There are two types of tests:

- **Unit tests** → Domain logic and use cases
- **Integration tests** → Kafka handlers with real database

### Available test scripts

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run integration tests
pnpm test:integration

# Generate coverage report
pnpm test:cov
```

---

## Technical Decisions

### Architecture

**Clean Architecture + DDD**  
The project follows Clean Architecture principles with Domain-Driven Design patterns:

- **Domain Layer**: Entities (business logic)
- **Application Layer**: Use cases and repository interfaces
- **Infrastructure Layer**: Framework-specific implementations (NestJS, TypeORM, Kafka)

This separation ensures:

- Business logic is framework-agnostic
- Easy testing with in-memory repositories
- Flexibility to swap implementations

**Event-Driven with Kafka**  
Chose Kafka over HTTP REST for decoupled communication between microservices. This provides:

- Asynchronous processing
- Scalability and fault tolerance
- Event sourcing capabilities for future audit logs

### Database

**TypeORM + PostgreSQL**  
TypeORM provides:

- Type-safe database operations
- Automatic migrations
- Repository pattern implementation

**Migration Strategy**  
All schema changes are versioned and tracked via TypeORM migrations, ensuring consistent deployments across environments.

### Security

**JWT with RSA Keys**  
Using RSA (asymmetric encryption) instead of HMAC because:

- Public key can be shared safely for token verification
- Private key stays secure in the auth service
- Supports JWKS endpoint for microservices architecture

**Password Hashing**  
BCrypt with salt rounds for secure password storage, resistant to rainbow table attacks.

### Why TypeScript?

TypeScript provides:

- Type safety for domain entities and DTOs
- Better IDE support and refactoring
- Prevents runtime errors in Kafka message handling
- Industry standard for production NestJS applications

---

## Project Structure

```
src/
├── core/              # Shared kernel (entities, events, Either monad)
├── domain/
│   ├── application/   # Use cases and interfaces
│   └── enterprise/    # Domain entities
└── infra/             # Framework implementations
    ├── database/      # TypeORM entities and repositories
    ├── handlers/      # Kafka message handlers
    ├── cryptography/  # JWT and BCrypt implementations
    └── services/      # JWKS service
```

---

## Available Scripts

### Development

```json
{
  "start:dev": "Start development server with hot-reload",
  "start:debug": "Start with Node.js debugger attached",
  "migration:generate": "Generate migration from entity changes",
  "migration:run:dev": "Apply pending migrations (development)",
  "migration:revert:dev": "Rollback last migration (development)",
  "migration:show:dev": "Show all migrations and their status"
}
```

### Production

```json
{
  "build": "Build application for production",
  "start:prod": "Start production server",
  "migration:run:prod": "Apply pending migrations (production)",
  "migration:revert:prod": "Rollback last migration (production)",
  "migration:show:prod": "Show all migrations and their status"
}
```

### Testing & Quality

```json
{
  "test": "Run unit tests",
  "test:watch": "Run tests in watch mode",
  "test:integration": "Run integration tests",
  "test:cov": "Generate test coverage report",
  "check": "Type-check without emitting files",
  "lint": "Fix linting issues automatically",
  "format": "Format code with Prettier"
}
```

### Usage Examples

```bash
# Development workflow
pnpm start:dev
pnpm migration:generate src/infra/database/migrations/add-users-table
pnpm migration:run:dev

# Production deployment (Docker)
docker exec -it auth-service pnpm migration:run:prod
docker exec -it auth-service pnpm start:prod

# Testing
pnpm test:cov
pnpm test:integration
```

---

## Environment Variables

| Variable                         | Required | Default        | Description                         |
| -------------------------------- | -------- | -------------- | ----------------------------------- |
| `NODE_ENV`                       | Yes      | -              | Application environment             |
| `DATABASE_HOST`                  | Yes      | -              | PostgreSQL host                     |
| `DATABASE_USER`                  | Yes      | -              | Database user                       |
| `DATABASE_PASSWORD`              | Yes      | -              | Database password                   |
| `DATABASE_NAME`                  | Yes      | -              | Database name                       |
| `DATABASE_PORT`                  | Yes      | -              | Database port                       |
| `JWT_PRIVATE_KEY`                | Yes      | -              | RSA private key for JWT signing     |
| `JWT_PUBLIC_KEY`                 | Yes      | -              | RSA public key for JWT verification |
| `KAFKA_BROKER`                   | No       | localhost:9092 | Kafka broker address                |
| `KAFKAJS_NO_PARTITIONER_WARNING` | No       | 1              | Suppress KafkaJS warnings           |

---

## Docker Image

**Docker Hub:** `guilherhenri/psyscreen-auth`

The image is built with multi-stage builds for optimized size and security:

- Base: Node.js 22 Alpine
- Production dependencies only
- Built-in health checks for Kafka connectivity

---

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
