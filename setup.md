# Quick Setup Guide

## Prerequisites Installation

### 1. Install Java 17
```bash
# Windows (using Chocolatey)
choco install openjdk17

# macOS (using Homebrew)
brew install openjdk@17

# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk
```

### 2. Install Node.js 18+
```bash
# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install MySQL 8.0+
```bash
# Windows (using Chocolatey)
choco install mysql

# macOS (using Homebrew)
brew install mysql

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
```

## Database Setup

1. **Start MySQL service**
2. **Create database**
   ```sql
   CREATE DATABASE banking_db;
   CREATE USER 'banking_user'@'localhost' IDENTIFIED BY 'banking_password';
   GRANT ALL PRIVILEGES ON banking_db.* TO 'banking_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

## Application Configuration

### Backend Configuration
Update `backend/src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/banking_db
spring.datasource.username=banking_user
spring.datasource.password=banking_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
jwt.secret=mySecretKey
jwt.expiration=86400000

# Server Configuration
server.port=8080
```

### Frontend Configuration
Update `frontend/src/environments/environments.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
ng serve
```

## Access the Application
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api

## Default Test Account
After running the application, you can register a new account or use these test credentials if available:
- Email: test@example.com
- Password: password123

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Backend: Change `server.port` in application.properties
   - Frontend: Use `ng serve --port 4201`

2. **Database connection failed**
   - Verify MySQL is running
   - Check database credentials
   - Ensure database exists

3. **CORS issues**
   - Backend CORS is configured for localhost:4200
   - If using different port, update SecurityConfig.java

4. **Node modules issues**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

## Development Tips

- Use `./mvnw spring-boot:run` for backend hot reload
- Use `ng serve` for frontend hot reload
- Check browser console for frontend errors
- Check backend logs for API errors
- Use Postman or similar tool to test API endpoints