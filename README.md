# RentEase 🏠

### A Property Rental Management Platform

RentEase is a full-stack property rental management platform built to simplify the interaction between property owners and tenants. The project is being developed using **Spring Boot, React, and MySQL**, with a focus on authentication, secure user management, and property rental workflows.

---

## 🚀 Current Features

### 🔐 Authentication & Security

- User Registration & Login
- JWT-based Authentication
- Role-based access control (RBAC) for Tenants and Owners
- BCrypt password encryption
- Secure & Protected API endpoints

### 👤 User Profile

- View and Edit Profile details
- Update Name and Phone Number
- Change Password with robust password validation

### 🔑 Password Recovery

- Forgot Password workflow
- Email-based OTP verification with expiry handling
- Secure password reset using temporary reset tokens

### 🧪 API Testing

- Backend REST APIs thoroughly tested using Postman
- Robust request validation and custom error handling

---

## 🛠️ Tech Stack

### Backend

- **Language & Framework:** Java, Spring Boot, Spring Security
- **Authentication:** JSON Web Tokens (JWT)
- **ORM & Database:** Spring Data JPA, Hibernate, MySQL

### Frontend

- **Core:** React, JavaScript, HTML5, CSS3
- **Routing:** React Router

### Tools & Version Control

- **IDEs:** Eclipse, Visual Studio Code
- **Testing & Git:** Postman, Git & GitHub

---

## 📂 Project Structure

```text
RentEase
│
├── RentEase-Backend (Spring Boot App)
│   ├── src
│   └── pom.xml
│
├── RentEase-Frontend (React App)
│   ├── src
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔄 Application Workflows

### 🔒 Authentication Flow

```text
Register ➔ Login ➔ JWT Token Generation ➔ Access Protected APIs (Role-based)
```

### 🔑 Password Recovery Flow

```text
Forgot Password ➔ Send Email OTP ➔ Verify OTP ➔ Generate Reset Token ➔ Set New Password
```

---

## 👥 User Roles & Permissions

#### 🟢 Tenant

- Browse available properties
- Search and filter properties based on criteria
- View detailed property pages
- Send and manage rental requests
- Save properties to favorites

#### 🔵 Owner

- Add, edit, and delete property listings
- Manage personal listed properties
- View incoming rental requests
- Accept or reject tenant requests

#### 🔴 Admin

- _Planned:_ Global user management, property moderation, and platform analytics.

---

## 🔮 Future Plans

The project is currently under active development. Planned updates include:

- **Core Workflows:** Comprehensive Property Management, Rental Requests, and interactive Dashboards for both Tenants and Owners.
- **Enhanced UI/UX:** Advanced Search & Filters, Favorite Properties section, Reviews & Ratings, and Support for Multiple Property Images.
- **Advanced Integrations:** Notifications system, Location/Maps integration, and secure Payment Gateway Integration.

---

## 🎯 Project Goal

The goal of RentEase is to build a practical, scalable property rental platform while implementing real-world full-stack development concepts such as RESTful APIs, Secure Authentication, Database Management, and seamless Frontend-Backend Integration.

---

## 📌 Project Status

🚧 **In Development** — More features are being rolled out actively.

---

## 👨‍💻 Developer

**Harshal Patil**  
_Java Full Stack Developer | BCA Graduate_

⭐ _If you find this project interesting, feel free to explore and star the repository!_
