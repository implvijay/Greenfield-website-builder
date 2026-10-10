# GREENFIELD - Website Factory

A professional visual website builder for digital marketing and web development teams.

## Overview

GREENFIELD is an internal tool that automates 70-80% of typical customer website creation, allowing developers and designers to focus on the remaining 20-30% customization.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Features

- **12 Professional Themes** with 4 variants each (48 total experiences)
- **Visual Page Builder** with drag-and-drop, inline editing, responsive preview
- **Component Library** with 30+ reusable components
- **Menu System** with nested navigation, cloning, visual builder
- **SEO Management** with audit, meta tags, schema, social links
- **Version Control** with named snapshots and restore
- **Multi-format Export** - Static HTML, Laravel 12, React/Node
- **Industry Starters** - 15 industries with content-rich templates
- **Project Isolation** - Complete separation between projects
- **Role-based Access** - Admin, Developer, Designer, Viewer

## Architecture

```
src/
├── types/          # TypeScript type definitions
├── store/          # State management (Context + localStorage)
├── data/           # Themes, industries, starter content
├── components/     # Shared UI components
├── pages/          # Page-level components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Projects.tsx
│   ├── ProjectWorkspace.tsx
│   └── Themes.tsx
├── App.tsx         # Main app with routing
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Data Model

See [DATA_MODEL.md](./DATA_MODEL.md) for complete type definitions.

## Theme System

12 base themes × 4 variants = 48 unique experiences:
- Corporate, Technology, SaaS, Digital Agency, Consulting
- Healthcare, Education, Manufacturing, Real Estate
- Hospitality, Professional Services, Creative

Variants: Default, Dark, Vibrant, Soft

## Export Formats

1. **Static HTML** - Pure HTML/CSS/JS, deploy anywhere
2. **Laravel 12** - PHP 8.3, Blade templates, full structure
3. **React/Node** - React 18, TypeScript, Vite, Express

## Authentication

Demo credentials:
- Email: admin@greenfield.io
- Password: admin123

## Technology Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS 4
- React Router DOM
- Lucide React (icons)
- UUID (unique identifiers)
- LocalStorage (persistence)

## Project Structure

Each project contains:
- Pages with sections, rows, columns, and components
- Menus (primary, footer, mobile, etc.)
- Theme and variant selection
- SEO settings
- Analytics configuration
- Version history
- Media assets

## License

Internal use only.
