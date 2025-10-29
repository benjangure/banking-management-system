# Banking Management System

A full-stack banking management application built with Spring Boot and Angular.

## 🏗️ Architecture

- **Backend**: Spring Boot 4.0 with Java 17
- **Frontend**: Angular 20 with Material Design
- **Database**: MySQL
- **Authentication**: JWT-based security

## 📁 Project Structure

```
├── backend/                    # Spring Boot Backend API
│   ├── src/main/java/          # Java source code
│   ├── src/main/resources/     # Configuration files
│   └── pom.xml                 # Maven dependencies
│
├── frontend/                   # Angular Frontend
│   ├── src/app/components/     # UI components
│   ├── src/app/services/       # API services
│   ├── src/app/guards/         # Route guards
│   └── package.json            # NPM dependencies
│
└── README.md                   # Project documentation
```

## ✨ Features

### Backend API
- User authentication and authorization
- Account management
- Transaction processing (deposit, withdraw, transfer)
- Beneficiary management
- Transaction history and reporting
- RESTful API endpoints

### Frontend Application
- User registration and login
- Dashboard with account overview
- Money transfer between accounts
- Beneficiary management
- Transaction history with filtering
- Monthly summaries and reports
- PDF and Excel export functionality
- Responsive Material Design UI

## 🛠️ Technologies Used

### Backend
- **Spring Boot 4.0** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **MySQL** - Database
- **JWT** - Token-based authentication
- **Lombok** - Code generation
- **Maven** - Dependency management

### Frontend
- **Angular 20** - Frontend framework
- **Angular Material** - UI components
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **JWT Decode** - Token handling
- **jsPDF** - PDF generation
- **XLSX** - Excel export
- **Bootstrap Icons** - Icons

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18+ and npm
- MySQL 8.0+
- Maven 3.6+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>/backend
   ```

2. **Configure MySQL Database**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE banking_db;
   ```

3. **Update application.properties**
   ```properties
   # Configure in src/main/resources/application.properties
   spring.datasource.url=jdbc:mysql://localhost:3306/banking_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. **Run the backend**
   ```bash
   ./mvnw spring-boot:run
   ```
   Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   ```typescript
   // Update src/environments/environments.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api'
   };
   ```

4. **Start the development server**
   ```bash
   ng serve
   ```
   Frontend will be available at `http://localhost:4200`

## 📱 Application Screenshots

### Dashboard
- Account balance overview
- Recent transactions
- Quick action buttons

### Transaction Management
- Transfer money between accounts
- Add/manage beneficiaries
- Transaction history with search and filters

### Reports
- Monthly transaction summaries
- Export to PDF/Excel
- Mini statements

## 🔐 Security Features

- JWT-based authentication
- Password encryption
- Route guards for protected pages
- CORS configuration
- Input validation and sanitization

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
ng test
```

## 📦 Building for Production

### Backend
```bash
cd backend
./mvnw clean package
```

### Frontend
```bash
cd frontend
ng build --configuration production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Angular team for the powerful frontend framework
- Material Design for the beautiful UI components