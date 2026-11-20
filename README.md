# 🌱 KhamarBari
### Industrial-Scale Farm Management System

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

**A comprehensive, full-stack farm management platform designed to digitize, organize, and optimize large-scale agricultural operations.**

[**Live Application**](https://khamar-bari-v2-rho.vercel.app/) · [**GitHub Repository**](https://github.com/AhsanCS64/KhamarBari_v2)

---

## Overview

**KhamarBari** is a web-based farm management solution developed to address the operational challenges of managing diversified and industrial-scale agricultural enterprises.

Traditional farm management often involves fragmented records, manual calculations, disconnected operational processes, and limited visibility into production and financial activities.

KhamarBari brings these activities together through a centralized platform, enabling farm operators to manage **livestock, poultry, fisheries, workforce activities, production records, financial transactions, and multiple farm branches**.

Built with the **MERN stack (MongoDB, Express.js, React, and Node.js)**, the system demonstrates modern full-stack development through a scalable, API-driven architecture.

## Key Features

### 🐄 1. Livestock Management

- Manage livestock records and animal populations.
- Monitor farm-level livestock inventories.
- Maintain production records, including milk output.
- Organize livestock information across farming operations.

### 🐓 2. Poultry Management

- Maintain poultry population records.
- Track daily egg production.
- Manage poultry inventory and operational data.
- Monitor production activities over time.

### 🐟 3. Fisheries Management

- Manage fish farming operations and pond information.
- Maintain fisheries-related production records.
- Organize pond-level operational information.
- Monitor fisheries activities within the centralized system.

### 📊 4. Production Monitoring

- Record daily agricultural production.
- Track milk, egg, and other relevant production outputs.
- Maintain historical production information.
- Support production forecasting and operational planning.

### 👷 5. Workforce Management

- Maintain worker information.
- Organize workforce records.
- Support farm-level employee administration.
- Centralize workforce-related operational data.

### 💰 6. Financial & Order Management

- Manage operational bills and expense records.
- Organize farm-related orders.
- Maintain financial transaction information.
- Support visibility into farm expenditure and commercial activities.

### 🏢 7. Multi-Branch Management

- Organize farm operations across multiple branches.
- Maintain branch-specific operational records.
- Support centralized administration of distributed farming activities.

### 📈 8. Production Forecasting

- Support forecasting of agricultural production.
- Use historical production information to assist planning.
- Provide a foundation for future predictive analytics and data-driven agricultural management.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Programming Language | JavaScript |
| API Architecture | REST |
| Deployment | Vercel |
| Version Control | Git & GitHub |

## System Architecture

KhamarBari follows a client-server architecture with separate frontend and backend applications.

```text
                   ┌─────────────────────────┐
                   │       Farm Users        │
                   │       Web Browser       │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │      React Frontend     │
                   │                         │
                   │   Vite + Tailwind CSS   │
                   │      Framer Motion      │
                   └────────────┬────────────┘
                                │
                          HTTPS / REST
                                │
                                ▼
                   ┌─────────────────────────┐
                   │      Express.js API     │
                   │                         │
                   │   Authentication        │
                   │   Business Logic        │
                   │   Request Processing    │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │      MongoDB Atlas      │
                   │                         │
                   │   Farm Records          │
                   │   Production Data       │
                   │   Workers & Branches    │
                   │   Orders & Expenses     │
                   └─────────────────────────┘
```

### Architecture Highlights

- **Frontend–Backend Separation:** Independent React frontend and Express backend.
- **RESTful Communication:** API-based interaction between client and server.
- **Cloud Database:** MongoDB Atlas provides persistent data storage.
- **Modular Functional Design:** Different agricultural operations are organized into functional modules.
- **Cloud Deployment:** Both application layers are deployed using Vercel.

## Getting Started

### Prerequisites

Ensure the following are installed:

- Node.js
- npm
- Git
- MongoDB Atlas account or a compatible MongoDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/AhsanCS64/KhamarBari_v2.git
cd KhamarBari_v2
```

### 2. Install Dependencies

Navigate to the frontend and backend directories and install their respective dependencies.

```bash
npm install
```

Execute this command separately in each application directory containing a `package.json` file.

### 3. Configure Environment Variables

Configure the backend with the appropriate MongoDB connection string, authentication secrets, and other environment variables required by the application.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
PORT=5000
```

Configure the frontend with the backend API endpoint.

```env
VITE_API_URL=http://localhost:5000
```

> Environment variable names are illustrative. Refer to the source code for the exact configuration keys.

### 4. Start the Development Servers

For the backend:

```bash
npm run dev
```

For the frontend:

```bash
npm run dev
```

If the backend does not define a development script, use the appropriate start command specified in its `package.json`.

### 5. Access the Application

Open the local URL displayed by Vite, typically:

```text
http://localhost:5173
```

## Deployment

KhamarBari uses a cloud-hosted architecture with its frontend and backend deployed separately.

| Service | Platform | Deployment |
|---|---|---|
| Frontend | Vercel | [Live Application](https://khamar-bari-v2-rho.vercel.app/) |
| Backend | Vercel | [API Server](https://khamar-bari-backend.vercel.app/) |
| Database | MongoDB Atlas | Managed Cloud Database |

### Backend API

The backend follows an `/api` route prefix.

For example, the authentication login endpoint is:

```http
POST /api/auth/login
```

The deployed equivalent is:

```text
https://khamar-bari-backend.vercel.app/api/auth/login
```

Additional endpoints are organized according to their associated application modules.

## Software Engineering Concepts

KhamarBari demonstrates practical experience with:

- Full-stack web application development using the MERN stack.
- REST API design and frontend–backend integration.
- NoSQL database management using MongoDB.
- Authentication workflows and server-side business logic.
- Component-based interface development with React.
- Responsive UI implementation using Tailwind CSS.
- Client-side animations and interactive UI design.
- Cloud database integration and deployment.
- Managing application state and asynchronous API requests.
- Designing software for diversified agricultural operations.

## Future Enhancements

Potential directions for further development include:

- AI-powered production forecasting using historical farm data.
- Automated inventory alerts and resource monitoring.
- IoT integration for temperature, humidity, and water-quality sensors.
- Advanced financial reporting and profitability analysis.
- Predictive livestock health monitoring.
- Mobile application support.
- Interactive analytics dashboards.
- Automated reporting and data export.

## Project Motivation

Agriculture remains a critical component of Bangladesh's economy, yet many farms continue to rely on manually maintained records and disconnected management practices.

**KhamarBari aims to bridge the gap between traditional agricultural operations and modern software engineering.**

By integrating diverse farm activities into a single platform, the project explores how digital systems can improve operational organization, information accessibility, and data-driven decision-making.

## Author

**H. M. Ahsan Habib Kushal**  
Computer Science and Engineering  
National Institute of Textile Engineering and Research (NITER), University of Dhaka

**GitHub:** https://github.com/AhsanCS64  
**Portfolio:** https://ahsanhabibkushal.vercel.app/

---

**KhamarBari — Bringing Agriculture and Technology Together.**

*Designed and developed as a practical full-stack software engineering project focused on modernizing agricultural management.*
