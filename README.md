# Jayka Creando Espacios - Fullstack System

## 🚀 Overview
Sistema integral de gestión de contenidos y captación de leads para el estudio de diseño de interiores y carpintería **Jayka**. El proyecto transforma una landing page estática en una plataforma dinámica gestionada por un backend profesional.

## 🛠 Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite.
- **Backend:** Laravel 11, PHP 8.3.
- **Database:** PostgreSQL (Local via Docker / Production via Supabase).
- **Auth:** Laravel Sanctum (Token-based).
- **Infrastructure:** Docker, Nginx.

## 📦 Installation & Setup

### 1. Backend Setup
```sh
# Navigate to backend folder
cd backend

# Copy environment variables
cp .env.example .env

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Run migrations and seeders (Requires Docker running)
php artisan migrate --seed
```

### 2. Infrastructure (Docker)
```sh
# Start the environment
docker-compose up -d

# Access the app at http://localhost:8000
```

### 3. Frontend Setup
```sh
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📑 API Documentation
The API is versioned under `/api/v1` and returns consistent JSON responses.

### Public Endpoints
- `GET /api/v1/services` $\rightarrow$ List of all services and their projects.
- `GET /api/v1/projects` $\rightarrow$ Gallery of projects.
- `GET /api/v1/posts` $\rightarrow$ Latest blog articles.
- `GET /api/v1/posts/{id}` $\rightarrow$ Detailed article view.
- `POST /api/v1/leads` $\rightarrow$ Submit contact form (Rate limited).

### Admin Endpoints (Requires Sanctum Token)
- `POST /api/v1/auth/login` $\rightarrow$ Admin authentication.
- `GET /api/v1/admin/leads` $\rightarrow$ Manage customer leads.

## 🏗 Architecture
- **Pattern:** Service-Repository pattern to decouple business logic from controllers.
- **Database:** Relational model focusing on `Services` $\rightarrow$ `Projects` and `Categories` $\rightarrow$ `Posts`.
- **Security:** Implementation of CORS, Rate Limiting, and Sanctum Middleware.

## 🚀 Deployment Guide
1. **Database:** Create a PostgreSQL instance in **Supabase**.
2. **Environment:** Update `.env` with Supabase credentials (`DB_HOST`, `DB_PASSWORD`, etc.).
3. **Frontend:** Deploy the `frontend/dist` folder to any static host (Vercel, Netlify).
4. **Backend:** Deploy the Laravel app to a VPS or PaaS (DigitalOcean, Forge, Heroku) using the provided Docker configuration.
