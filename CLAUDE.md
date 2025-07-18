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
- `npm run generate:panel -- --name PanelName` - Generate new admin panel with layout and routes

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

## Panel Generator System

### Generate Panel Command
```bash
npm run generate:panel -- --name PanelName
```

### Memory: Panel Generator Fixes Applied
- **Import Path Fix**: Layout components use `../../config/panel-config`, pages use `../config/panel-config`
- **Route Structure**: Uses `_authenticated/{panelname}` directory structure for TanStack Router (fixed from `(panelname)` which caused conflicts)
- **Build Integration**: Automatically runs `npm run build` to regenerate route tree
- **TypeScript Support**: Fully typed components with proper interfaces
- **Route Conflicts**: Fixed route conflicts by placing panels under `_authenticated` instead of root level
- **UI Improvements**: Enhanced sidebar with branding, better dashboard layout, removed duplicate header, modern card design

### Panel Structure Generated
```
src/panels/{panelName}/
├── config/{panelName}-config.ts     # Panel configuration
├── components/layout/
│   └── {Name}Sidebar.tsx            # Branded sidebar component
├── pages/
│   └── {Name}Dashboard.tsx          # Enhanced dashboard page
├── {Name}Layout.tsx                 # Improved layout wrapper
└── index.ts                         # Export index

src/routes/_authenticated/{panelName}/
├── route.tsx                        # Main panel route
├── dashboard.tsx                    # Dashboard route
└── index.tsx                        # Redirect to dashboard
```

### Post-Generation Steps
1. Run `npm run build` to regenerate route tree if build fails during generation
2. Panel accessible at `http://localhost:5173/{panelname}`

### Import Path Reference
- **Layout Components** (in `components/layout/`): Use `../../config/{panelname}-config`
- **Pages** (in `pages/`): Use `../config/{panelname}-config`
- **Main Layout** (in root): Use `./config/{panelname}-config`

## Changelog Management

### Automatic Changelog Updates
When making changes to the codebase, always update the `CHANGELOG-CLAUDE.md` file to track modifications:

1. **After completing tasks**: Add new entries to the `[Unreleased]` section
2. **Include hash reference**: Add git commit hash for traceability
3. **Document todos history**: Record completed and pending tasks
4. **Set done condition**: Define completion criteria

### Changelog Structure
- **Added**: New features and capabilities
- **Changed**: Modifications to existing functionality  
- **Fixed**: Bug fixes and corrections
- **Removed**: Deleted features or code
- **Todos History**: Track task completion status
- **Done Condition**: Completion criteria and validation steps

### Update Process
1. Complete development work
2. Run tests and build commands
3. Update `CHANGELOG-CLAUDE.md` with changes
4. Include git commit hash reference
5. Document todos and done conditions
6. Commit changes with descriptive message