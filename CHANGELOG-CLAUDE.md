# Changelog - Claude

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `xs` button size variant for compact action buttons matching badge dimensions
- Color-coded action buttons with green, red, and yellow variants
- Custom color styling for badge cells with proper light/dark mode support
- React state-based table refresh system for real-time UI updates
- Toast notifications for user action feedback instead of console logging

### Changed
- Updated action button hover states to use solid background colors with white text
- Modified badge rendering to use proper Tailwind color classes instead of generic names
- Enhanced ActionConfig interface to support 'xs' size and refresh callbacks
- Improved onClick handlers to pass refresh function for immediate UI updates
- Replaced console.error with user-friendly toast notifications using Sonner

### Fixed
- Fixed badge status updates not triggering proper UI rerenders
- Resolved black badge display issue by implementing proper color mapping
- Fixed action button sizes to match badge proportions for visual consistency
- Improved error handling in user status updates with proper fallback behavior

### Removed
- Removed mock data fallback from API error handling for clearer error states
- Cleaned up unnecessary console logging in favor of toast notifications

### Todos History
- [x] Examine table-renderer.tsx to understand current rendering implementation
- [x] Implement useState or Zustand store for badge status rerendering  
- [x] Update action onClick handlers to trigger proper rerenders
- [x] Test badge updates and rerenders in development

### Done Condition
- Action buttons are properly sized to match badges
- Badge colors display correctly with semantic color coding
- User status changes trigger immediate UI updates with toast feedback
- Button hover states show solid colors with white text
- All TypeScript compilation passes without errors

---

## [1.0.2] - 2025-07-18
**Hash**: daef5b0

### Added
- Configurable search column functionality for table resources
- `searchColumnId` property to `TableBuilderConfig` interface
- `searchColumnId()` method to `TableBuilder` class for fluent API
- Resource-specific search configuration support

### Changed
- Modified `DataTableToolbar` to accept `searchColumnId` prop instead of hardcoding 'title'
- Enhanced `TableRenderer` to pass `searchColumnId` to toolbar component
- Updated `UserResource` to use 'email' as the searchable column
- Updated `SongResource` and `NoteResource` to explicitly use 'title' as searchable column

### Fixed
- Fixed console error "[Table] Column with id 'title' does not exist" for UserResource
- Resolved hardcoded 'title' column dependency in table search functionality
- Fixed search functionality for resources without a 'title' column
- Removed unused React import from table-toolbar.tsx

### Removed
- Removed hardcoded 'title' column reference from table search
- Removed unused imports to clean up code

### Todos History
- [x] Identify source of table column error in console
- [x] Analyze table-toolbar.tsx for hardcoded column references
- [x] Implement configurable search column functionality
- [x] Update all resource table schemas with searchColumnId
- [x] Test fix with development server
- [x] Update CHANGELOG-CLAUDE.md with implementation details

### Done Condition
- Console error "[Table] Column with id 'title' does not exist" resolved
- All resources can define their own searchable column
- Search functionality works correctly for UserResource (email) and other resources (title)
- TypeScript compilation clean for table-related components
- Development server running successfully with search functionality working

---

## [1.0.1] - 2025-07-18
**Hash**: db2d024

### Added
- Delete confirmation dialog functionality for table actions
- ActionButton component with confirmation support for single actions
- ActionDropdown component with confirmation support for multiple actions
- Loading states for delete operations with proper UI feedback
- Async action handling with Promise.resolve() wrapper
- Integration with existing ConfirmDialog component

### Changed
- Enhanced table-renderer.tsx with confirmation dialog support
- Updated ActionConfig to properly handle requiresConfirmation property
- Modified table action handlers to support both sync and async operations
- Improved action button styling and loading states
- Updated import statements to include ConfirmDialog component

### Fixed
- Fixed delete confirmation dialog not showing up when clicking delete actions
- Resolved TypeScript errors with async action handling
- Fixed 'await has no effect' TypeScript warnings
- Corrected 'expression of type void cannot be tested for truthiness' errors
- Fixed button size type compatibility issues
- Resolved Promise type checking issues with proper Promise.resolve() usage

### Removed
- Removed unused SelectColumnConfig import to clean up code

### Todos History
- [x] Check ConfirmDialog component implementation
- [x] Investigate table action handler for confirmation
- [x] Test and fix delete confirmation dialog
- [x] Fix TypeScript errors with async action handling
- [x] Update CHANGELOG-CLAUDE.md with implementation details

### Done Condition
- Delete confirmation dialog appears when clicking delete actions
- Confirmation dialog shows proper title and message from resource config
- Loading states work correctly during delete operations
- TypeScript compilation errors resolved
- Both single action buttons and dropdown menus support confirmation
- Integration with existing ConfirmDialog component working properly
- Development server running successfully with new functionality

---

## [1.0.1] - 2025-07-18
**Hash**: db2d024

### Added
- FilamentPHP-style filter system for resources with grouped filters
- Enhanced TableBuilder with FilamentPHP-style column and filter builders
- `TextColumn::make()`, `BadgeColumn::make()`, `DateColumn::make()`, `ActionsColumn::make()` static methods
- `SelectFilter::make()` and `Filter::make()` static methods for fluent API
- `defaultSort()` method for table configuration
- Date range filter support with `fromLabel` and `toLabel` properties
- Filter validation in `FilterBuilder.build()` method
- Automatic filter type conversion in `TableBuilder.filters()` method

### Changed
- Updated `TableBuilderConfig` interface to support `defaultSort` configuration
- Enhanced `FilterConfig` interface with date range support
- Modified `TableBuilder.filters()` to accept both `FilterConfig` and `FilterBuilder` objects
- Updated resource table configurations to use new filter system
- Improved SongResource with color-coded badges for status and keys
- Enhanced NoteResource with date filtering capabilities
- Updated CLAUDE.md with changelog update requirements

### Fixed
- Fixed TypeScript compilation errors in table builder system
- Resolved 500 error by fixing import/export issues in builders
- Fixed unused parameter warnings in resources
- Corrected table builder exports in components index
- Fixed filter builder validation and type safety

### Removed
- Removed unused legacy column exports to prevent conflicts

---

## [1.0.0] - 2025-07-18
**Hash**: 7af2d48

### Added
- Changelog system for tracking project changes (CHANGELOG-CLAUDE.md)
- Automatic changelog updating process via CLAUDE.md
- Changelog management section in CLAUDE.md with structured workflow

### Changed
- Updated CLAUDE.md to include changelog maintenance instructions
- Enhanced project documentation with changelog integration

### Fixed

### Removed

### Todos History
- [x] Create changelog-claude.md with proper structure and format
- [x] Update CLAUDE.md to include automatic changelog saving instructions

### Done Condition
- CHANGELOG-CLAUDE.md created with proper structure
- CLAUDE.md updated with changelog management workflow
- Documentation provides clear guidance for future changes
- Template and examples provided for consistent formatting

---

## Change Entry Template

When adding new changes, use this template:

```
## [Version] - YYYY-MM-DD
**Hash**: [git-commit-hash]

### Added
- Brief summary of new features

### Changed  
- Brief summary of modifications

### Fixed
- Brief summary of bug fixes

### Removed
- Brief summary of removed features

### Todos History
- [x] Completed task description
- [ ] Pending task description

### Done Condition
- All tests passing
- Build successful
- Documentation updated
- Code review completed
```

---

## Historical Changes

### [Initial] - 2025-07-18
**Hash**: 7af2d48

### Added
- Panel generation script with layout and routing structure
- Note and Song resources with CRUD functionality
- Enhanced authentication with success toast and dismiss action
- Dashboard link in topNav
- Songbook features and customization documentation

### Changed
- Updated README to reflect songbook features
- Refactored authentication routes structure

### Fixed
- Auth success toast implementation
- Dashboard navigation links

### Removed
- Unused authentication components
- Invite user button

### Todos History
- [x] Implement panel generation system
- [x] Add Note and Song resources
- [x] Enhance authentication flow
- [x] Update documentation

### Done Condition
- All features implemented and tested
- Build process successful
- Route tree properly generated
- Authentication flow working correctly