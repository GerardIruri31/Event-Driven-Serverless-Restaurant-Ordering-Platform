# Event-Driven-Serverless-Restaurant-Ordering-Platform
Event-driven serverless platform for Bembos that automates the entire order lifecycle (payment→kitchen→packaging→delivery). Multi-tenant architecture powers multiple locations, with AWS services orchestrating real-time workflows, staff operations, and customer experiences

## 🎯 Project Goals

- Implement a **serverless, event-driven architecture** that automates the complete order workflow, from creation and payment to delivery.
- Support **multi-tenant** scenarios so different Bembos stores (tenants) can manage their own menus, orders, customers and staff while the platform orchestrates every order through events.
- Provide **separate web applications** for:
  - Customers (browse menu, place orders, track status).
  - Restaurant staff (kitchen, packer, delivery, admin dashboards).
- Use fully managed **AWS services** to reduce operational overhead and scale automatically.

---

## 🏗 Architecture Overview

The platform follows an **event-driven** and **microservices** architecture:

- Each change of order state (PAID, KITCHEN, PACKAGING, DELIVERY, DELIVERED) generates an **event**.
- **AWS Step Functions** orchestrates the main workflow of an order.
- **SQS FIFO queues** act as work queues per role (kitchen, packager, delivery), guaranteeing ordering and concurrency control.
- Each role interacts only with its own stage through dedicated APIs and queues.
- A **multi-tenant DynamoDB schema** keeps all entities isolated by `tenant_id` while still using a single-table style approach. :contentReference[oaicite:1]{index=1}  

High-level flow:

1. The customer places an order and pays via **Mercado Pago API**.
2. When the payment is approved, a **SNS event** is published.
3. A Lambda consumes this event, persists the order in DynamoDB and triggers the **Step Functions workflow**.
4. The workflow pushes the order into **SQS FIFO queues** for:
   - Kitchen
   - Packaging (dispatcher)
   - Delivery
5. Restaurant staff confirm each step via HTTP APIs (Lambda + API Gateway), which:
   - Update the order status in the **global `Pedidos` table**.
   - Mark the step as `completed` in the corresponding tracking table (`Cocina`, `Despachador`, `Delivery`).
   - Notify Step Functions so the workflow can move to the next state.
6. Customers and admins can track order progress and metrics in real time.

---

## ☁️ AWS Services Used

- **AWS Amplify** – Hosting and CI/CD for the web frontends (customers and restaurant).
- **Amazon API Gateway (REST + WebSocket)** – Public API layer and real-time channels.
- **AWS Lambda** – Stateless business logic for all microservices.
- **Amazon DynamoDB** – NoSQL storage with multi-tenant design (PK: `tenant_id`, SK: `uuid`/`id`).
- **Amazon S3** – Storage for product and combo images.
- **Amazon EventBridge** – Event bus for decoupled integrations.
- **Amazon SNS** – Notification events (e.g., payment approved, email triggers).
- **Amazon SQS FIFO** – Ordered queues per workflow step (kitchen, packaging, delivery).
- **AWS Step Functions** – Orchestration of the restaurant workflow.
- **WebSockets (via API Gateway)** – Real-time communication (complaints, status updates).
- **External API – Mercado Pago** – Payment gateway integration.
- **Gmail Services** – Transactional emails (welcome, payment receipt, order updates by role).

---

## 👥 User Roles

The system supports multiple roles with different views and permissions:

- **Customer / User**
- **Cook (Cocinero)**
- **Packer / Dispatcher (Empaquetador / Despachador)**
- **Delivery Driver (Repartidor)**
- **Administrator (Admin)**

Each role interacts with a different part of the workflow and sees only the relevant queue/state for their work.

---

## 🧩 Microservices

### 1. Workflow / Restaurant States

- Orchestrated by **AWS Step Functions**.
- Uses **three SQS FIFO queues** as work trays:
  - `cocina`
  - `empaquetamiento` (dispatcher)
  - `delivery`
- Transition Lambdas:
  - `PagadoACocina`
  - `CocinaAEmpaquetamiento`
  - `EmpaquetamientoADelivery`
  - `DeliveryAEntregado`
- Responsibilities:
  - Insert orders into stage-specific tables with status `pending`.
  - Wait for confirmation events from the frontend.
  - Update the global `Pedidos` table and stage tables to `completed`.
  - Move the workflow to the next step.

### 2. Orders & Payments Microservice

- Exposes endpoints to **create and pay orders**.
- Integrates with **Mercado Pago API** using test credentials (easily switchable to production).
- When a payment is approved:
  - Publishes an event to **SNS**.
  - Generates a **receipt (txt)** and sends it via **Gmail**.
  - Persists order data in the `Pedidos` table.
- Provides endpoints to:
  - List customer orders.
  - View current status and history.

### 3. Users Microservice

- Manages the **customer lifecycle**: registration, login, profile management.

**HTTP exposure (API Gateway):**

- `POST /usuarios` – Register and login.
- `/perfil` – Get, update, or delete profile.

**Main flows:**

- **Registration**:
  - Lambda validates input.
  - Sends **welcome email** via notification service (Gmail).
  - Persists user in the `Usuarios` table using `(tenant_id, id)`.

- **Login**:
  - Validates credentials against `Usuarios`.
  - Generates an auth token and stores it in `Token_user`.
  - Returns the token for authenticated requests.

- **Profile Management**:
  - `GET /perfil` – Read profile.
  - `PUT/PATCH /perfil` – Update profile data.
  - `DELETE /perfil` – Delete/deactivate user.

### 4. Products Microservice

- Endpoint: `/producto`.
- Lambdas:
  - **List Products** – Returns the product catalog per tenant from the `Productos` table and resolves image URLs from S3 (`/imagenes`).
  - **Get Product** – Returns details of a single product (name, description, sizes, price, points).

### 5. Combos Microservice

- Endpoint: `/combos`.
- Lambdas:
  - **List Combos** – Lists all combos from the `Combos` table.
  - **Get Combo** – Returns full combo details (products included, sizes, price, points, stock).
- Uses S3 for combo images (`/imagenes_combos`).

### 6. Locations Microservice

- Endpoint: `/locales`.
- Lambdas:
  - **List Locations** – Returns all locations from the `Locales` table (address, dispatch types, lat/long, phone).
  - **Get Location** – Returns a single location by `(tenant_id, local_id)`.

### 7. Employees & Roles

- Manages restaurant staff in the `Empleados` table.
- Uses `rol` attribute to control permissions (admin, cook, packer, delivery).
- Provides the backend for staff dashboards (kitchen view, packing view, delivery view, admin metrics).

---

## 🗄 DynamoDB Data Model (Multi-Tenant)

All tables follow the same pattern:

- **Partition Key (PK):** `tenant_id`
- **Sort Key (SK):** an identifier such as `uuid`, `id`, `combo_id`, `id_empleado`, etc.

Examples:

- **Products**
  - PK: `tenant_id = "Hamburguesa"`
  - SK: product internal id (`ordenamiento`).
- **Combos**
  - PK: `tenant_id = "Combos"`
  - SK: `combo_id`.
- **Users**
  - PK: `tenant_id = "gmail"` (email domain or logical tenant).
  - SK: user uuid.
- **Orders (`Pedidos`)**
  - PK: `tenant_id = "usuario"` (customer context).
  - SK: `uuid` (order id).
  - Attribute `estado_pedido` tracks workflow states:  
    `PENDIENTE_PAGO → PAGADO → COCINA → EMPAQUETAMIENTO → DELIVERY → ENTREGADO`.
- **Employees**
  - PK: `tenant_id = empleado@dominio.com`
  - SK: `id` (uuid).
- **Tracking Tables** (`Cocina`, `Despachador`, `Delivery`)
  - PK: `tenant_id`
  - SK: employee or order id.
  - Store timestamps and `status` for each role.

This design allows high write/read throughput and isolates data per tenant while keeping queries simple for each service. :contentReference[oaicite:2]{index=2}  

---

## 🔔 Notifications & Real-Time Features

- **Gmail Services**:
  - Welcome email on user registration.
  - Payment receipt (boleta) after successful payment.
  - Order status updates to customers and staff by role.

- **WebSockets**:
  - Real-time channel for customer complaints, internal messages, and live order status.

---

## 🚀 What I Learned / Highlights

- Designed and implemented a **production-style serverless architecture** using multiple AWS managed services.
- Modeled a **multi-tenant DynamoDB schema** with partition and sort keys optimized for access patterns.
- Built an **event-driven workflow** using Step Functions + SQS FIFO + Lambda to coordinate restaurant operations.
- Integrated a **real payment gateway (Mercado Pago)** and **Gmail-based transactional emails**.
- Implemented **role-based views** for restaurant staff that interact with independent queues and tables.
