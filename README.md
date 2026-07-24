# Event Ticket Booking API with Concurrency Control and Fraud Prevention Workflows

A robust backend API designed for high-concurrency event ticket reservation, focusing on inventory protection, concurrency control, and automated fraud prevention workflows.

---

## 1. Project Overview

### Purpose

To mitigate common booking risks—such as double-booking, inventory overselling during concurrent requests, excessive purchases per user, and rapid automated booking attempts—through transactional workflows, database locking, and fraud detection mechanisms.

### Primary Goal

reduce common booking abuse scenarios—such as double-booking, over-selling under high concurrency, excessive purchases per user, and rapid automated bot requests—while ensuring asynchronous cleanup of unpaid reservations.

### Audience

This repository demonstrates backend engineering concepts including transactional reservation workflows, concurrency control, background job processing, and fraud prevention techniques in a TypeScript/Node.js environment.

---

## 2. Quick Start

### Prerequisites

- Docker
- Docker Compose
- Git

### Clone the repository

```bash
git clone https://github.com/<nima1133>/anti-fraud-ticketing-api.git
cd anti-fraud-ticketing-api
```

### Configure environment variables

Create a `.env` file in the project root using the following template:

```env
PORT=8000

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ticketing

JWT_SECRET=your-super-secret-key

BCRYPT_SALT_ROUNDS=12

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=90d
REFRESH_TOKEN_DB_DAYS=7
```

### Development Setup

Start the development environment:

```bash
docker compose up --build
```

### Production Setup

Start the production environment:

```bash

docker compose -f docker-compose.prod.yml up -d --build

```

During startup the application automatically:

- Applies pending database migrations
- Seeds the database with sample data
- Starts the API server
- Starts the background worker

### Default Credentials

| Role  | Email               | Password      |
| ----- | ------------------- | ------------- |
| Admin | `admin@example.com` | `password123` |
| User  | `user@example.com`  | `password123` |

### Sample Data

The seed script also creates four sample events, allowing the reservation, payment, and fraud detection workflows to be tested immediately.

## 3. Key Features

| Feature Group          | Capabilities                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**     | User registration, login, JWT token management, refresh tokens, bcrypt password hashing.                                  |
| **User Management**    | CRUD operations for user profiles, role-based authorization (`ADMIN`, `USER`).                                            |
| **Event Management**   | Event creation, metadata management, total capacity tracking, Current sold ticket tracking.                               |
| **Reservation System** | Inventory locking (`FOR UPDATE`), temporary `HOLD` reservations, idempotency protection, automated background expiration. |
| **Payment Flow**       | Payment confirmation endpoint, automatic transition from `HOLD` to confirmed status, rejection of expired reservations.   |
| **Fraud Prevention**   | Idempotency verification, maximum purchase limits per user per event, velocity checks (rate-limiting booking attempts).   |
| **Audit Logging**      | Centralized audit trailing for registration, login, booking creation, expiration, and fraud detection.                    |
| **Analytics**          | Dedicated administrative metrics covering users, events, bookings, overall dashboard stats, and cancellations.            |
| **API Documentation**  | Integrated OpenAPI/Swagger UI endpoint documentation.                                                                     |
| **Containerization**   | Multi-container environment management using Docker and Docker Compose.                                                   |
| **Testing**            | Unit testing suite covering core business, fraud, and idempotency services.                                               |

---

## 4. Technology Stack

| Category             | Technology                                      | Purpose / Usage                                  |
| -------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **Runtime**          | Node.js                                         | JavaScript runtime environment                   |
| **Language**         | TypeScript                                      | Type-safe application development                |
| **Framework**        | Express 5                                       | Web framework and routing engine                 |
| **Database**         | PostgreSQL                                      | Relational persistence store                     |
| **ORM**              | Prisma                                          | Type-safe ORM & database query builder           |
| **Queue**            | BullMQ                                          | Redis-backed background queue producer & worker  |
| **Validation**       | Zod                                             | Runtime request schema validation                |
| **Authentication**   | JWT & bcrypt                                    | Stateless token auth and password hashing        |
| **Documentation**    | Swagger (`swagger-jsdoc`, `swagger-ui-express`) | API documentation generation and UI              |
| **Testing**          | Jest & `ts-jest`                                | Unit testing runner and execution engine         |
| **Containerization** | Docker & Docker Compose                         | Containerization and multi-service orchestration |

---

## 5. System Architecture

The application adopts a feature-oriented module architecture, separating concerns into independent functional domains. Core components communicate synchronously via Express controllers and Prisma, and asynchronously using Redis and BullMQ.

```mermaid
flowchart TD
    Client[Client Application / HTTP] -->|HTTP Requests| Express[Express 5 API Service]

    subgraph Express Application
        Express --> Middlewares[Middlewares: Auth, Validation, Helmet]
        Middlewares --> Controllers[Module Controllers]
        Controllers --> Services[Business Services]
        Services --> Prisma[Prisma ORM Client]
    end

    Prisma -->|Raw SQL Locks & Queries| Postgres[(PostgreSQL Database)]
    Services -->|Enqueue Delayed Expiration| BullMQProducers[BullMQ Queue Producers]
    BullMQProducers -->|Persist Queue Jobs| Redis

    subgraph Asynchronous Processing
        Redis -->|Pop Due Expiration Jobs| Worker[BullMQ Worker]
        Worker -->|Transactional Expiration & Inventory Restore| Postgres
    end

```

---

## 6. Project Structure

The project directory is structured around functional domain modules rather than strict layer-only isolation:

```
src/
├── analytics/       # Statistical calculations and administrative overview
├── audit/           # Cross-cutting audit log execution service
├── auth/            # Authentication endpoints and JWT token issuance
├── booking/         # Core reservation business logic and workflows
├── event/           # Event creation and inventory management
├── fraud/           # Anti-fraud checks (velocity, purchase limits)
├── idempotency/     # Request duplication prevention logic
├── middlewares/     # Middleware interceptors and authorization rules
├── payment/         # Payment execution and confirmation logic
├── queues/          # BullMQ queue job producers
├── schemas/         # Zod input validation schemas
├── user/            # User profile CRUD operations
├── utils/           # Shared application utility functions
├── lib/             # Shared Prisma and Redis singleton clients
└── workers/         # Standalone BullMQ background processing scripts

```

| Folder        | Responsibility                                                                  |
| ------------- | ------------------------------------------------------------------------------- |
| `auth`        | Manages login, registration, password verification, and token operations.       |
| `booking`     | Coordinates ticket hold creation, inventory checks, and transaction boundaries. |
| `payment`     | Validates and processes confirmation requests for active holds.                 |
| `event`       | Handles event creation, updates, capacity, and current sales tracking.          |
| `user`        | Handles user account operations and role associations.                          |
| `fraud`       | Evaluates booking requests against velocity limits and purchase restrictions.   |
| `analytics`   | Provides aggregated metrics across users, events, and reservations.             |
| `audit`       | Records immutable history of security and domain-relevant actions.              |
| `idempotency` | Validates unique transaction keys to prevent duplicated submissions.            |
| `queues`      | Defines BullMQ job creation producers.                                          |
| `workers`     | Executes background task consumer loops (e.g., automated timeouts).             |
| `middlewares` | Handles error interception, auth checks, and request parsing.                   |
| `schemas`     | Provides Zod schema models for runtime payload validation.                      |
| `utils`       | Exposes reusable general-purpose functions.                                     |
| `lib`         | Maintains application-wide singletons for Prisma and Redis connections.         |

---

## 7. Request Lifecycle

The diagram below maps the execution flow of an incoming reservation request:

```mermaid
flowchart TD
    A[HTTP Request] --> B[Route Handler]
    B --> C[Zod Input Validation Schema]
    C --> D[Authentication & Authorization Middleware]
    D --> E[BookingService]
    E --> F[Open Prisma Transaction]
    F --> G[Check Idempotency Key]
    G --> H[Check User Purchase Limits]
    H --> I[Check Booking Attempt Velocity]
    I --> J[Acquire Explicit SQL Row Lock FOR UPDATE on Event]
    J --> K[Validate Event Capacity]
    K --> L[Update Capacity / Inventory]
    L --> M[Create Booking Entity in HOLD state]
    M --> N[Enqueue Delayed Expiration Job to BullMQ]
    N --> O[Write Audit Log Record]
    O --> P[Commit Transaction]
    P --> Q[HTTP 201 Response]

```

---

## 8. Database Design

### Entities & Enums

```mermaid
erDiagram
    User ||--o{ Event : creates
    User ||--o{ Booking : places
    User ||--o{ RefreshToken : owns
    User ||--o{ AuditLog : triggers
    Event ||--o{ Booking : contains

    User {
        string id PK
        string email UK
        string password
        Role role
    }

    Event {
        string id PK
        string title
        int capacity
        int soldTickets
        string createdById FK
    }

    Booking {
        string id PK
        string userId FK
        string eventId FK
        string idempotencyKey UK
        int quantity
        BookingStatus status
    }

    RefreshToken {
        string id PK
        string token UK
        string userId FK
    }

    AuditLog {
        Int id PK
        Int userId FK
        AuditAction action
        String entityType?
        Int entityId?
    }

```

### Entity Summary

| Model            | Key Fields & Constraints                                                    | Purpose                                                    |
| ---------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| **User**         | `email` (Unique), `role` (`ADMIN`                                           | `USER`), `password`                                        | Account metadata and authorization roles. |
| **Event**        | `capacity`, `soldTickets`, `createdById`                                    | Event inventory and capacity metrics.                      |
| **Booking**      | `idempotencyKey` (Unique), `status`, Composite Unique (`userId`, `eventId`) | Reservation state record.                                  |
| **RefreshToken** | `token` (Unique), `userId`                                                  | Maintains persistent access sessions.                      |
| **AuditLog**     | `action`, `entity`, `userId`                                                | Traceability log for administrative and security auditing. |

---

## 9. Authentication & Authorization

### Token Architecture

- **Access Tokens**: Short-lived JSON Web Tokens (JWT) sent via Authorization headers for protected endpoints.
- **Refresh Tokens**: Stored in the database and linked to the `User` model to allow token regeneration without re-authentication.
- **Password Hashing**: Direct plain-text passwords are never stored; standard `bcrypt` hashing is applied prior to persistence.

### Authorization Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Auth as Auth Middleware
    participant Controller as Restricted Route Controller

    Client->>Auth: Request with Bearer Access Token
    Auth->>Auth: Verify JWT Validity & Expiration
    alt Token Invalid / Expired
        Auth-->>Client: 401 Unauthorized Response
    else Token Valid
        Auth->>Auth: Inspect User Role
        alt Insufficient Role Permissions
            Auth-->>Client: 403 Forbidden Response
        else Role Authorized
            Auth->>Controller: Forward Request to Handler
            Controller-->>Client: Return Requested Resource
        end
    end

```

---

## 10. Booking Workflow

Bookings undergo strict state transitions managed through explicit database operations and background queue events.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as Booking Endpoint
    participant DB as PostgreSQL
    participant Queue as BullMQ (payment-timeout)
    participant Worker as Background Worker
    participant Payment as Payment Endpoint

    User->>API: POST /booking (Request HOLD)
    API->>DB: Begin Transaction & SQL Row Lock (FOR UPDATE)
    API->>DB: Reserve Inventory & Set Status = HOLD
    API->>Queue: Enqueue Expiration Job (10-minute delay)
    API->>DB: Commit Transaction
    API-->>User: Return Booking (Status: HOLD)

    alt Scenario A: User Confirms Payment
        User->>Payment: POST /payments (Confirm)
        Payment->>DB: Lock Booking Row & Confirm Status != EXPIRED
        Payment->>DB: Update Status = CONFIRMED
        Payment-->>User: Booking Confirmed
    else Scenario B: Payment Times Out (10 min)
        Queue->>Worker: Trigger Timeout Job Processing
        Worker->>DB: Lock Booking Row
        alt Status is still HOLD
            Worker->>DB: Update Status = EXPIRED
            Worker->>DB: Restore Event Inventory
            Worker->>DB: Write Audit Log Entry
        end
    end

```

### Booking States

| State         | Transition Trigger                        | Next Valid States                   | Description                                                            |
| ------------- | ----------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| **HOLD**      | Initial booking creation                  | `CONFIRMED`, `EXPIRED`, `CANCELLED` | Inventory is temporarily reserved pending payment confirmation.        |
| **CONFIRMED** | Successful payment endpoint invocation    | None (Terminal)                     | Ticket purchase is finalized.                                          |
| **EXPIRED**   | Timeout worker execution after 10 minutes | None (Terminal)                     | Unpaid reservation is invalidated; inventory is returned to the event. |
| **CANCELLED** | User/Admin manual cancellation            | None (Terminal)                     | Reservation is aborted; inventory is released.                         |

---

## 11. Fraud Protection

The core design centers around defensive backend execution to enforce ordering, isolate state changes, and detect unusual behavior.

```mermaid
flowchart TD
    Req[Incoming Booking Request] --> KeyCheck{Idempotency Key Present?}
    KeyCheck -- Yes --> IdemExists{Key in Database?}
    IdemExists -- Yes --> ReturnPrevious[Return Existing Reservation Payload]
    IdemExists -- No --> LimitCheck{User Exceeded 4 Tickets?}
    KeyCheck -- No --> LimitCheck

    LimitCheck -- Yes --> RejectLimit[Reject: Purchase Limit Exceeded]
    LimitCheck -- No --> VelocityCheck{Velocity Threshold Exceeded?}

    VelocityCheck -- Yes --> AuditVelocity[Write Fraud Audit Log] --> RejectVelocity[Reject: HTTP 429 Too Many Requests]
    VelocityCheck -- No --> LockRow[Acquire Row Lock: SELECT ... FOR UPDATE]

    LockRow --> CapacityCheck{Capacity Available?}
    CapacityCheck -- No --> RejectCapacity[Reject: Sold Out]
    CapacityCheck -- Yes --> Complete[Execute Reservation in Transaction]

```

| Fraud Protection Layer | Mechanism                                                  | Implementation Details                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Idempotency**        | Prevents duplicate processing of network re-transmissions. | Uses a unique `idempotencyKey` constraint; reuses the existing booking payload on duplicate calls.                                                                  |
| **Purchase Limit**     | Restricts per-user hoardings.                              | Enforces a hard maximum limit of **4 tickets** per user for a single event. Locks the booking row using `SELECT ... FOR UPDATE` before evaluation.                  |
| **Velocity Check**     | Detects automated ticket-buying scripts.                   | Counts recent booking attempts within a configured time window to detect excessive activity. Triggers a fraud audit log and returns an `HTTP 429` status on breach. |
| **Row Locking**        | Prevents race conditions during high concurrency.          | Issues explicit raw SQL `FOR UPDATE` locks on the target `Event` row inside a Prisma transaction.                                                                   |
| **Atomic Execution**   | Ensures complete data isolation.                           | Wraps validation, checks, capacity reduction, and booking creation inside a single transactional block.                                                             |

---

## 12. Background Workers

Background operations are decoupled from main HTTP request execution threads using **BullMQ** and **Redis**.

```mermaid
sequenceDiagram
    autonumber
    participant Service as Booking Service
    participant Queue as Redis Queue (payment-timeout)
    participant Worker as BullMQ Expiration Worker
    participant DB as PostgreSQL

    Service->>Queue: Push Job (Booking ID, Delay: 10 mins)
    Note over Queue,Worker: 10-Minute Waiting Period...
    Queue->>Worker: Consume Due Job
    Worker->>DB: Begin Isolation Transaction
    Worker->>DB: Select Booking FOR UPDATE
    alt Booking Status == HOLD
        Worker->>DB: Mutate Status -> EXPIRED
        Worker->>DB: Increment Available Event Inventory
        Worker->>DB: Insert AuditLog Record (Booking Expired)
        Worker->>DB: Commit Transaction
    else Booking Status != HOLD
        Worker->>DB: Rollback / Abort Job (No Action Required)
    end

```

---

## 13. Analytics

The application provides dedicated administrative analytical routes exposed under the `/analytics` route prefix.

| Endpoint Target   | Generated Metrics                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| **Overview**      | Total system users, total events, total bookings, active events count, confirmed bookings count.     |
| **Users**         | Total registered users, total admins, total regular users, newly registered users breakdown.         |
| **Events**        | Total events, upcoming events, expired events, aggregate sold tickets, total capacity across events. |
| **Bookings**      | Metrics tracking total confirmed, cancelled, and expired bookings.                                   |
| **Cancellations** | Specific statistical tracking for booking cancellation rates and trends.                             |

---

## 14. API Documentation

API endpoint specifications are generated via Swagger definitions embedded directly within the codebase.

- **Documentation UI Route**: `/docs`
- **Supported Library Drivers**: `swagger-jsdoc`, `swagger-ui-express`

Organized documentation routes cover:

- `/auth`
- `/users`
- `/events`
- `/booking`
- `/payments`
- `/audit`
- `/analytics`

---

## 15. Installation

### Prerequisites

- Node.js v22 (used in Docker environment)
- PostgreSQL
- Redis

### Step-by-Step Setup

1. Clone the repository to your local environment.
2. Install project dependencies:

```bash
npm install

```

3. Generate the Prisma Client models:

```bash
npx prisma generate

```

4. Execute database migrations:

```bash
npx prisma migrate dev

```

---

## 16. Configuration & Environment Variables

Environment configuration is managed via standard root environment variables (`.env`).

| Variable Name        | Description                                 | Required |
| -------------------- | ------------------------------------------- | -------- |
| `DATABASE_URL`       | PostgreSQL connection string URL            | Yes      |
| `JWT_SECRET`         | Secret key used to sign HTTP Access Tokens  | Yes      |
| `JWT_REFRESH_SECRET` | Secret key used to sign HTTP Refresh Tokens | Yes      |
| `PORT`               | Network port for Express server execution   | No       |

---

## 17. Docker

Containerized local execution is supported through Docker Compose configuration files containing the application API, worker services, and dependent data stores.

### Docker Services

| Service Name | Description                                                   | Ports (Host:Container) |
| ------------ | ------------------------------------------------------------- | ---------------------- |
| **app**      | Express API Service runtime instance                          | `8000:8000`            |
| **worker**   | Standalone BullMQ background processing worker worker process | N/A                    |
| **postgres** | Database engine instance                                      | `5432:5432`            |
| **redis**    | In-memory store for BullMQ and queue tracking                 | `6379:6379`            |

---

## 18. Running the Project

### Local Development Mode

Start the web server instance:

```bash
npm run dev

```

Start the background job processing worker in a separate process terminal:

```bash
npm run worker

```

---

## 19. Running Tests

Automated testing covers core business components using Jest and `ts-jest`.

### Running Tests

Execute the unit test suite:

```bash
npm test

```

### Test Coverage Summary

| Coverage Category       | Status         | Details                                                             |
| ----------------------- | -------------- | ------------------------------------------------------------------- |
| **Booking Service**     | Covered        | Tests hold logic, quantity deduction, and capacity validation.      |
| **Fraud Service**       | Covered        | Validates threshold rules, limit evaluation, and velocity triggers. |
| **Idempotency Service** | Covered        | Verifies payload caching, key collisions, and re-entry handling.    |
| **Integration Tests**   | Not Documented | Integration tests are not included in the source archive.           |
| **End-to-End Tests**    | Not Documented | End-to-end testing flows are not present.                           |

---

## 20. Error Handling

System-wide errors are intercepted by global Express error-handling middleware to present structured output formats.

| Error Exception Type      | Target HTTP Status Code | Scenario / Trigger Condition                                         |
| ------------------------- | ----------------------- | -------------------------------------------------------------------- |
| **Validation Error**      | `400 Bad Request`       | Failed runtime request body schema check (Zod).                      |
| **Authentication Error**  | `401 Unauthorized`      | Missing, expired, or malformed JWT access tokens.                    |
| **Permission Error**      | `403 Forbidden`         | Non-admin user attempting administrative operations.                 |
| **Rate / Velocity Error** | `429 Too Many Requests` | Rapid excessive booking submission attempts within a short duration. |
| **Conflict Error**        | `409 Conflict` / Custom | Purchasing beyond capacity or processing expired reservations.       |
| **Unhandled Exception**   | `500 Internal Error`    | Unexpected runtime failures captured by central handling middleware. |

---

## 21. Security Considerations

| Security Control             | Technical Implementation                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security Headers**         | Integrated `Helmet` middleware enforcing baseline HTTP security headers.                                                                    |
| **Rate Limiting**            | Express rate-limiting middleware configured to prevent basic endpoint abuse.                                                                |
| **HTTP Parameter Pollution** | `HPP` protection middleware enabled to mitigate parameter pollution exploits.                                                               |
| **Request Payload Limits**   | Explicit maximum request payload sizes configured to reject oversized input vectors.                                                        |
| **Credential Security**      | Password strings hashed using `bcrypt`; tokens protected via dual-JWT secret verification.                                                  |
| **Access Control**           | Endpoint route authorization secured via explicit role enforcement guards (`restrictTo`).                                                   |
| **CSRF / CORS / HTTPS**      | Specific implementations for CSRF, customized CORS parameters, and TLS/HTTPS termination are **not documented** in the repository analysis. |

---

## 22. Design Decisions

| Strategic Choice                        | Rationale                                                                                            | Architectural Benefit                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Feature / Module Directory Layout**   | Grouping domain files (e.g., `/booking`, `/fraud`) reduces context-switching across distant folders. | Improves code maintainability compared to monolithic MVC structures.               |
| **Transaction-First Reservation Logic** | Encapsulating validation, checks, and updates inside database transactions guarantees atomicity.     | Prevents partial or orphaned updates during concurrent client executions.          |
| **Prisma + Raw SQL Hybrid Usage**       | Uses Prisma for typed CRUD, paired with explicit raw SQL for locking features.                       | Combines ORM productivity with native SQL concurrency control (`FOR UPDATE`).      |
| **Asynchronous Expiration Tasks**       | Offloads timer monitoring to Redis and background processes instead of web request threads.          | Preserves web server thread performance and response speeds.                       |
| **Isolated Audit Service**              | Centralizes auditing operations into an explicit cross-cutting module.                               | Ensures consistent logging across authentication, booking, and anti-fraud modules. |

---

## 23. Engineering Trade-offs

| Engineering Decision                   | Trade-off / Benefit                                                  | Disadvantage / Cost                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Explicit SQL Row Locking**           | Guarantees complete data consistency and eliminates duplicate sales. | Reduces maximum concurrent throughput under high user contention due to lock waiting.                            |
| **Queue-Based Delayed Job Expiration** | Offloads expiration processing from web HTTP request loops.          | Increases operational infrastructure complexity (requires Redis and persistent worker execution).                |
| **Hardcoded Anti-Fraud Criteria**      | Simple implementation and straightforward debugging paths.           | Adjusting limits or timeouts requires direct application code changes rather than dynamic runtime configuration. |

---

## 24. Future Improvements

Future plans documented in the development roadmap include:

- Adding dynamic anti-fraud threshold configurations.
- Expanding end-to-end (E2E) and integration test suites.
- Configuring explicit CORS policies and CSRF protection mechanisms.

---

## 25. License

This repository's specific license rights and copyright details are **not documented** in the repository analysis.
