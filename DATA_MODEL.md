# Data Model

## Core Entities

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'designer' | 'viewer';
  avatar?: string;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  customer: string;
  industry: IndustryType;
  description: string;
  domain: string;
  location: string;
  contact: ContactInfo;
  status: ProjectStatus;
  themeId: string;
  themeVariant: ThemeVariantType;
  pages: Page[];
  menus: Menu[];
  forms: Form[];
  seo: SEOSettings;
  analytics: AnalyticsSettings;
  media: MediaAsset[];
  versions: Version[];
  createdAt: string;
  updatedAt: string;
}
```

### Page
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  parentId?: string;
  status: 'draft' | 'published';
  sections: Section[];
  seo: PageSEO;
  order: number;
}
```

### Section
```typescript
interface Section {
  id: string;
  type: SectionType;
  variant: string;
  settings: SectionSettings;
  rows: Row[];
  animation?: AnimationSettings;
}
```

### Theme
```typescript
interface Theme {
  id: string;
  name: string;
  industry: IndustryType;
  description: string;
  tokens: DesignTokens;
  variants: Record<ThemeVariantType, DesignTokens>;
}
```

### Design Tokens
```typescript
interface DesignTokens {
  colors: { primary, primaryLight, primaryDark, secondary, ... };
  typography: { headingFont, bodyFont, headingWeight, ... };
  spacing: { section, container, gap };
  borderRadius: string;
  shadow: string;
}
```

## Relationships

- Project → Theme (many-to-one)
- Project → Pages (one-to-many)
- Page → Sections (one-to-many)
- Section → Rows (one-to-many)
- Row → Columns (one-to-many)
- Column → Components (one-to-many)
- Project → Menus (one-to-many)
- Menu → MenuItems (one-to-many, recursive)
- Project → Versions (one-to-many)

## Industries (15)

Corporate, Technology, SaaS, Digital Agency, Consulting, Healthcare, Education, Manufacturing, Real Estate, Hospitality, Professional Services, Local Business, Creative, Construction, Finance/Legal

## Page Types (25)

Home, About, Services, Service Detail, Products, Solutions, Industries, Portfolio, Case Studies, Pricing, Team, Careers, Contact, FAQ, Testimonials, Gallery, Locations, Landing, Lead Generation, Thank You, Privacy, Terms, Blog Listing, Blog Detail, Features, Process

## Section Types (25+)

Hero, Text, Image/Text, Services, Features, Testimonials, Statistics, FAQ, CTA, Team, Pricing, Gallery, Contact, Logo Cloud, Timeline, Process, Newsletter, Video, Cards, Comparison, Accordion, Blog Cards, Portfolio, Case Studies, Map, Footer, Header, Announcement Bar, Social Links, Floating Buttons, Cookie Notice, Breadcrumb
