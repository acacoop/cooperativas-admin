# Design Document: Portal Coop (Cooperativas Admin)

## Project Overview

A management system for Argentinian Cooperatives (Asociación de Cooperativas Argentinas - ACA) that handles cooperative administration, invoice management, and user roles.

## Technical Stack

Frontend (Client)

- Framework: Next.js v14.0.0
- Core Libraries:
  - React v18.2.0
  - React DOM v18.2.0
- Styling:
  - TailwindCSS v3.3.0
  - PostCSS v8.4.31
  - Autoprefixer v10.4.16
- HTTP Client:
  - Axios v1.5.0
- Development Tools:
  - ESLint v8.52.0
  - ESLint Config Next v14.0.0

Backend (Server)

- Runtime: Node.js
- Framework: Express.js v4.18.2
- Database: SQLite3 v5.1.6
- Authentication & Security:
  - bcryptjs v2.4.3
  - jsonwebtoken v9.0.2
- Middleware:
  - CORS v2.8.5
  - Multer v2.0.2 (File uploads)
- Configuration:
  - dotenv v16.3.1
- Development Tools:
  - nodemon v3.0.1

## Project Structure

cooperativas-admin/
├── client/                   # Frontend Next.js application
│   ├── pages/               # Next.js pages
│   │   ├── cooperativa/     # Cooperative-specific pages
│   │   ├── cooperativas/    # Cooperatives listing/management
│   │   └── proveedor/       # Supplier-related pages
│   ├── styles/              # Global styles
│   └── utils/               # Utility functions
├── server/                   # Backend Express application
│   ├── uploads/             # File upload directory
│   │   └── invoices/        # Invoice storage
│   └── cooperativas.db      # SQLite database
└── Data/                    # Data files and spreadsheets

Key Features

1. Authentication System
    - User role-based access control
    - JWT-based authentication
    - Secure password handling with bcrypt

2. Cooperative Management
    - Cooperative profiles
    - Member management
    - Dynamic routing for individual cooperatives

3. Invoice System
    - Invoice upload and storage
    - Invoice validation
    - Assignment to cooperatives
    - Supplier invoice management

4. User Roles
    - Cooperative managers
    - Presidents
    - Suppliers
    - Administrative staff

## Data Management

- SQLite database for data persistence
- File storage system for invoices and documents
- Data import capabilities from Excel/CSV files

## Development Environment

- Concurrent development server support
- Hot-reloading for both frontend and backend
- Environment variable management
- ESLint for code quality
- Custom port configuration (Frontend: 3000)

## Security Features

- CORS protection
- JWT authentication
- Secure file upload handling
- Password hashing
- Environment variable protection

## Application Flow Documentation

### User Authentication Flow

```mermaid
graph TD
    A[User Access] --> B{Has Account?}
    B -->|No| C[Register]
    B -->|Yes| D[Login Form]
    C --> E[Store User Data in SQLite]
    E --> D
    D --> F{Validate Credentials}
    F -->|Invalid| G[Show Error Message]
    G --> D
    F -->|Valid| H[Generate JWT Token]
    H --> I[Store Token in Client]
    I --> J{Check User Role}
    J -->|Admin| K[Admin Dashboard]
    J -->|Cooperative| L[Cooperative Dashboard]
    J -->|Supplier| M[Supplier Dashboard]
    
    %% Additional context details
    subgraph Auth Details
    N1[Test Users Available]
    N2[Admin: admin_aca/admin123]
    N3[Operator: operador_aca/operador123]
    N4[Cooperative: admin_coop_1/coop123]
    N5[Supplier: proveedor_test/proveedor123]
    end
```

### Invoice Upload Flow

```mermaid
graph TD
    A[Supplier Login] --> B[Access Nueva-Factura]
    B --> C[Fill Invoice Form]
    C --> D[Basic Information]
    C --> E[Item Details]
    C --> F[Upload PDF]
    
    D --> G{Validate Form}
    E --> G
    F --> G
    
    G -->|Invalid| H[Show Error]
    H --> C
    
    G -->|Valid| I[Create FormData]
    I --> J[Upload to Server]
    J --> K{Server Validation}
    
    K -->|Error| L[Display Error Message]
    L --> C
    
    K -->|Success| M[Save to Database]
    M --> N[Redirect to Invoices List]
    
    %% Additional context from code
    subgraph Form Validation Rules
    V1[PDF Only]
    V2[Max 10MB]
    V3[Required Fields]
    V4[Auto-calculate Totals]
    end
```

### Invoice Processing Flow

```mermaid
graph TD
    A[Invoice Uploaded] --> B{Initial Validation}
    B -->|Invalid| C[Return to Supplier]
    B -->|Valid| D[Assign to Cooperative]
    D --> E[Store in SQLite]
    E --> F[Save PDF File]
    F --> G[Update Invoice Status]
    
    G --> H{Cooperative Review}
    H -->|Approved| I[Update Status: Approved]
    H -->|Rejected| J[Update Status: Rejected]
    
    I --> K[Notify Supplier: Approved]
    J --> L[Notify Supplier: Rejected]
    
    %% Status Tracking
    subgraph Invoice States
    S1[Pending]
    S2[Under Review]
    S3[Approved]
    S4[Rejected]
    end
```

### Data Flow

```mermaid
graph LR
    A[Client Side] --> B{API Layer}
    B --> C[Authentication Middleware]
    C --> D{Route Handler}
    
    D --> E[Database Operations]
    D --> F[File Operations]
    
    E --> G[SQLite Database]
    F --> H[File System]
    
    G --> I[Response Formation]
    H --> I
    I --> J[Client Response]
    
    %% Error Handling
    subgraph Error Management
    E1[Validation Errors]
    E2[Auth Errors]
    E3[Server Errors]
    E4[File System Errors]
    end
```

### User Role Permissions

```mermaid
graph TD
    A[User Roles] --> B[Admin]
    A --> C[Cooperative Manager]
    A --> D[Supplier]
    
    B --> B1[Manage Users]
    B --> B2[View All Invoices]
    B --> B3[System Settings]
    
    C --> C1[View Assigned Invoices]
    C --> C2[Approve/Reject Invoices]
    C --> C3[Manage Profile]
    
    D --> D1[Upload Invoices]
    D --> D2[View Own Invoices]
    D --> D3[Update Invoice Details]
    
    %% Access Control
    subgraph Permissions
    P1[Full Access]
    P2[Limited Access]
    P3[Self Access]
    end
```
