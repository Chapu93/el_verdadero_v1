# Agent Context - Stitch Page Builder

Este archivo proporciona contexto para que un agente de IA pueda continuar el desarrollo del proyecto.

## 📌 Objetivo del Proyecto

**Plataforma de venta de páginas web personalizables:**
- Vender plantillas de landing pages
- Duplicar plantillas para clientes específicos  
- Permitir personalización visual (texto, colores, imágenes)
- Panel admin (edición avanzada) + Panel cliente (edición básica)

## 🎯 Estado Actual

### Completado ✅
- Autenticación JWT (login/logout, roles ADMIN/USER)
- Dashboard con estadísticas en tiempo real
- CRUD completo de Clientes (crear, editar, eliminar, vista detalle)
- CRUD completo de Pedidos (crear, editar estado, eliminar)
- Perfil de usuario editable
- Sistema de notificaciones (toasts)
- Componentes UI reutilizables

### En Desarrollo 🔄
- **Page Builder Platform** - Sistema de plantillas y páginas personalizables

## 🔧 Próxima Tarea

Implementar el sistema de plantillas y páginas según el plan aprobado:

1. **Modelos de Prisma**: Template, Page, PageElement
2. **Backend APIs**: CRUD templates, CRUD pages, render público
3. **Frontend Admin**: Lista templates, crear página desde template
4. **Editor Visual**: Panel para editar elementos (texto, color, imagen)
5. **Renderizado**: Mostrar páginas en `/p/:slug`

## 📁 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `backend/prisma/schema.prisma` | Modelos de BD (agregar Template, Page, PageElement) |
| `backend/src/routes/index.ts` | Registrar nuevas rutas |
| `frontend/src/App.tsx` | Registrar nuevas páginas |
| `frontend/src/features/templates/` | Ya existe, refactorizar con datos reales |
| `frontend/src/features/pages/` | CREAR - gestión de páginas de clientes |

## 🔑 Decisiones de Diseño

- **URLs de páginas**: Rutas `/p/cliente-slug` (no subdominios)
- **Editor Admin**: Avanzado (duplicar, editar HTML/CSS)
- **Editor Cliente**: Básico (solo texto, colores, imágenes)
- **Imágenes**: URL externa + Upload local
- **BD desarrollo**: SQLite (`file:./dev.db`)
- **Caché**: Redis deshabilitado, fallback sin caché

## 🚀 Comandos

```bash
# Backend (localhost:4000)
cd backend && npm run dev

# Frontend (localhost:3000)  
cd frontend && npm run dev

# Resetear BD
cd backend && npx prisma migrate reset

# Credenciales: admin@empresa.com / admin123
```

## 📋 Modelo de Datos Propuesto

```
Template (plantilla master)
├── id, name, description, thumbnail
├── htmlContent, cssContent
└── isActive, createdAt

Page (instancia para cliente)
├── id, templateId, customerId
├── name, slug, customCss
├── isPublished, createdAt
└── elements[]

PageElement (elemento editable)
├── id, pageId, elementKey
├── type (TEXT/IMAGE/COLOR/LINK)
├── content, label
```

## 🎨 Componentes UI Disponibles

En `frontend/src/components/ui/`:
- Button, Input, Select, Toggle
- Modal, ConfirmDialog, Toast
- Card, Pagination, EmptyState
- Skeleton, LoadingSpinner

## ⚠️ Notas Importantes

1. Tailwind v4 con variables CSS en `index.css`
2. Path aliases: `@/` apunta a `src/`
3. Axios proxy: `/api` → `localhost:4000/api`
4. React Query para estado del servidor
5. Zustand para estado global (auth)
