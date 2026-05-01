# Events Module - Detailed Implementation Guide

## Module Overview
The Events module manages the full event lifecycle including creation, venues, agendas, and status management for internal events, external hosted events, and job fairs.

---

## 1. Screens & Components

### 1.1 Event List Page (`/events`)

#### File Structure
```
src/pages/Events/
├── EventList/
│   ├── index.tsx           # Page container
│   ├── EventGrid.tsx       # Card grid view
│   ├── EventTable.tsx      # Table view alternative
│   └── EventFilters.tsx    # Type & status filters
├── EventForm/
│   ├── index.tsx           # Create/Edit wizard
│   ├── StepBasics.tsx      # Step 1: Basic info
│   ├── StepVenues.tsx      # Step 2: Venues
│   ├── StepAgendas.tsx     # Step 3: Agenda items
│   └── eventSchema.ts      # Validation schemas
├── EventDetail/
│   ├── index.tsx           # Detail view
│   ├── EventHero.tsx       # Header with cover
│   ├── EventInfo.tsx       # About section
│   ├── EventVenues.tsx     # Venues list
│   ├── EventAgenda.tsx     # Agenda timeline
│   └── EventActions.tsx    # Register/Edit buttons
└── components/
    ├── EventTypeBadge.tsx
    └── EventStatusBadge.tsx
```

#### Component Specification

**`EventListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Events" + "Create Event" button (admin/staff only)
  - Filter tabs: All | Internal | Job Fair | External Hosted
  - Status filter dropdown: All | Draft | Published | Archived
  - Card grid or table toggle
  - Pagination controls
- **Access**: All authenticated users

**`EventGrid`** (Card Display)
- **Layout**: Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- **Card Structure**:
  - Cover image placeholder (16:9 aspect ratio)
  - Status overlay badge (top-right): Draft/Published/Archived
  - Type badge (top-left): Internal/Job Fair/External
  - Title (bold, 2 lines max)
  - Date range (icon + formatted dates)
  - Description (truncated to 150 chars)
  - Footer: "View Details" link

**API Integration**
```typescript
GET /events?page=1&limit=20
Response: {
  success: true,
  data: {
    items: Event[],
    pagination: { ... }
  }
}
```

---

### 1.2 Event Create/Edit Wizard (`/events/new`, `/events/:id/edit`)

**`EventFormPage`** (Wizard Container)
- **Layout**: Multi-step wizard with progress indicator
- **Steps**: 3 steps with validation per step
- **Navigation**: Previous/Next buttons, step indicators

**Step 1: Basics**
- **Fields**:
  - Event Title (text, 3-255 chars, required)
  - Event Type (dropdown, required)
    - Options: internal, external_hosted, job_fair
  - Event Status (dropdown, required)
    - Options: draft, published, archived
  - Start Date (date picker, required)
  - End Date (date picker, must be after start date, required)
  - Description (textarea, 10-2000 chars, required)

**Step 2: Venues**
- **Layout**: Dynamic form list
- **Features**:
  - Add/Remove venue buttons
  - Each venue card:
    - Venue Name (text, required)
    - Capacity (number, min 1, required)
  - At least one venue recommended for external/job_fair types

**Step 3: Agenda**
- **Layout**: Dynamic form list
- **Features**:
  - Add/Remove agenda item buttons
  - Each agenda item card:
    - Item Type (dropdown, required)
      - Options: session, break, branding_day
    - Start Time (time picker, HH:mm format, required)
    - End Time (time picker, HH:mm format, required, must be after start time)
    - Details (textarea, min 5 chars, required)
  - Sortable list (drag to reorder)

**Validation Schema**
```typescript
const venueSchema = z.object({
  venueName: z.string().min(1, 'Venue name is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
});

const agendaSchema = z.object({
  itemType: z.enum(['session', 'break', 'branding_day']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  details: z.string().min(5, 'Details must be at least 5 characters'),
});

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  eventType: z.enum(['internal', 'external_hosted', 'job_fair']),
  status: z.enum(['draft', 'published', 'archived']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  venues: z.array(venueSchema).optional(),
  agendas: z.array(agendaSchema).optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});
```

**API Integration**
```typescript
// Create
POST /events
Request: CreateEventDto (includes venues[] and agendas[])
Response: { success: true, data: Event }

// Update
PATCH /events/:id
Request: UpdateEventDto (partial)
Response: { success: true, data: Event }
```

---

### 1.3 Event Detail Page (`/events/:id`)

**`EventDetailPage`** (Detail View)
- **Layout**:
  - Hero section with title and action buttons
  - Two-column grid:
    - Left (60%): About, Venues
    - Right (40%): Agenda Timeline

**`EventHero`** (Header Section)
- **Elements**:
  - Event Title (large header)
  - Type & Status badges
  - Date range (formatted)
  - Action buttons (based on role):
    - Admin/Staff: Edit, Delete
    - Students: Register (if applicable)
    - All: Share link

**`EventInfo`** (About Section)
- **Content**:
  - Description (rich text, preserve line breaks)
  - Event Type (display name)
  - Status (badge)
  - Duration (calculated from start/end dates)

**`EventVenues`** (Venues List)
- **Layout**: Card list
- **Per Venue**:
  - Venue Name (bold)
  - Capacity (with user icon)
  - Location (if available)

**`EventAgenda`** (Agenda Timeline)
- **Layout**: Vertical timeline
- **Per Item**:
  - Time slot (left side): "09:00 - 10:00"
  - Content card (right side):
    - Type icon (session/break/branding)
    - Details (description)
    - Color-coded by type:
      - Session: Blue
      - Break: Green
      - Branding Day: Purple

**API Integration**
```typescript
GET /events/:id
Response: { success: true, data: Event (with venues[] and agendas[]) }

DELETE /events/:id
Response: { success: true, data: Event }

PATCH /events/:id/restore
Response: { success: true, data: Event }
```

---

## 2. Reusable Components

### 2.1 EventTypeBadge
```typescript
interface EventTypeBadgeProps {
  type: EventType;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `internal`: Blue (#3b82f6)
- `external_hosted`: Purple (#8b5cf6)
- `job_fair`: Orange (#f97316)

### 2.2 EventStatusBadge
```typescript
interface EventStatusBadgeProps {
  status: EventStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `draft`: Gray (#64748b)
- `published`: Green (#22c55e)
- `archived`: Slate (#475569)

### 2.3 Timeline Component
```typescript
interface TimelineProps {
  items: {
    time: string;
    type: AgendaItemType;
    details: string;
  }[];
}
```

**UI**: Vertical line with colored dots, time on left, content on right

---

## 3. State Management

### Event List State
- Current page
- Type filter
- Status filter
- View mode (grid/table)

### Data Fetching
- Cache time: 5 minutes
- Invalidate on create/update/delete
- Preload events for dashboard

---

## 4. API Service Layer

**`src/api/events.api.ts`**
```typescript
export const eventsApi = {
  list: (params: { page?: number; limit?: number }) => 
    api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: CreateEventDto) => api.post('/events', data),
  update: (id: string, data: UpdateEventDto) => api.patch(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  restore: (id: string) => api.patch(`/events/${id}/restore`),
};
```

---

## 5. Features

### 5.1 Nested Event Creation
- Single API call creates event with venues and agendas
- Frontend collects all data in wizard steps
- Validation per step before proceeding

### 5.2 Date Validation
- End date must be after start date
- Custom refine in Zod schema
- Display clear error message

### 5.3 Time Validation
- Agenda times in HH:mm format (24-hour)
- End time must be after start time
- Regex validation in schema

### 5.4 Soft Delete & Restore
- Delete marks event as deleted (soft delete)
- Restore option for deleted events
- Audit trail preserved

### 5.5 Event Type-Specific Behavior
- **Internal**: ITI-only events
- **External Hosted**: Events at external venues
- **Job Fair**: Triggers job fair module (invitations, queues, interviews)

---

## 6. Error Handling

- **400 Validation**: Show field-level errors per step
- **404 Not Found**: "Event not found" with back link
- **Date Validation**: "End date must be after start date"
- **Network Errors**: Toast with retry

---

## 7. Styling Notes

### Event Card Grid
```css
.event-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .event-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .event-grid { grid-template-columns: 1fr; }
}
```

### Event Card
```css
.event-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.event-card-cover {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Timeline
```css
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -1.75rem;
  top: 0.5rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #3b82f6;
}
```

---

## 8. Testing Checklist

- [ ] Event list loads with pagination
- [ ] Type filter works correctly
- [ ] Status filter works correctly
- [ ] Create wizard validates all steps
- [ ] Nested venues/agendas save correctly
- [ ] Date validation prevents invalid ranges
- [ ] Time validation prevents invalid times
- [ ] Event detail shows all sections
- [ ] Agenda timeline renders correctly
- [ ] Venues display with capacity
- [ ] Edit wizard pre-fills all data
- [ ] Delete performs soft delete
- [ ] Restore reactivates deleted event
- [ ] Grid view is responsive
- [ ] Empty states display correctly

---

## 9. Dependencies

- React Hook Form + Zod (form validation)
- Date-fns (date formatting)
- Timeline component (custom or library)
- ConfirmDialog (delete confirmation)

---

## 10. Implementation Order

1. Event list page with API integration
2. Card grid view with filters
3. Table view alternative
4. Create wizard Step 1 (Basics)
5. Create wizard Step 2 (Venues)
6. Create wizard Step 3 (Agendas)
7. Event detail page
8. Agenda timeline component
9. Edit wizard with pre-fill
10. Delete & restore actions
11. Error handling & validation
12. Testing & responsive design
