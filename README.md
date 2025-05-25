# Backend Project README

## 📦 Tech Stack

* **NestJS** for application framework
* **Prisma** for ORM and type-safe database access
* **PostgreSQL** in RDS
* **AWS CDK** to define infrastructure
* **ECS Fargate** for containerized deployment
* **SSM Parameter Store** for secrets
* **GitHub Actions** for CI/CD

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
yarn install
```

### 2. Generate Prisma client

```bash
npx prisma generate
```

### 3. Run locally

Make sure your `.env` contains the correct `DATABASE_URL`:

```bash
yarn start:dev
```

---

## 🔧 Creating a New API Resource

The backend follows a **clean architecture** pattern using:

* **DTOs** for API input/output
* **Entities** for domain models
* **Services** for business logic
* **Controllers** for routing and HTTP concerns

### ✅ Steps to create a new resource:

1. **Generate module, service, and controller:**

```bash
nest g module modules/resource-name
nest g service modules/resource-name
nest g controller modules/resource-name
```

2. **Add Prisma model:**
   Edit `prisma/schema.prisma`:

```prisma
model ResourceName {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then run:

```bash
npx prisma db push
```

3. **Create DTOs in `dto/` folder:**

```ts
// create-resource.dto.ts
export class CreateResourceDto {
  name: string;
}

// response.dto.ts
export class ResourceResponseDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

4. **Create Entity class in `entities/`:**

```ts
export class Resource {
  constructor(...) { ... }

  static fromPrisma(data: Prisma.ResourceName): Resource {
    return new Resource(...);
  }
}
```

5. **Implement the service with Prisma access**
6. **Transform entity to DTO in the controller**

This ensures clear separation between domain logic and external interface.

---

## ✅ Deployment

* Push to `main` branch triggers GitHub Actions to:

  * Build and push Docker image to ECR
  * Update ECS service

Infrastructure (VPC, RDS, ECS, SSM, etc.) is deployed via:

```bash
yarn build
cdk deploy BackendStack
```

---

## 📬 Support

For any issues or onboarding help, reach out to the backend team lead.
