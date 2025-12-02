# Test8

Test

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for frontend)
- Python (for backend)

### Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Run `docker-compose up` to start all services

## Project Structure

- `frontend/` - Frontend application
- `backend/` - Backend API
- `infrastructure/` - AWS CDK infrastructure code

## Deployment

This project uses GitHub Actions for CI/CD and AWS CDK for infrastructure.

See `.github/workflows/` for CI/CD pipelines.
See `infrastructure/` for infrastructure as code.
