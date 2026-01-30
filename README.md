# Fast Track Shipment API

A robust Shipment Management System built with **NestJS**, **Drizzle ORM**, **PostgreSQL**, **Redis**, and **BullMQ**. This API allows you to manage shipments, track their status, and simulate integration with external carriers.

## 🚀 Setup Steps

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v24 or later recommended)
- Docker and Docker Compose

### Installation

1.  **Clone the repository** (if you haven't already).

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory. You can start by copying the example:
    (the values in .env.example are not a secret so there is no problem in keeping them there)

    ```bash
    cp .env.example .env
    ```

    Ensure the database and Redis credentials match what's in `docker-compose.yml`.

4.  **Start Infrastructure**:
    Spin up the PostgreSQL database and Redis instance using Docker Compose:

    ```bash
    docker compose up -d
    ```

5.  **Database Setup**:
    Generate the schema and run migrations:

    ```bash
    npm run db:generate
    npm run db:migrate
    ```

    (Optional) Seed the database with initial data:

    ```bash
    npm run db:seed
    ```

6.  **Mock External Services**:
    Start the mock carrier API (required for full functionality):
    ```bash
    npm run mock:carrier
    ```

### Running the API

Start the NestJS application in development mode:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

---

## How to Run the API

You can interact with the API using tools like **Postman**, **Insomnia**, or simple `curl` commands.

### Base URL

`http://localhost:3000`

---

## 📝 Example Requests & Responses

### 1. Create a New Shipment

**Endpoint:** `POST /shipments`

Creates a new shipment record. You can optionally request registration with the carrier.

**Request Body:**

```json
{
  "orderId": "ORD-2023-001",
  "customerName": "John Doe",
  "destination": "123 Main St, Anytown, USA",
  "registerWithCarrier": true
}
```

**Response (201 Created):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "orderId": "ORD-2023-001",
  "customerName": "John Doe",
  "destination": "123 Main St, Anytown, USA",
  "status": "pending",
  "createdAt": "2023-10-27T10:00:00.000Z"
}
```

---

### 2. List All Shipments

**Endpoint:** `GET /shipments`

Retrieves a paginated list of shipments. Supports filtering by status and customer name.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (e.g., `pending`, `in_transit`, `delivered`, `failed`)
- `customerName` (optional): Search by customer name

**Example Request:**
`GET /shipments?page=1&limit=5&status=pending`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "orderId": "ORD-2026-001",
      "customerName": "Maria Silva",
      "destination": "Rua das Flores, 123 - Rio de Janeiro, RJ, 20000-000",
      "status": "pending",
      "lastSyncedAt": "2026-01-30T22:03:29.900Z",
      "createdAt": "2026-01-30T22:03:29.900Z"
    },
    {
      "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      "orderId": "ORD-2026-002",
      "customerName": "João Santos",
      "destination": "Av. Paulista, 1000 - São Paulo, SP, 01310-100",
      "status": "delivered",
      "lastSyncedAt": "2026-01-30T22:03:29.900Z",
      "createdAt": "2026-01-30T22:03:29.900Z"
    }
  ],
  "meta": { "total": 2, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### 3. Get Shipment by ID

**Endpoint:** `GET /shipments/:id`

Retrieves detailed information for a specific shipment.

**Example Request:**
`GET /shipments/a1b2c3d4-e5f6-7890-1234-567890abcdef`

**Response (200 OK):**

```json
{
  "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "orderId": "ORD-2026-001",
  "customerName": "Maria Silva",
  "destination": "Rua das Flores, 123 - Rio de Janeiro, RJ, 20000-000",
  "status": "pending",
  "lastSyncedAt": "2026-01-30T22:03:29.900Z",
  "createdAt": "2026-01-30T22:03:29.900Z"
}
```
