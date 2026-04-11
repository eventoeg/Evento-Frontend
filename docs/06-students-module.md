# Students Module - Detailed Implementation Guide

## Module Overview
The Students module manages student profiles, track assignments, and provides the foundation for CV management and interview queue participation.

---

## 1. Screens & Components

### 1.1 Student List Page (`/students`)

#### File Structure
```
src/pages/Students/
├── StudentList/
│   ├── index.tsx           # Page container
│   ├── StudentTable.tsx    # Data table
│   └── StudentFilters.tsx  # Track & status filters
├── StudentDetail/
│   ├── index.tsx           # Detail view
│   ├── StudentProfile.tsx  # Student info display
│   └── StudentCVs.tsx      # CV list section
└── components/
    └── StudentStatusBadge.tsx
```

**Note**: Student creation is handled through User registration (`/users` with role=student).

#### Component Specification

**`StudentListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Student Management"
  - Filter bar: Track dropdown, Status dropdown, Search
  - Data table with pagination
- **Access**: Admin, Staff only

**`StudentTable`** (Data Display)
- **Columns**:
  1. Student Name (with avatar, from linked user)
  2. Email (from user)
  3. Track (track name)
  4. Graduation Year
  5. Status (current/alumni badge)
  6. CV Status (uploaded/not uploaded icon)
  7. Actions (View Profile link)

- **Features**:
  - Track filter: Dropdown from `GET /tracks`
  - Status filter: current, alumni
  - Search: By name or email
  - Pagination: Server-side

**API Integration**
```typescript
GET /users?role=student&page=1&limit=20
Response: {
  success: true,
  data: {
    items: User[],  // Each includes student{} relation
    pagination: { ... }
  }
}
```

**Note**: Students are accessed via `/users?role=student` since student is a role with linked profile.

---

### 1.2 Student Detail Page (`/students/:id`)

**Note**: The student ID here refers to the User ID (not the Student entity ID).

**`StudentDetailPage`** (Detail View)
- **Layout**:
  - Header: Student name, status badge, actions
  - Two-column grid:
    - Left (60%): Profile info, track details
    - Right (40%): CVs, queue participation

**`StudentProfile`** (Info Display)
- **Sections**:
  1. **Basic Info**:
     - Full Name
     - Email
     - Role badge (Student)
  2. **Academic Info**:
     - Track Name & Description
     - Graduation Year
     - Status (current/alumni)
  3. **Dates**:
     - Date Created
     - Last Updated

**`StudentCVs`** (CV Management)
- **Display**: List of uploaded CVs
- **Per CV**:
  - Title
  - Upload date
  - Primary badge (if isPrimary=true)
  - Download/View link
  - Delete button (if allowed)
- **Empty State**: "No CVs uploaded yet"
- **Action**: "Upload CV" button (links to CV upload page)

**API Integration**
```typescript
GET /users/:id
Response: { success: true, data: User (with student{} populated) }

GET /student-cvs?studentId=:id
Response: { success: true, data: { items: StudentCv[], pagination: {...} } }
```

---

## 2. Reusable Components

### 2.1 StudentStatusBadge
```typescript
interface StudentStatusBadgeProps {
  status: StudentStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `current`: Green (#22c55e)
- `alumni`: Gray (#64748b)

### 2.2 CVStatusIcon
```typescript
interface CVStatusIconProps {
  hasCV: boolean;
}
```

**UI**: 
- Has CV: Green checkmark
- No CV: Red X or warning icon

---

## 3. State Management

### Student List State
- Current page
- Active filters (track, status, search)

### Data Fetching
- Cache time: 5 minutes
- Invalidate on student updates
- Preload tracks for filter dropdown

---

## 4. API Service Layer

**`src/api/students.api.ts`**
```typescript
export const studentsApi = {
  list: (params: { page?: number; limit?: number; trackId?: string; status?: StudentStatus }) => 
    api.get('/users', { params: { ...params, role: 'student' } }),
  getById: (id: string) => api.get(`/users/${id}`),
  getCVs: (studentId: string, params?: { page?: number; limit?: number }) => 
    api.get('/student-cvs', { params: { ...params, studentId } }),
};
```

---

## 5. Features

### 5.1 Track Assignment
- Students are assigned to tracks during user creation
- Track can be changed via user edit (`PATCH /users/:id` with `trackId`)
- Frontend should validate track exists before submission

### 5.2 Student Status Management
- Status can be updated via `PATCH /users/:id`
- Useful for marking students as alumni after graduation
- Status change should be confirmed with dialog

### 5.3 CV Upload Link
- Student detail page links to CV upload functionality
- Only accessible by the student themselves or admins
- CV upload is handled in Student CVs module

---

## 6. Integration with Other Modules

### 6.1 Users Module
- Students are users with role='student'
- Edit student info via user edit form
- Student entity is auto-created on user creation with role=student

### 6.2 Tracks Module
- Each student belongs to one track (eager loaded)
- Track filter on student list
- Track detail page shows student roster

### 6.3 Student CVs Module
- CVs are linked to student entity
- Student detail shows CV list
- CV upload accessible from student profile

### 6.4 Interview Queues Module
- Students can join interview queues
- Queue entries reference student
- Student detail could show queue history

---

## 7. Error Handling

- **404 Not Found**: "Student not found"
- **403 Forbidden**: "You don't have permission to view students"
- **Network Errors**: Toast with retry
- **Empty States**: Friendly messages for no data

---

## 8. Styling Notes

### Student Profile Layout
```css
.student-profile {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .student-profile { grid-template-columns: 1fr; }
}
```

### Student Table Styles
```css
.student-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}
```

---

## 9. Testing Checklist

- [ ] Student list loads with pagination
- [ ] Track filter works correctly
- [ ] Status filter works correctly
- [ ] Search filters by name/email
- [ ] Student detail shows all profile info
- [ ] Track info displays correctly
- [ ] CV list shows uploaded CVs
- [ ] Empty state displays when no CVs
- [ ] Status badges show correct colors
- [ ] Navigation to CV upload works

---

## 10. Dependencies

- DataTable component
- StudentStatusBadge
- CVStatusIcon
- UserAvatar (from Users module)

---

## 11. Implementation Order

1. Student list page (via users API with role filter)
2. Data table with filters
3. Student detail page
4. Profile info display
5. CV list integration
6. Status management
7. Error handling & empty states
8. Testing & polish
