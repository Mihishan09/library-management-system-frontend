# Backend Setup Instructions

## Issue: "Failed to fetch" Error

If you're getting a "Failed to fetch" error when trying to signup/login, it means the backend services are not running.

## Required Services

The frontend expects two services to be running:

1. **Backend API** (Spring Boot) - Port 8080
2. **API Gateway** (Spring Cloud Gateway) - Port 8085

## How to Start the Services

### Option 1: Start Backend Only (Direct Connection)

If you want to connect directly to the backend (bypassing the API Gateway):

1. Update `src/context/AuthContext.tsx`:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
   ```

2. Start the backend:
   ```bash
   cd C:\Users\User\Desktop\library-management-system
   mvn spring-boot:run
   ```

### Option 2: Start Both Services (Recommended)

1. **Start the Backend** (Terminal 1):
   ```bash
   cd C:\Users\User\Desktop\library-management-system
   mvn spring-boot:run
   ```
   Wait until you see: `Started LibraryManagementSystemApplication`

2. **Start the API Gateway** (Terminal 2):
   ```bash
   cd C:\Users\User\Desktop\library-management-system\api-gateway
   mvn spring-boot:run
   ```
   Wait until you see: `Started ApiGatewayApplication`

3. **Start the Frontend** (Terminal 3):
   ```bash
   cd C:\Users\User\Desktop\library-management-system-frontend
   npm run dev
   ```

## Verify Services Are Running

- Backend: http://localhost:8080/api/auth/login (should return 400 Bad Request, not connection error)
- API Gateway: http://localhost:8085/api/auth/login (should return 400 Bad Request, not connection error)
- Frontend: http://localhost:3000

## Troubleshooting

1. **Check if ports are in use:**
   - Windows: `netstat -ano | findstr :8080`
   - Windows: `netstat -ano | findstr :8085`

2. **Check backend logs** for any errors during startup

3. **Check API Gateway logs** for routing issues

4. **Verify CORS is enabled** - The backend controllers have `@CrossOrigin(origins = "*")` which should allow all origins

5. **Check database connection** - Make sure MySQL is running and the database `library_management` exists

