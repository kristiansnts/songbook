# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run knip` - Find unused dependencies and exports

### Build Process
The build process requires both TypeScript compilation and Vite bundling. Always run the full build command to ensure the TanStack Router generates the route tree properly.

## Architecture Overview

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Routing**: TanStack Router with auto-generated route tree
- **UI**: ShadcnUI components built on Radix UI primitives
- **Styling**: TailwindCSS v4 with CSS-in-JS approach
- **Icons**: Tabler Icons with Lucide React as secondary
- **State Management**: Zustand for global state, React Hook Form for forms
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: Custom auth context with localStorage (dummy implementation)

### Project Structure

#### Feature-Based Organization
The codebase uses a feature-based structure under `src/features/`:
- `auth/` - Authentication pages (sign-in, sign-up, forgot-password, OTP)
- `dashboard/` - Main dashboard with overview components  
- `tasks/` - Task management with data tables and CRUD operations
- `users/` - User management with data tables and dialogs
- `settings/` - User settings (account, appearance, display, notifications, profile)
- `errors/` - Error pages (401, 403, 404, 500, 503)

#### Layout System
- `src/components/layout/` - Layout components and sidebar navigation
- `AuthenticatedLayout` - Main layout wrapper with sidebar provider
- `AppSidebar` - Collapsible sidebar with navigation groups
- `sidebar-data.ts` - Navigation configuration (menu items, icons, URLs)

#### Routing Architecture
- File-based routing with TanStack Router
- Auto-generated route tree in `routeTree.gen.ts` (do not manually edit)
- Route protection via `beforeLoad` hooks checking localStorage auth
- Nested layouts: `__root.tsx` -> `_authenticated/route.tsx` -> page components

#### Component Structure
- `src/components/ui/` - Reusable ShadcnUI components
- `src/components/` - Application-specific components
- Each feature has its own `components/` directory for feature-specific UI

#### Authentication Flow
- Custom auth context in `src/lib/auth.tsx`
- Dummy authentication: email `admin@gmail.com`, password `password`
- localStorage-based session persistence
- Route protection redirects to `/sign-in` for unauthenticated users

#### Data Layer
- TanStack Query for server state management
- Zustand stores in `src/stores/` for client state
- Mock data generators using Faker.js in development
- Schema validation with Zod for forms and API responses

#### Styling Conventions
- TailwindCSS utility classes with `cn()` utility for conditional classes
- Component variants using `class-variance-authority`
- Responsive design with mobile-first approach
- Dark/light theme support via CSS variables

### Path Aliases
- `@/*` maps to `src/*` for clean imports
- Special alias for Tabler Icons to fix dev mode performance

### Key Development Notes

#### Adding New Routes
1. Create route file in appropriate `src/routes/` directory
2. Route tree auto-regenerates on build
3. Add navigation items to `src/components/layout/data/sidebar-data.ts`
4. Follow existing naming conventions for route files

#### Adding New Features
1. Create feature directory under `src/features/`
2. Include `components/`, `data/`, and optionally `context/` subdirectories
3. Export main component from `index.tsx`
4. Add route files in corresponding `src/routes/` structure

#### Form Handling
- Use React Hook Form with Zod validation
- ShadcnUI Form components provide consistent styling
- Toast notifications via Sonner for user feedback

#### Data Tables
- Built with TanStack Table
- Reusable data table components in feature directories
- Include filtering, sorting, pagination, and row actions

#### Authentication Testing
Use the dummy credentials for development:
- Email: `admin@gmail.com`
- Password: `password`

The authentication system is designed to be replaced with a real auth provider (Clerk is partially integrated but not fully implemented).