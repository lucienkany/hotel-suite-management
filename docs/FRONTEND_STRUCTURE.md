# Frontend Structure Documentation

##  Complete Project Structure

\\\
frontend/
 app/
    components/              # Reusable UI components
       index.ts
       Alert/
          Alert.tsx
       Badge/
          Badge.tsx
       Card/
          Card.tsx
       DataTable/
          DataTable.tsx
       Modal/
          Modal.tsx
       Pagination/
          index.ts
          Pagination.tsx
       Select/
          Select.tsx
       ui/                  # Base UI components
           Button.tsx
           Input.tsx
    dashboard/
       page.tsx             # Dashboard home page
    lib/                     # Utilities and helpers
       api-client.ts        # API client configuration
       react-query.tsx      # React Query setup
       utils.ts             # Helper functions
    login/
       page.tsx             # Login page
    signup-company/
       page.tsx             # Company registration page
    store/                   # State management (Zustand)
       auth-store.ts        # Authentication state
       ui-store.ts          # UI state
    types/
       api.ts               # TypeScript API types
    favicon.ico              # App icon
    globals.css              # Global styles & Tailwind
    layout.tsx               # Root layout
    page.tsx                 # Landing page
 package.json
 ...config files
\\\

##  Architecture Overview

### State Management
- **Zustand**: Lightweight state management
- **auth-store.ts**: User authentication state
- **ui-store.ts**: UI-related state (modals, loading, etc.)

### Data Fetching
- **React Query**: Server state management
- **api-client.ts**: Axios configuration with interceptors

### Component Structure
- **Atomic Design**: Base components in ui/ folder
- **Composite Components**: Alert, Badge, Card, DataTable, etc.
- **Page Components**: login/, dashboard/, signup-company/

### Routing
- Next.js App Router (app directory)
- File-based routing

### Styling
- TailwindCSS utility classes
- Global styles in globals.css

##  API Integration

- **Base URL**: http://localhost:4000
- **Client**: Axios with React Query
- **Auth**: JWT tokens managed by auth-store
