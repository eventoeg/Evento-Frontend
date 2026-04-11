# Branding Speakers Module - Detailed Implementation Guide

## Module Overview
The Branding Speakers module manages speaker entries for event branding sessions, linking companies to events with speaker details.

---

## 1. Screens & Components

### 1.1 Branding Speakers List Page (`/branding-speakers`)

#### File Structure
```
src/pages/BrandingSpeakers/
├── SpeakerList/
│   ├── index.tsx           # Page container
│   ├── SpeakerTable.tsx    # Data table
│   └── SpeakerFilters.tsx  # Event & company filters
├── SpeakerForm/
│   ├── index.tsx           # Create/Edit page
│   ├── SpeakerFormFields.tsx
│   └── speakerSchema.ts
├── SpeakerDetail/
│   ├── index.tsx           # Detail view
│   └── SpeakerInfo.tsx     # Speaker details display
└── components/
    └── SpeakerCard.tsx
```

#### Component Specification

**`SpeakerListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Branding Speakers" + "Register Speaker" button
  - Filter bar: Event dropdown, Company dropdown
  - Data table with pagination
- **Access**:
  - Admin/Staff: All speakers
  - Company Rep: Only their company's speakers

**`SpeakerTable`** (Data Display)
- **Columns**:
  1. Speaker Name (bold, clickable)
  2. Title/Role
  3. Company Name (from eager-loaded relation)
  4. Event Name (from eager-loaded relation)
  5. Session Details (truncated to 100 chars)
  6. Actions (View, Edit, Delete)

- **Features**:
  - Event filter: Dropdown from `GET /events`
  - Company filter: Dropdown from `GET /companies`
  - Pagination: Server-side
  - Search: By speaker name (client-side)

**API Integration**
```typescript
GET /branding-speakers?page=1&limit=20&eventId=uuid&companyId=uuid
Response: {
  success: true,
  data: {
    items: BrandingSpeaker[],
    pagination: { ... }
  }
}
```

---

### 1.2 Branding Speaker Create/Edit Form (`/branding-speakers/new`, `/branding-speakers/:id/edit`)

**`SpeakerFormPage`** (Form Container)
- **Layout**: Single-column form with cards
- **Fields**:
  - Speaker Name (text, required)
  - Speaker Title/Role (text, required, e.g., "CTO at TechCorp")
  - Session Details (textarea, required, min 10 chars)
  - Company Select (dropdown, required)
    - Fetch from `GET /companies?status=approved`
    - Auto-select if user is company_rep
  - Event Select (dropdown, required)
    - Fetch from `GET /events`
    - Show upcoming events

**Validation Schema**
```typescript
z.object({
  speakerName: z.string().min(1, 'Speaker name is required'),
  speakerTitle: z.string().min(1, 'Speaker title is required'),
  sessionDetails: z.string().min(10, 'Session details must be at least 10 characters'),
  companyId: z.string().uuid('Invalid company ID'),
  eventId: z.string().uuid('Invalid event ID'),
});
```

**API Integration**
```typescript
// Create
POST /branding-speakers
Request: CreateBrandingSpeakerDto
Response: { success: true, data: BrandingSpeaker }

// Update
PATCH /branding-speakers/:id
Request: UpdateBrandingSpeakerDto
Response: { success: true, data: BrandingSpeaker }
```

---

### 1.3 Branding Speaker Detail Page (`/branding-speakers/:id`)

**`SpeakerDetailPage`** (Detail View)
- **Layout**:
  - Header: Speaker name, action buttons
  - Info sections in cards

**`SpeakerInfo`** (Details Display)
- **Sections**:
  1. **Speaker Profile**:
     - Speaker Name (large header)
     - Speaker Title/Role
     - Company Name (with link to company detail)
  2. **Session Details**:
     - Full description (rich text)
     - Linked Event (name, dates, with link)
  3. **Metadata**:
     - Date Created
     - Last Updated

**Actions** (based on role)
- **Admin/Staff/Company Rep**: [Edit] button
- **Admin/Staff**: [Delete] button (with confirmation)

**API Integration**
```typescript
GET /branding-speakers/:id
Response: { success: true, data: BrandingSpeaker (with company & event) }

DELETE /branding-speakers/:id
Response: { success: true, data: BrandingSpeaker }
```

---

## 2. Reusable Components

### 2.1 SpeakerCard (alternative to table)
```typescript
interface SpeakerCardProps {
  speaker: BrandingSpeaker;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**UI**: Card with speaker name, title, company badge, event badge, session preview

---

## 3. State Management

### Speaker List State
- Current page
- Event filter
- Company filter

### Data Fetching
- Cache time: 5 minutes
- Invalidate on create/update/delete
- Preload events and companies for form dropdowns

---

## 4. API Service Layer

**`src/api/brandingSpeakers.api.ts`**
```typescript
export const brandingSpeakersApi = {
  list: (params: { page?: number; limit?: number; eventId?: string; companyId?: string }) => 
    api.get('/branding-speakers', { params }),
  getById: (id: string) => api.get(`/branding-speakers/${id}`),
  create: (data: CreateBrandingSpeakerDto) => api.post('/branding-speakers', data),
  update: (id: string, data: UpdateBrandingSpeakerDto) => api.patch(`/branding-speakers/${id}`, data),
  delete: (id: string) => api.delete(`/branding-speakers/${id}`),
};
```

---

## 5. Features

### 5.1 Company-Event Linking
- Speakers are linked to both a company and an event
- Represents a speaker session at an event for company branding
- Both relations are required and validated

### 5.2 Role-Based Access
- **Company Rep**: Can only manage their company's speakers
- **Admin/Staff**: Can manage all speakers
- Auto-filter company dropdown for company_rep users

### 5.3 Event Association
- Speakers are tied to specific events
- Useful for filtering speakers by event
- Event detail page could show branding speakers

---

## 6. Error Handling

- **400 Validation**: Show field-level errors
- **404 Not Found**: "Speaker not found"
- **403 Forbidden**: "You don't have permission to manage this speaker"
- **Network Errors**: Toast with retry

---

## 7. Styling Notes

### Speaker Form Layout
```css
.speaker-form {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

### Speaker Card
```css
.speaker-card {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.speaker-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.speaker-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.speaker-title {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
```

---

## 8. Testing Checklist

- [ ] Speaker list loads with pagination
- [ ] Event filter works correctly
- [ ] Company filter works correctly
- [ ] Create speaker validates all fields
- [ ] Edit speaker updates successfully
- [ ] Speaker detail shows all sections
- [ ] Company and event links work
- [ ] Delete speaker works with confirmation
- [ ] Role-based filtering works
- [ ] Form validation prevents invalid submissions
- [ ] Empty states display correctly

---

## 9. Dependencies

- React Hook Form + Zod (form validation)
- ConfirmDialog (delete confirmation)
- DataTable component

---

## 10. Implementation Order

1. Speaker list page with API integration
2. Data table with filters
3. Create/edit form
4. Speaker detail page
5. Delete action
6. Role-based access control
7. Error handling & validation
8. Testing & polish
