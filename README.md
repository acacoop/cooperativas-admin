````markdown
# Sistema de Gestión de Cooperativas

## MVP - Minimum Viable Product

Este es un sistema de gestión para las 134 cooperativas de la **Asociación de Cooperativas Argentinas (ACA)**.

### Características del MVP:
- Frontend: React con NextJS (mobile-first)
- Backend: Node.js con Express
- Base de datos: SQLite (para el MVP, luego PostgreSQL)
- Autenticación básica

### Roles:
1. **Admin ACA**: Acceso total
2. **Operador ACA**: Solo lectura
3. **Admin Cooperativa**: Solo sus datos

### Funcionalidades MVP:
- Login por roles
- Dashboard básico
- CRUD de cooperativas
- Vista de datos por cooperativa
- Sistema de aprobación básico

## Instalación
```bash
npm run install-all
npm run dev
```
````
