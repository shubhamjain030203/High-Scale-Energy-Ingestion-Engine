
# High-Scale Energy Ingestion Engine

## Overview

This service implements the **core ingestion and analytics layer** for a high-scale EV fleet platform.
It is designed to ingest **minute-level telemetry** from smart meters and electric vehicles, persist both **real-time state** and **historical data**, and provide **efficient analytical insights** without performing full table scans.

The system is built using **NestJS (TypeScript)** and **PostgreSQL**, with a strong focus on **scalability, write efficiency, and analytical performance**.

---

## Running the Application

### Prerequisites
* Node.js 18+
* Docker & Docker Compose

### Steps

1. Start PostgreSQL
```bash
docker compose up -d
```

2. Install dependencies
```bash
npm install
```

3. Start the NestJS server
```bash
npm run start
```

The service will be available at:
```
http://localhost:3000
```

---

## Database Setup

PostgreSQL runs inside Docker and is exposed via a dedicated port.
The NestJS application connects using environment variables defined in `.env`.

---

## Problem Context

Each device in the fleet sends telemetry **every 60 seconds**:

* **Smart Meters (Grid side)**
  Measure AC energy consumed from the grid.

* **Vehicles / Chargers (Vehicle side)**
  Measure DC energy delivered to the battery and battery state.

This results in:

* **10,000+ devices**
* **2 telemetry streams per device**
* **≈ 14.4 million records per day**

The core challenge is to:

* Ingest this data reliably
* Preserve a complete audit trail
* Provide fast access to current state
* Run analytics efficiently over time-series data

---

## Architectural Overvie

## Key Architectural Decisions

### 1. Polymorphic Ingestion API

A **single ingestion endpoint** is used:

```
POST /v1/ingest
```

```
Payload

{
  "vehicleId": "EV_002",
  "soc": 72.5,
  "kwhDeliveredDc": 4.25,
  "batteryTemp": 38.6,
  "timestamp": "2026-02-10T10:15:00Z"
}

OR

{
  "meterId": "METER_001",
  "kwhConsumedAc": 5.10,
  "voltage": 231.5,
  "timestamp": "2026-02-10T10:15:00Z"
}
```

The system determines the telemetry type based on payload shape:

* `vehicleId` → Vehicle telemetry
* `meterId` → Meter telemetry

---

### 2. Hot vs Cold Data Separation

A strict separation is maintained between **operational data** and **historical data**.

#### Cold Data (Historical Store)

Append-only tables:

* `vehicle_telemetry_history`
* `meter_telemetry_history`

Characteristics:

* Stores every minute-level reading
* Never updated or deleted
* Optimized for analytical queries
* Provides a full audit trail

#### Hot Data (Operational Store)

Live state tables:

* `vehicle_live_status`
* `meter_live_status`

Characteristics:

* One row per device
* Always contains the latest known state
* Updated using UPSERT
* Enables constant-time dashboard lookups
* Avoids scanning millions of rows for “current status”
* Keeps analytical queries isolated from operational reads
* Allows independent optimization of read/write paths

---

### 3. Insert vs Upsert Strategy

Different persistence strategies are used intentionally:

| Data Type            | Operation | Reason                             |
| -------------------- | --------- | ---------------------------------- |
| Historical telemetry | INSERT    | Immutable, append-only audit trail |
| Live device state    | UPSERT    | Always reflect latest known values |

This ensures:

* High write throughput
* Simple data model
* Predictable query performance

---

### 4. Database Design & Indexing

Time-series tables are indexed on:

```
VehicleId
meterId
timestamp
```

This allows:

* Efficient filtering by vehicleId, meterId, timestamp
* Fast range queries for recent data (e.g. last 24 hours)
* Avoidance of full table scans

Indexes are critical for ensuring analytics remain performant as data volume grows.

---

### 5. Analytics Without Full Table Scans

The analytics endpoint:

```
GET /v1/analytics/performance/:vehicleId
```

Computes a 24-hour summary:

* Total AC energy consumed
* Total DC energy delivered
* Efficiency ratio (DC / AC)
* Average battery temperature

The query:

* Filters by `vehicleId`
* Filters by time range (`NOW() - INTERVAL '24 HOURS'`)
* Uses indexed columns
* Aggregates only relevant rows

This ensures predictable performance even with billions of historical records.

---

## Handling 14.4 Million Records per Day

The system scales to high ingestion volumes through:

### 1. Write-Optimized Ingestion

* Append-only inserts for historical data
* No updates or deletes on large tables
* Minimal locking and contention

### 2. Separation of Concerns

* Live dashboards never touch historical tables
* Analytics queries never affect operational reads

### 3. Index-Driven Queries

* All analytical access is index-backed
* No unbounded scans across time-series data

### 4. Horizontal Growth Readiness

While not implemented in this assignment, the design naturally supports:

* Table partitioning by date
* Read replicas for analytics
* Stream-based ingestion (Kafka, etc.)

---

## Technology Stack

* **Backend Framework:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **Containerization:** Docker (PostgreSQL)

---


## Conclusion

This system demonstrates a scalable backend design capable of handling **high-frequency telemetry ingestion**, **large time-series datasets**, and **efficient analytics**, while maintaining clear separation between real-time operational concerns and long-term historical analysis.