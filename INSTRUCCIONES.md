# Instrucciones de Instalación y Ejecución

## Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

## Instalación

### 1. Instalar dependencias principales
```bash
npm install
```

### 2. Instalar dependencias del servidor
```bash
cd server
npm install
cd ..
```

### 3. Instalar dependencias del cliente
```bash
cd client
npm install
cd ..
```

## Inicialización de la Base de Datos

### 1. Ir a la carpeta del servidor
```bash
cd server
```

### 2. Ejecutar el script de inicialización
```bash
node init-db.js
```

## Ejecución en Desarrollo

### Opción 1: Ejecutar todo junto (desde la raíz)
```bash
npm run dev
```

### Opción 2: Ejecutar por separado

#### Terminal 1 - Servidor (Puerto 5000)
```bash
cd server
npm run dev
```

#### Terminal 2 - Cliente (Puerto 3000)
```bash
cd client
npm run dev
```

## Acceso al Sistema

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## Usuarios de Prueba

1. **Admin ACA** (Acceso total)
   - Usuario: `admin_aca`
   - Contraseña: `admin123`

2. **Operador ACA** (Solo lectura)
   - Usuario: `operador_aca`
   - Contraseña: `operador123`

3. **Admin Cooperativa** (Solo su cooperativa)
   - Usuario: `admin_coop_1`
   - Contraseña: `coop123`

## Estructura del Proyecto

```
cooperativas-admin/
├── server/           # Backend (Node.js + Express + SQLite)
│   ├── index.js      # Servidor principal
│   ├── init-db.js    # Script de inicialización de BD
│   └── ...
├── client/           # Frontend (React + NextJS)
│   ├── pages/        # Páginas de la aplicación
│   ├── components/   # Componentes reutilizables
│   ├── utils/        # Utilidades y API
│   └── ...
└── Data/             # Datos iniciales (CSV, Excel)
```

## Funcionalidades del MVP

### Admin ACA
- ✅ Ver todas las cooperativas
- ✅ Editar cualquier cooperativa
- ✅ Aprobar/rechazar cambios pendientes
- ✅ Dashboard completo

### Operador ACA  
- ✅ Ver todas las cooperativas (solo lectura)
- ✅ Dashboard de consulta

### Admin Cooperativa
- ✅ Ver solo su cooperativa
- ✅ Solicitar cambios (requiere aprobación)
- ✅ Dashboard específico

## Próximas Mejoras

- [ ] Gestión de documentos
- [ ] Reportes avanzados
- [ ] Notificaciones
- [ ] Carga masiva con IA
- [ ] Histórico de cambios detallado
- [ ] API más robusta
- [ ] Tests automatizados

## Notas Técnicas

- La base de datos SQLite se crea automáticamente en `server/cooperativas.db`
- Los datos se cargan desde `Data/cooperatives_con_car_codigos.csv`
- El diseño es mobile-first y responsivo
- Autenticación con JWT
- Sistema de aprobación de cambios implementado
