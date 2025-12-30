# Stitch Page Builder Platform

Plataforma de venta y gestión de páginas web personalizables para clientes.

## 🎯 Descripción del Proyecto

Esta aplicación permite:
- **Admin**: Crear plantillas web, duplicarlas para clientes, edición avanzada
- **Clientes**: Editar sus páginas asignadas (texto, colores, imágenes) mediante interfaz visual
- **Público**: Visualizar páginas publicadas en `/p/slug`

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Backend** | Node.js, Express, TypeScript, Prisma |
| **Base de Datos** | SQLite (dev), PostgreSQL (prod) |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS |
| **Estado** | React Query, Zustand |
| **Auth** | JWT con roles (ADMIN/USER) |

## 📁 Estructura del Proyecto

```
stitch_landing_page/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Modelos de BD
│   │   ├── seed.ts          # Datos de prueba
│   │   └── dev.db           # SQLite local
│   ├── src/
│   │   ├── controllers/     # Endpoints REST
│   │   ├── services/        # Lógica de negocio
│   │   ├── routes/          # Definición de rutas
│   │   ├── middlewares/     # Auth, validación
│   │   └── types/           # TypeScript types
│   └── .env                 # Variables de entorno
│
└── frontend/
    ├── src/
    │   ├── components/      # UI reutilizables
    │   │   ├── ui/          # Button, Input, Modal...
    │   │   ├── layout/      # Sidebar, AppLayout
    │   │   └── auth/        # ProtectedRoute
    │   ├── features/        # Módulos por funcionalidad
    │   │   ├── auth/        # Login
    │   │   ├── dashboard/   # Estadísticas
    │   │   ├── customers/   # CRUD clientes
    │   │   ├── orders/      # CRUD pedidos
    │   │   ├── templates/   # Plantillas (pendiente)
    │   │   ├── pages/       # Páginas cliente (pendiente)
    │   │   ├── settings/    # Configuración
    │   │   └── profile/     # Perfil usuario
    │   ├── lib/             # Axios config
    │   └── stores/          # Zustand stores
    └── vite.config.ts
```

## 🚀 Setup Rápido

### 1. Clonar e instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar variables de entorno

```bash
# backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secreto-super-seguro"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

### 3. Inicializar base de datos

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 4. Ejecutar servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev   # http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm run dev   # http://localhost:3000
```

### 5. Credenciales de prueba

```
Email: admin@empresa.com
Password: admin123
```

## 📋 Estado Actual del Desarrollo

### ✅ Completado
- [x] Autenticación JWT con roles
- [x] Dashboard con estadísticas
- [x] CRUD Clientes (crear, editar, eliminar, detalle)
- [x] CRUD Pedidos (crear, editar estado, eliminar)
- [x] Perfil de usuario editable
- [x] Sistema de toasts y modales
- [x] Paginación y búsqueda

### 🔄 En Progreso
- [ ] **Page Builder Platform** (ver plan abajo)

### ⏳ Pendiente
- [ ] Templates reales (no mock data)
- [ ] Pages asignadas a clientes
- [ ] Editor visual de elementos
- [ ] Renderizado público `/p/slug`
- [ ] Panel simplificado para clientes
- [ ] Upload de imágenes

## 🗺️ Próximos Pasos (Page Builder)

1. Agregar modelos `Template`, `Page`, `PageElement` a Prisma
2. Crear APIs backend para templates y pages
3. Refactorizar TemplatesPage con datos reales
4. Crear PagesPage + PageEditorPage
5. Implementar editor visual
6. Renderizado público de páginas

Ver archivo detallado: `.gemini/antigravity/brain/.../implementation_plan.md`

## 🔑 APIs Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |
| GET | `/api/users/me` | Perfil actual |
| GET/POST | `/api/customers` | Listar/Crear clientes |
| GET/PATCH/DELETE | `/api/customers/:id` | Cliente específico |
| GET/POST | `/api/orders` | Listar/Crear pedidos |
| GET/PATCH/DELETE | `/api/orders/:id` | Pedido específico |
| GET | `/api/stats/dashboard` | Estadísticas |

## 🎨 Componentes UI

Todos en `frontend/src/components/ui/`:
- `Button` - Variantes: primary, secondary, outline, danger
- `Input` - Con label, error, iconos
- `Select` - Dropdown estilizado
- `Modal` - Base para diálogos
- `ConfirmDialog` - Confirmación de acciones
- `Toast` - Notificaciones (success, error, warning)
- `Card` - Contenedor con sombra
- `Pagination` - Con info de items
- `Skeleton` - Loading states
- `EmptyState` - Para listas vacías

## 📝 Notas para Continuar

- El proxy de Vite redirige `/api` → `localhost:4000/api`
- Redis está deshabilitado (fallback sin caché)
- Los enums de Prisma usan strings por compatibilidad SQLite
- Tailwind v4 con variables CSS en `index.css`
