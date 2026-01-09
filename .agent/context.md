# Agent Context - Stitch Page Builder

> **Última actualización:** 2026-01-09  
> Este archivo proporciona contexto completo para que un agente de IA pueda continuar el desarrollo.

---

## 📌 Objetivo del Proyecto

**Plataforma de venta de páginas web personalizables (Page Builder SaaS):**
- Vender plantillas de landing pages profesionales
- Duplicar plantillas para clientes específicos  
- Permitir personalización visual (texto, colores, imágenes)
- Panel Admin (edición avanzada con GrapesJS) + Panel Cliente (edición básica)
- Renderizado público de páginas en `/p/:slug`

---

## 🎯 Estado Actual

### ✅ Completado

| Módulo | Funcionalidades |
|--------|-----------------|
| **Autenticación** | Login/logout JWT, roles ADMIN/USER, tokens HTTP-only |
| **Dashboard** | Estadísticas en tiempo real, gráficos de métricas |
| **Clientes** | CRUD completo (crear, editar, eliminar, vista detalle) |
| **Pedidos** | CRUD completo (crear, editar estado, eliminar) |
| **Perfil** | Página de perfil editable |
| **Templates** | CRUD backend + Editor GrapesJS integrado |
| **Pages** | CRUD backend + modelo de datos completo |
| **Render Público** | Ruta `/p/:slug` para páginas publicadas |
| **UI Components** | Sistema de componentes reutilizables |

### 🔄 En Desarrollo / Refinamiento

- **Editor GrapesJS** - Refinamientos de UI/UX:
  - Toolbar personalizada con dispositivos (Desktop/Tablet/Mobile)
  - Panel lateral con Bloques, Estilos y Capas
  - Importación de archivos HTML locales
  - CSS customizado para ocultar paneles nativos
  - Funcionalidad de guardar conectada al backend

### � Pendiente

- [ ] Editor básico para clientes (solo campos editables)
- [ ] Subida de imágenes (storage local o S3)
- [ ] Miniaturas automáticas de templates
- [ ] Gestión de dominios personalizados
- [ ] Planes de suscripción (Stripe)

---

## 🏗️ Arquitectura del Proyecto

```
stitch_landing_page/
├── backend/                 # Express + TypeScript + Prisma
│   ├── prisma/
│   │   └── schema.prisma   # Modelos de BD
│   ├── src/
│   │   ├── app.ts          # Configuración Express
│   │   ├── server.ts       # Entry point
│   │   ├── config/         # Configuración (JWT, CORS, etc.)
│   │   ├── controllers/    # Lógica de endpoints
│   │   ├── routes/         # Definición de rutas API
│   │   ├── services/       # Lógica de negocio
│   │   ├── middlewares/    # Auth, error handling
│   │   └── types/          # TypeScript types
│   └── package.json
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx         # Rutas principales
│   │   ├── components/     # Componentes UI reutilizables
│   │   ├── features/       # Módulos por funcionalidad
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── pages/      # Gestión de páginas de clientes
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── templates/  # Templates + Editor GrapesJS
│   │   └── lib/            # Axios config, utils
│   └── package.json
├── code.html               # Plantilla de ejemplo (SaaS Landing)
└── README.md
```

---

## 🗃️ Modelo de Datos (Prisma)

```prisma
model User {
  id, email, password, firstName, lastName, role (ADMIN/USER)
  subscription → Subscription
}

model Customer {
  id, name, email, status (ACTIVE/PENDING/INACTIVE)
  orders → Order[]
  pages → Page[]
}

model Order {
  id, orderNumber, customerId, status, total, orderDate
}

model Template {
  id, name, description, thumbnail
  htmlContent, cssContent    # ← Contenido del template
  isActive
  pages → Page[]
}

model Page {
  id, templateId, customerId
  name, slug (único)         # ← URL pública: /p/:slug
  customCss, theme (JSON)
  isPublished
  elements → PageElement[]
}

model PageElement {
  id, pageId, elementKey
  type (TEXT/IMAGE/COLOR/LINK)
  content, label
}
```

---

## 🔌 API Endpoints

| Recurso | Endpoints |
|---------|-----------|
| `/api/auth` | login, register, logout, me |
| `/api/users` | CRUD usuarios |
| `/api/customers` | CRUD clientes |
| `/api/orders` | CRUD pedidos |
| `/api/stats` | Estadísticas dashboard |
| `/api/templates` | CRUD templates |
| `/api/pages` | CRUD páginas |
| `/p/:slug` | Render público (sin auth) |

---

## �️ Stack Tecnológico

### Backend
- **Framework:** Express.js
- **ORM:** Prisma con SQLite (desarrollo)
- **Auth:** JWT (access token + refresh)
- **Validación:** Zod/express-validator

### Frontend
- **Framework:** React 18 + Vite
- **Estilos:** Tailwind CSS v4 (CSS variables)
- **Estado servidor:** TanStack Query (React Query)
- **Estado global:** Zustand (auth store)
- **Editor visual:** GrapesJS + plugins

### Editor GrapesJS
- **Plugins instalados:**
  - `grapesjs-blocks-basic` (bloques básicos)
  - `grapesjs-preset-webpage` (navbar, forms)
- **Canvas CDNs:**
  - Tailwind CSS 2.2.19
  - Google Fonts (Inter, Material Symbols)

---

## 🚀 Comandos de Desarrollo

```bash
# Backend (http://localhost:4000)
cd backend && npm run dev

# Frontend (http://localhost:3000)  
cd frontend && npm run dev

# Resetear BD (desarrollo)
cd backend && npx prisma migrate reset

# Insertar template de prueba
cd backend && node insert_template.mjs

# Credenciales de prueba
# Email: admin@empresa.com
# Password: admin123
```

---

## � Rutas del Frontend

| Ruta | Componente | Función |
|------|------------|---------|
| `/login` | `LoginPage` | Autenticación |
| `/dashboard` | `DashboardPage` | Home con estadísticas |
| `/customers` | `CustomersPage` | Lista de clientes |
| `/customers/:id` | `CustomerDetailPage` | Detalle cliente |
| `/orders` | `OrdersPage` | Lista de pedidos |
| `/templates` | `TemplatesPage` | Lista de templates |
| `/templates/:id/edit` | `TemplateEditorPage` | **Editor GrapesJS** |
| `/pages` | `PagesPage` | Lista de páginas |
| `/pages/:id/edit` | `PageEditorPage` | Editor de página |
| `/profile` | `ProfilePage` | Perfil usuario |
| `/settings` | `SettingsPage` | Configuración |

---

## 🎨 Componentes UI Disponibles

En `frontend/src/components/ui/`:
- **Inputs:** Button, Input, Select, Toggle, Checkbox
- **Feedback:** Modal, ConfirmDialog, Toast, LoadingSpinner
- **Layout:** Card, Pagination, EmptyState, Skeleton
- **Navigation:** AppLayout, Sidebar, Header

---

## 📄 Archivos Clave para Modificar

| Objetivo | Archivo |
|----------|---------|
| Agregar modelo BD | `backend/prisma/schema.prisma` |
| Nueva ruta API | `backend/src/routes/` + `index.ts` |
| Nuevo controlador | `backend/src/controllers/` |
| Nueva página frontend | `frontend/src/features/` + `App.tsx` |
| Estilos globales | `frontend/src/index.css` |
| Config Vite | `frontend/vite.config.ts` |
| Editor GrapesJS | `frontend/src/features/templates/components/GrapesEditor.tsx` |
| CSS del editor | `frontend/src/features/templates/components/grapes-editor.css` |

---

## ⚠️ Notas Importantes

1. **Tailwind v4:** Usa variables CSS definidas en `index.css`, no `tailwind.config.js`
2. **Path aliases:** `@/` apunta a `src/` (configurado en Vite)
3. **Proxy Axios:** `/api` → `http://localhost:4000/api`
4. **Body limit:** Backend configurado para 5MB (templates grandes)
5. **SQLite:** Base de datos local en `backend/prisma/dev.db`
6. **Redis:** Deshabilitado, usando fallback sin caché

---

## 🔧 Última Sesión de Trabajo

**Fecha:** Enero 2026  
**Foco:** Refinamiento del editor GrapesJS

### Trabajos realizados:
- Integración completa de GrapesJS con plugins básicos y webpage
- Toolbar personalizada (dispositivos, undo/redo, importar HTML, preview)
- Panel lateral con tabs (Bloques, Estilos, Capas)
- CSS para ocultar paneles nativos de GrapesJS
- Funcionalidad de importación de archivos HTML locales
- Conexión de guardado con API de templates
- Archivo `code.html` como plantilla de ejemplo (landing SaaS)

### Próximos pasos sugeridos:
1. Crear bloques personalizados para landing pages
2. Implementar editor simplificado para clientes
3. Agregar subida de imágenes al editor
4. Generar miniaturas automáticas de templates
5. Implementar sistema de planes/suscripciones

---

## 📞 Contacto con Usuario

El usuario puede tener conversaciones previas relacionadas con:
- Migración de módulo "Pedidos" (migracion_pedidos.sql)
- Sistema de permisos y roles
- Gestión de asignaciones

Consultar historial de conversaciones si se necesita contexto adicional.
