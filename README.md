# Eastside

A full-stack ecommerce app where users can browse products, manage a cart, apply coupons, and pay with Razorpay, with an admin dashboard for product management and sales analytics.

**Tech stack**
- Frontend: React + Vite, Tailwind CSS, React Router, Zustand, Axios, Framer Motion
- Backend: Node.js + Express, MongoDB (Mongoose), JWT auth, Razorpay
- Services: Cloudinary (images), Upstash Redis (optional cache + refresh tokens), Razorpay Checkout

## Requirements
- Node.js 18+ (or newer LTS)
- MongoDB (local or Atlas)
- Razorpay account (Payments)
- Cloudinary account (images)
- Upstash Redis (optional, for cache + refresh tokens)

## Setup
1. Install dependencies
   - `npm install`
   - `npm install --prefix frontend`

2. Create backend environment file  
   Create `backend/.env` with:
   ```
   PORT=5001
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   UPSTASH_REDIS_URL=your_upstash_redis_url
   ```

## Run locally (dev)
1. Start the backend
   - `npm run dev`

2. Start the frontend (in a new terminal)
   - `npm run dev --prefix frontend`

3. Open the app
   - `http://localhost:5173`

The backend runs on `http://localhost:5001`, and the frontend calls it at `http://localhost:5001/api` in development.

## Production build (single server)
This builds the frontend and serves it from the backend when `NODE_ENV=production`.

1. Build
   - `npm run build`

2. Start server
   - `npm start`

## Deployment
- Any Node hosting that supports environment variables and access to MongoDB
- Optional managed services: MongoDB Atlas, Cloudinary, Upstash Redis, Razorpay

## Architecture
```mermaid
flowchart TB
  A["Web Client (React SPA)"] -->|HTTPS| B["Backend (Express API)"]

  B --> C["Middleware: CORS + JSON + Cookie Parser"]
  C --> D["Auth Middleware (JWT cookie → req.user)"]

  D --> R1["/api/auth"]
  D --> R2["/api/products"]
  D --> R3["/api/cart"]
  D --> R4["/api/coupons"]
  D --> R5["/api/payments"]
  D --> R6["/api/analytics"]

  R1 --> AC["Auth Controller"]
  R2 --> PC["Product Controller"]
  R3 --> CC["Cart Controller"]
  R4 --> CO["Coupon Controller"]
  R5 --> PAY["Payment Controller"]
  R6 --> AN["Analytics Controller"]

  AC --> UDB["User Model (Mongoose)"]
  PC --> PDB["Product Model (Mongoose)"]
  CO --> CDB["Coupon Model (Mongoose)"]
  PAY --> ODB["Order Model (Mongoose)"]
  CC --> UDB
  AN --> UDB
  AN --> PDB
  AN --> ODB

  PDB --> MONGO["MongoDB (Atlas or Self-hosted)"]
  UDB --> MONGO
  CDB --> MONGO
  ODB --> MONGO

  PC --> CLOUD["Cloudinary (Product Images)"]
  PAY --> RZP["Razorpay Checkout (SaaS)"]
  AC --> REDIS["Upstash Redis (optional)"]
  PC --> REDIS

  subgraph DEPLOY["Deployment Options"]
    S1["Single Node Server\nBackend serves built frontend"]
  end

  B -.-> S1

  subgraph CICD["CI/CD (optional)"]
    G["GitHub Actions\nBuild + Deploy"]
  end

  G --> S1

  subgraph SECRETS["Secrets / Config (env vars)"]
    K["Examples: DB URI, JWT secrets, Razorpay + Cloudinary keys"]
  end

  K --> B
```

## What you need to run this project
- A MongoDB connection string in `MONGO_URI`
- Razorpay credentials:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- Cloudinary credentials:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- JWT secrets:
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
- Optional Redis URL:
  - `UPSTASH_REDIS_URL`

## Notes
- CORS allows `CLIENT_URL` in development; if unset it falls back to `*`.
- In production, the backend serves the built frontend from `frontend/dist`.
- The backend loads env vars from `backend/.env` when starting from the repo root.
