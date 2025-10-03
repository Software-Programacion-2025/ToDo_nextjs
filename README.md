# 🚀 ToDo System - Frontend

Sistema completo de gestión de tareas desarrollado con **Next.js 14**, **TypeScript**, y **Tailwind CSS**. Interface moderna y responsiva que consume la API FastAPI del backend.

## 🚀 Puesta en Marcha

### Prerrequisitos

- **Node.js 18+**
- **npm** o **yarn**
- **Backend FastAPI** ejecutándose en `http://localhost:8000`

### Instalación Rápida

```bash
# 1. Clonar el repositorio (si no lo has hecho)
git clone <url-repositorio>
cd ToDo_nextjs

# 2. Instalar dependencias
npm install
# o
yarn install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con la URL de tu API

# 4. Iniciar el servidor de desarrollo
npm run dev
# o
yarn dev
```

### Verificación de Instalación

1. **Frontend ejecutándose**: [http://localhost:3000](http://localhost:3000)
2. **Página de login**: [http://localhost:3000/login](http://localhost:3000/login)
3. **Backend requerido**: [http://localhost:8000](http://localhost:8000)

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Funcionalidades

### 🔐 Sistema de Autenticación
- **Login seguro** con JWT tokens
- **Sesión persistente** con sessionStorage
- **Logout automático** al expirar el token
- **Rutas protegidas** con AuthGuard
- **Redirección automática** según estado de autenticación

### 👥 Panel de Administración de Usuarios
- **Vista completa** de usuarios del sistema
- **Crear usuarios** con validación de datos
- **Editar información** de usuarios existentes
- **Asignar roles** (Administrador, Gerente, Empleado, Cajero)
- **Soft delete** - eliminar usuarios sin pérdida de datos
- **Restaurar usuarios** eliminados
- **Tabs organizadas** - usuarios activos vs eliminados
- **Búsqueda y filtrado** de usuarios

### 📝 Sistema de Tareas Avanzado

#### Para Usuarios Regulares:
- **Dashboard personal** - solo tareas asignadas al usuario
- **Crear tareas personales** que se auto-asignan
- **Editar tareas** propias (título, descripción, estado)
- **Cambiar estado** con popup rápido
- **Vista limpia** sin acceso a tareas de otros usuarios

#### Para Administradores:
- **Panel de administración** completo de tareas
- **Crear tareas** para cualquier usuario
- **Asignar múltiples usuarios** a una sola tarea
- **Gestión visual con badges** - agregar/quitar usuarios con pastillas
- **Vista global** de todas las tareas del sistema
- **CRUD completo** - crear, leer, actualizar, eliminar tareas

### 🛡️ Control de Acceso por Roles
- **PermissionsGuard** - verificación automática de permisos
- **Rutas protegidas** según rol del usuario
- **UI adaptativa** - botones y menús según permisos
- **Navegación inteligente** - acceso solo a secciones autorizadas

### 🎨 Interfaz de Usuario Moderna
- **Design System** con Tailwind CSS
- **Componentes reutilizables** con shadcn/ui
- **Dialogs y modals** para operaciones CRUD
- **Toasts informativos** para feedback del usuario
- **Tablas responsivas** con paginación
- **Loading states** y manejo de errores
- **Iconos consistentes** con Lucide React

### 📱 Experiencia de Usuario

#### Componentes Principales:
- **Header navigation** - navegación principal con logout
- **AuthGuard** - protección automática de rutas
- **Dashboard** - página principal para usuarios
- **Admin Panel** - gestión completa para administradores
- **Task Management** - sistema avanzado de gestión de tareas
- **User Management** - CRUD completo de usuarios

#### Estados y Feedback:
- **Loading spinners** durante operaciones
- **Success/Error toasts** para todas las acciones
- **Form validation** en tiempo real
- **Confirmation dialogs** para acciones destructivas
- **Empty states** informativos

## 🏗️ Arquitectura del Proyecto

```
📁 ToDo_nextjs/
├── 🚀 app/                     # App Router (Next.js 14)
│   ├── 🔐 login/              # Página de autenticación
│   ├── 📊 dashboard/          # Dashboard principal usuario
│   ├── ⚙️ admin/             # Panel de administración
│   │   ├── users/            # Gestión de usuarios
│   │   └── tasks/            # Gestión de tareas admin
│   ├── 📱 globals.css        # Estilos globales
│   └── 🖼️ layout.tsx         # Layout principal
├── 🧩 components/             # Componentes reutilizables
│   ├── 🔒 auth-guard.tsx     # Protección de rutas
│   ├── 🛡️ permissions-guard.tsx # Control de permisos
│   ├── 🎨 ui/                # Componentes UI (shadcn)
│   └── 📐 layout/            # Componentes de layout
├── 🔧 lib/                   # Servicios y utilidades
│   ├── 🔑 auth.ts           # Servicio de autenticación
│   ├── 📝 tasks.ts          # Servicio de tareas
│   ├── 👥 admin.ts          # Servicio de administración
│   └── 🛠️ utils.ts          # Utilidades generales
├── 🎣 hooks/                 # Custom React Hooks
├── 🎯 Types/                 # Definiciones TypeScript
└── 📦 public/               # Archivos estáticos
```

## 🛠️ Tecnologías Utilizadas

### Core Framework
- **[Next.js 14](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[React 18](https://reactjs.org/)** - Biblioteca de UI

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI modernos
- **[Lucide React](https://lucide.dev/)** - Iconos consistentes

### Estado y Comunicación
- **Fetch API** - Comunicación con backend
- **SessionStorage** - Persistencia de sesión
- **React State** - Manejo de estado local

### Desarrollo
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formateo de código

## 👥 Usuarios de Prueba

Una vez que ejecutes los seeders del backend, puedes usar estas credenciales:

| Email | Contraseña | Rol | Acceso |
|-------|------------|-----|---------|
| admin@todo.com | admin123 | Administrador | Panel completo + usuarios + tareas |
| gerente@todo.com | gerente123 | Gerente | Gestión de tareas + usuarios |
| empleado@todo.com | empleado123 | Empleado | Dashboard personal + crear tareas |
| cajero@todo.com | cajero123 | Cajero | Solo dashboard personal |

## 🔗 Integración con Backend

### Endpoints Utilizados

| Funcionalidad | Endpoint | Método |
|---------------|----------|--------|
| Login | `/users/login` | POST |
| Usuario actual | `/users/me` | GET |
| Tareas por usuario | `/tasks/user/{id}` | GET |
| Todas las tareas | `/tasks` | GET |
| Crear tarea | `/tasks` | POST |
| Actualizar tarea | `/tasks/{id}` | PATCH |
| Asignar usuario | `/tasks/{id}/assign` | POST |
| Usuarios | `/users` | GET, POST, PUT |

### Autenticación
- **Bearer Token** en headers Authorization
- **Renovación automática** de sesión
- **Logout automático** en errores 401

## 🧪 Desarrollo y Testing

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción  
npm run start        # Servidor de producción
npm run lint         # Verificar código

# Utilidades
npm run type-check   # Verificar TypeScript
```

### Estructura de Desarrollo
- **Componentes modulares** con props tipados
- **Servicios centralizados** para API calls
- **Error boundaries** para manejo de errores
- **Loading states** consistentes
- **Form validation** con feedback visual

## 📄 Licencia

**MIT License**

Este proyecto es desarrollado para fines educativos como parte del **ToDo System**.

### Términos de Uso

- ✅ **Uso libre** para fines educativos y de aprendizaje
- ✅ **Modificación y distribución** permitida con atribución  
- ✅ **Uso comercial** permitido bajo los términos de la licencia MIT
- ⚠️ **Sin garantía** - el software se proporciona "tal como está"

### Atribución

```
ToDo System Frontend - Interface moderna para gestión de tareas
Desarrollado con Next.js 14 + TypeScript + Tailwind CSS
Proyecto educativo
```

---

**🎨 ¡Tu interface moderna para gestión de tareas está lista!**

**Requisitos**: Asegúrate de tener el backend FastAPI ejecutándose en `http://localhost:8000` antes de usar el frontend.
