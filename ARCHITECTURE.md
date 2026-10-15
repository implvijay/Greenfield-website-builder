# Architecture

## Core Principle: Single Source of Truth

The entire system uses ONE canonical project definition:

```
PROJECT DEFINITION (TypeScript interfaces)
       ↓
RENDERING MODEL (SectionRenderer + ComponentRenderer)
       ↓
 ┌─────┼─────────────┐
 ↓     ↓             ↓
Builder Preview     Export
             ↓
       ┌─────┼─────┐
       ↓     ↓     ↓
    Static Laravel React
```

## State Management

- React Context + useReducer for state
- localStorage for persistence
- Repository pattern (ready for database migration)

## Storage Architecture

```
ProjectRepositoryInterface
├── FileProjectRepository (localStorage - Phase 1)
└── DatabaseProjectRepository (Phase 2)
```

## Rendering Pipeline

1. Project JSON → Rendering Model
2. Rendering Model → Visual Components
3. Components → HTML/CSS output

## Project Isolation

Each project has completely independent:
- Content and pages
- Menus and navigation
- Theme and variant
- Media assets
- Forms and SEO
- Versions and exports

## Security

- Authentication required for all access
- Role-based authorization
- Input validation on all forms
- No executable code in exported sites
- Safe HTML rendering (no innerHTML with user data)
