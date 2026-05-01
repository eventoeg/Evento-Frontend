# Tracks Module - Detailed Implementation Guide

## Module Overview
The Tracks module manages academic tracks (e.g., Software Engineering, Cyber Security) used to group students.

---

## 1. Screens & Components

### 1.1 Track List Page (`/tracks`)

#### File Structure
```
src/pages/Tracks/
├── TrackList/
│   ├── index.tsx           # Page container
│   ├── TrackTable.tsx      # Data table
│   └── TrackCard.tsx       # Card view alternative
├── TrackForm/
│   ├── index.tsx           # Create/Edit page
│   ├── TrackFormFields.tsx
│   └── trackSchema.ts
├── TrackDetail/
│   ├── index.tsx           # Detail with students
│   ├── TrackInfo.tsx       # Track details display
│   └── StudentRoster.tsx   # Students in track
└── components/
    └── StudentCountBadge.tsx
```

#### Component Specification

**`TrackListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Academic Tracks" + "Create Track" button
  - Data table or card grid
  - Pagination controls
- **Access**: Admin, Staff only

**`TrackTable`** (Data Display)
- **Columns**:
  1. Track Name (bold, clickable)
  2. Description (truncated to 100 chars)
  3. Student Count (badge)
  4. Date Created
  5. Actions (View, Edit, Delete)

- **Features**:
  - Pagination: Server-side
  - Row click: Navigate to detail
  - Student count from eager-loaded students array

**API Integration**
```typescript
GET /tracks?page=1&limit=20
Response: {
  success: true,
  data: {
    items: Track[],  // Each includes students[]
    pagination: { ... }
  }
}
```

---

### 1.2 Track Create/Edit Form (`/tracks/new`, `/tracks/:id/edit`)

**`TrackFormPage`** (Form Container)
- **Layout**: Simple single-card form
- **Fields**:
  - Track Name (text, required)
  - Description (textarea, required, min 10 chars)

**Validation Schema**
```typescript
z.object({
  name: z.string().min(1, 'Track name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});
```

**API Integration**
```typescript
// Create
POST /tracks
Request: CreateTrackDto
Response: { success: true, data: Track }

// Update
PATCH /tracks/:id
Request: UpdateTrackDto
Response: { success: true, data: Track }
```

---

### 1.3 Track Detail Page (`/tracks/:id`)

**`TrackDetailPage`** (Detail View)
- **Layout**:
  - Header: Track name, edit/delete buttons
  - Info section: Description
  - Student roster table

**`TrackInfo`** (Details Display)
- **Fields**:
  - Track Name (large header)
  - Description (full text)
  - Date Created
  - Student Count (badge)

**`StudentRoster`** (Students in Track)
- **Layout**: Table within detail page
- **Columns**:
  1. Student Name (with avatar)
  2. Email (from linked user)
  3. Graduation Year
  4. Status (current/alumni)
  5. Actions (View Profile link)

- **Data Source**: `track.students` from GET response
- **Empty State**: "No students assigned to this track"

**API Integration**
```typescript
GET /tracks/:id
Response: { success: true, data: Track (with students[]) }

DELETE /tracks/:id
Response: { success: true, data: Track }
```

**Alternative API** (if track doesn't include students)
```typescript
GET /tracks/:id/students
Response: { success: true, data: Student[] }
```

---

## 2. Reusable Components

### 2.1 StudentCountBadge
```typescript
interface StudentCountBadgeProps {
  count: number;
  size?: 'sm' | 'md';
}
```

**UI**: Small badge showing student count, color-coded:
- 0 students: Gray
- 1-10 students: Blue
- 11+ students: Green

---

## 3. State Management

### Track List State
- Current page
- No filters needed (simple list)

### Data Fetching
- Cache time: 10 minutes (tracks change infrequently)
- Invalidate on create/update/delete
- Preload tracks for user registration form

---

## 4. API Service Layer

**`src/api/tracks.api.ts`**
```typescript
export const tracksApi = {
  list: (params: { page?: number; limit?: number }) => 
    api.get('/tracks', { params }),
  getById: (id: string) => api.get(`/tracks/${id}`),
  getStudents: (id: string) => api.get(`/tracks/${id}/students`),
  create: (data: CreateTrackDto) => api.post('/tracks', data),
  update: (id: string, data: UpdateTrackDto) => api.patch(`/tracks/${id}`, data),
  delete: (id: string) => api.delete(`/tracks/${id}`),
};
```

---

## 5. Features

### 5.1 Track-Student Relationship
- Tracks eagerly load students (per API docs)
- Student count visible on list page
- Clicking track shows full roster

### 5.2 Track Usage in Registration
- Tracks are required for student registration
- Dropdown populated from `GET /tracks`
- Cache track list to avoid repeated fetches

### 5.3 Delete Considerations
- Backend may prevent deletion if students are assigned
- Frontend should show warning: "Cannot delete track with enrolled students"
- Suggest reassigning students first

---

## 6. Error Handling

- **400 Validation**: Show field-level errors
- **404 Not Found**: "Track not found" with back link
- **409 Conflict**: "Cannot delete track with enrolled students"
- **Network Errors**: Toast with retry

---

## 7. Styling Notes

### Track Card (alternative view)
```css
.track-card {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.track-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
```

### Student Roster Table
```css
.student-roster {
  margin-top: 2rem;
}

.student-roster h3 {
  margin-bottom: 1rem;
  font-size: 1.125rem;
}
```

---

## 8. Testing Checklist

- [ ] Track list loads with pagination
- [ ] Create track validates all fields
- [ ] Edit track updates successfully
- [ ] Track detail shows student roster
- [ ] Student count displays correctly
- [ ] Delete track works (or shows error if students exist)
- [ ] Empty state shows when no students
- [ ] Form validation prevents invalid submissions
- [ ] Navigation between list and detail works

---

## 9. Dependencies

- React Hook Form + Zod (form validation)
- DataTable component
- StudentAvatar component

---

## 10. Implementation Order

1. Track list page with API integration
2. Data table with student count
3. Create/edit form
4. Track detail page
5. Student roster display
6. Delete handling
7. Error states & loading
8. Testing & polish
