# Changelog - Claude

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **NEW**: Swiper.js integration for horizontal swipe navigation in playlist view
- **NEW**: Floating action buttons for chord toggle and home navigation in playlist view
- Circular floating button (Music2 icon) to toggle chord visibility globally
- Circular floating button (Home icon) to navigate back to songs list
- Default Swiper pagination with clickable dots for easy song navigation
- Infinite loop mode for continuous scrolling through playlist
- Full-height swiper container with flex layout for responsive design
- Select dropdown component for transpose key selection across all views
- Complete song management system with CRUD operations
- Song data model with TypeScript interfaces for type safety
- Song resource class with navigation configuration and API integration
- Song API service layer for all endpoints (GET, POST, PUT, DELETE)  
- Advanced search functionality for songs by title, artist, lyrics, and chords
- Filtering system by base chord and tags with sort by title A-Z
- Song creation and edit forms with comprehensive validation
- Song detail view page for individual song display
- Authentication token management for admin operations
- Song routes integration with existing admin panel structure
- `xs` button size variant for compact action buttons matching badge dimensions
- Color-coded action buttons with green, red, and yellow variants
- Custom color styling for badge cells with proper light/dark mode support
- React state-based table refresh system for real-time UI updates
- Toast notifications for user action feedback instead of console logging
- Form confirmation dialog with user-initiated submission tracking
- Enhanced HTML-based chord transposition for TipTap editor output
- Controlled state management for React Hook Form select fields
- **NEW**: Lexical editor integration replacing TipTap for better performance and mobile support
- Modern chord detection system in Lexical editor with automatic chord styling
- Lexical editor with undo/redo functionality and proper mobile responsiveness
- **OPTIMIZED**: Lexical editor paste handler performance with debouncing and caching
- Compiled regex patterns and text result caching for improved chord detection performance
- Debounced onChange handler (150ms) to prevent excessive processing during rapid typing/pasting

### Changed
- **MAJOR**: Replaced vertical scrolling with horizontal swipe navigation in playlist view using Swiper.js
- Changed playlist layout from stacked cards to full-screen slides for immersive experience
- **IMPROVED**: Replaced transpose key button grid with select dropdown for better UX and space efficiency
- Simplified transpose UI by removing "Original Key" and "Playlist Key" labels, showing only "Transpose:" with dropdown
- Updated playlist view, song viewer, playlist dialog, and bulk playlist dialog to use consistent select dropdown for key selection
- Modified playlist view container to use flexbox (h-screen) for proper full-height layout
- Updated action button hover states to use solid background colors with white text
- Modified badge rendering to use proper Tailwind color classes instead of generic names
- Enhanced ActionConfig interface to support 'xs' size and refresh callbacks
- Improved onClick handlers to pass refresh function for immediate UI updates
- Replaced console.error with user-friendly toast notifications using Sonner
- **REVERTED**: TipTap editor back to original data-chord attribute format for better compatibility
- Simplified chord transposition logic to use original data-chord="true" format
- Improved TipTap editor mobile responsiveness with better spacing and text sizing
- **MIGRATED**: From TipTap to Lexical editor for modern editing experience
- Updated form integration to use new ChordLexicalEditor component
- Enhanced editor performance and reduced bundle size with modern architecture

### Fixed
- Fixed badge status updates not triggering proper UI rerenders
- Resolved black badge display issue by implementing proper color mapping
- Fixed action button sizes to match badge proportions for visual consistency
- Improved error handling in user status updates with proper fallback behavior
- Fixed chord transposition mathematical logic producing incorrect semitone calculations
- Fixed base_chord select field not showing current database value during song editing
- Resolved confirmation dialog appearing on editor clicks by tracking user submission intent
- Fixed transpose functionality to work with TipTap's complex HTML structure with data-chord attributes
- Fixed TipTap editor showing empty content when editing existing songs with structured format
- Added parsing function to convert structured HTML back to editable plain text format
- Fixed empty div/pre elements being saved to database when no content is entered
- Enhanced content validation to prevent saving empty structured format
- Added comprehensive support for legacy chord formats and graceful fallbacks
- Fixed TipTap editor mobile view displaying content in single line without proper line breaks
- Improved mobile responsiveness with better padding, text size, and toolbar spacing
- **PERFORMANCE**: Fixed Lexical editor paste handler violations taking over 1000ms
- Optimized chord detection processing with caching and debouncing for better user experience
- **CRITICAL**: Fixed infinite paste/update loop in Lexical editor caused by InitialContentPlugin
- Added initialization state management to prevent circular onChange events during content loading
- **FIXED**: Enhanced chord hiding to also remove '#' (sharp) and 'b' (flat) symbols that aren't wrapped in chord spans

### Removed
- Removed header with chord switcher from playlist view in favor of floating buttons
- **BREAKING**: Removed vertical scrolling in playlist view - now uses horizontal swipe
- **BREAKING**: Removed minor keys (Cm, Dm, Em, Fm, Gm, Am, Bm) from transpose KEYS array - now only major keys available
- Removed stacked card layout in playlist view in favor of full-screen slides
- Removed transpose key button grid UI in favor of select dropdown
- Removed "Original Key" and "Playlist Key" display labels from playlist view
- Removed mock data fallback from API error handling for clearer error states
- Cleaned up unnecessary console logging in favor of toast notifications

### Todos History
- [x] Install Swiper.js package
- [x] Update playlist view to use Swiper for horizontal swipe
- [x] Add custom pagination styling with numbered bullets
- [x] Build and test swiper functionality
- [x] Remove minor keys from KEYS array in transpose-utils.ts
- [x] Replace key selector buttons with select dropdown in playlist view
- [x] Simplify layout - remove Original Key and Playlist Key labels
- [x] Update playlist-dialog.tsx to use select dropdown
- [x] Update bulk-playlist-dialog.tsx to use select dropdown
- [x] Build project to verify all changes
- [x] Update CHANGELOG-CLAUDE.md with changes
- [x] Define Song data model and TypeScript interfaces
- [x] Create Song resource class with navigation configuration
- [x] Set up API service layer for song endpoints
- [x] Register Song resource in existing admin panel
- [x] Implement song list page with data table and search functionality
- [x] Add filtering by base chord and tags with sort by title A-Z
- [x] Remove transpose keys from TipTap editor toolbar (keep only formatting tools)
- [x] Add confirmation dialog on form submissions
- [x] Fix base_chord select field not pre-populating during edit
- [x] Update transpose functionality to work with TipTap HTML output
- [x] Parse and transpose chords from HTML with data-chord attributes
- [x] Fix chord transposition mathematical logic producing incorrect results
- [x] Fix base_chord select field not showing current value during edit
- [x] Test all chord transpositions to verify correctness
- [x] Modify TipTap editor to output structured HTML with pre tags and span.c chord elements
- [x] Update chord detection to use span.c class instead of data-chord attribute
- [x] Update transpose functionality to work with new HTML structure
- [x] Test the new chord format with song viewer
- [x] Fix TipTap editor showing empty content when editing existing songs
- [x] Add function to parse structured HTML back to editable format
- [x] Test edit mode with existing song data
- [x] Fix empty div/pre being saved to database when no content is entered
- [x] Add validation to prevent saving empty structured format
- [x] Test form submission with empty and valid content
- [x] Rollback TipTap editor to original output format with data-chord attributes
- [x] Fix TipTap editor mobile responsiveness issues
- [x] Test mobile view and line breaks in TipTap editor
- [x] Replace TipTap editor with Lexical editor
- [x] Implement chord detection in Lexical editor
- [x] Update form integration to work with Lexical
- [x] Test Lexical editor on mobile and desktop
- [x] Optimize Lexical editor paste handler performance
- [x] Fix infinite paste issue in Lexical editor
- [x] Create song detail view page for individual songs
- [x] Build song creation form with validation
- [x] Build song edit form with pre-populated data
- [x] Implement delete functionality with confirmation dialog
- [x] Add authentication token management for admin operations
- [x] Integrate TanStack Query for data fetching and caching (removed due to missing dependency)
- [x] Test all CRUD operations and search/filter functionality
- [x] Update CHANGELOG-CLAUDE.md with implementation details

### Done Condition
- Song management system fully implemented with complete CRUD operations
- API integration working with songbanks-v1-1.vercel.app endpoints
- Search and filtering functionality operational (search, base_chord, tag_ids)
- Forms validation and submission working correctly
- Navigation and routing properly integrated with admin panel
- Delete functionality with confirmation dialogs implemented
- Authentication token management from localStorage working
- All TypeScript compilation passes without errors
- Build process completes successfully
- Development server starts without issues
- Chord transposition logic working correctly across all keys (verified with test cases)
- Form confirmation dialogs only appear on user-initiated submissions
- Select fields properly show current database values during edit mode
- TipTap editor focused on rich text formatting without transpose functionality
- Song viewer provides accurate chord transposition for all key changes

### Done Condition
- ✅ Swiper.js v11.1.15 installed successfully
- ✅ Playlist view converted to horizontal swipe navigation
- ✅ Default Swiper pagination with clickable dots implemented
- ✅ Infinite loop mode enabled for continuous scrolling
- ✅ Full-height layout with flexbox (h-screen) working correctly
- ✅ Each slide supports vertical scrolling for long lyrics
- ✅ Build completes successfully without errors
- ✅ Minor keys (Cm, Dm, Em, Fm, Gm, Am, Bm) removed from KEYS array
- ✅ All transpose key selectors replaced with select dropdown component
- ✅ Simplified UI with only "Transpose:" label and dropdown
- ✅ Updated files: transpose-utils.ts, playlist view, song-viewer, playlist-dialog, bulk-playlist-dialog
- ✅ All components use consistent Select dropdown from shadcn/ui
- ✅ Using default Swiper styles (no custom CSS needed)

**Session Git Hash**: ac1804a3c218c5a64ff44f26a56e9b6662c34139

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