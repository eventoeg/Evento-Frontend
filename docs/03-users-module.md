# Users Module - Detailed Implementation Guide

## Module Overview
The Users module provides CRUD operations for system users (admin/staff/students/company reps/security) with role-based access control.

---

## 1. Screens & Components

### 1.1 User List Page (`/users`)

#### File Structure
```
src/pages/Users/
├── UserList/
│   ├── index.tsx           # Page container
│   ├── UserTable.tsx       # Data table component
│   ├── UserFilters.tsx     # Search & filter bar
│   └── UserActions.tsx     # Bulk actions (if any)
├── UserForm/
│   ├── index.tsx           # Create/Edit page
│   ├── UserFormFields.tsx  # Form fields component
│   └── userSchema.ts       # Validation schema
├── UserDetail/
│   ├── index.tsx           # Detail view
│   ├── UserInfo.tsx        # User profile display
│   └── UserRelations.tsx   # Linked entities (track/company)
└── components/
    └── RoleBadge.tsx       # Role color badge
```

#### Component Specification

**`UserListPage`** (Page Container)
- **Layout**:
  - PageHeader: "User Management" + "Create User" button
  - Filter bar: Role dropdown, Search input
  - Data table with pagination
- **Access**: Admin, Staff only

**`UserTable`** (Data Display)
- **Columns**:
  1. Name (with avatar/initials)
  2. Email
  3. Role (colored badge)
  4. Date Joined (formatted)
  5. Status (Active/Deleted)
  6. Actions (Edit, View, Deactivate)

- **Features**:
  - Sorting: Name, Date
  - Pagination: Server-side via API
  - Row click: Navigate to detail page
  - Loading state: Skeleton table

**API Integration**
```typescript
GET /users?page=1&limit=20&role=student
Response: {
  success: true,
  data: {
    items: User[],
    pagination: { total, page, limit, totalPages, hasNextPage, hasPreviousPage }
  }
}
```

---

### 1.2 User Create/Edit Form (`/users/new`, `/users/:id/edit`)

**`UserFormPage`** (Form Container)
- **Layout**: 
  - Create: Blank form with submit
  - Edit: Pre-filled form with current data
- **Sections**:
  1. Basic Info (name, email)
  2. Role & Access
  3. Role-Specific Fields

**`UserFormFields`**
- **Always Shown**:
  - First Name (text, required)
  - Last Name (text, required)
  - Email (email, required)
  - Password (password, required on create, optional on edit)

- **Role Dropdown** (required):
  - Options: admin, staff, student, security, company_rep
  - Changes form fields dynamically

- **Conditional Fields**:
  - **If Student**:
    - Track Select (dropdown from `GET /tracks`)
    - Graduation Year (number)
  - **If Company Rep**:
    - Company Select (dropdown from `GET /companies`)

**Validation Schema**
```typescript
z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'staff', 'student', 'security', 'company_rep']),
  trackId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  graduationYear: z.number().int().optional(),
}).refine((data) => {
  if (data.role === 'student') return !!data.trackId;
  return true;
}, { path: ['trackId'], message: 'Track is required for students' })
.refine((data) => {
  if (data.role === 'company_rep') return !!data.companyId;
  return true;
}, { path: ['companyId'], message: 'Company is required for company reps' });
```

**API Integration**
```typescript
// Create
POST /users
Request: CreateUserDto
Response: { success: true, data: User }

// Update
PATCH /users/:id
Request: UpdateUserDto (partial)
Response: { success: true, data: User }
```

---

### 1.3 User Detail Page (`/users/:id`)

**`UserDetailPage`** (Detail View)
- **Layout**:
  - Header: Name, role badge, edit/delete buttons
  - Info sections in card layout
  - Related entities section

**`UserInfo`** (Profile Display)
- **Fields**:
  - Full Name
  - Email
  - Role (badge)
  - Date Created
  - Status (Active/Deleted)

**`UserRelations`** (Linked Entities)
- **For Students**:
  - Track name & description
  - Graduation year
  - List of CVs (if any)
  - Interview queue entries
- **For Company Reps**:
  - Company name & status
  - Company location
  - List of job profiles
  - Branding speaker entries

**API Integration**
```typescript
GET /users/:id
Response: { success: true, data: User (with relations) }

DELETE /users/:id
Response: { success: true, data: User }

PATCH /users/:id/restore
Response: { success: true, data: User }
```

---

## 2. Reusable Components

### 2.1 RoleBadge
```typescript
interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `admin`: Purple (#8b5cf6)
- `staff`: Blue (#3b82f6)
- `student`: Green (#22c55e)
- `security`: Gray (#64748b)
- `company_rep`: Orange (#f97316)

### 2.2 UserAvatar
```typescript
interface UserAvatarProps {
  firstName: string;
  lastName: string;
  size?: number;
  avatarUrl?: string;
}
```

**UI**: Circle with initials or image, fallback to initials

---

## 3. State Management

### User List State
- Current page
- Active filters (role, search)
- Selected users (for bulk actions)

### Data Fetching
- Use RTK Query or React Query
- Invalidate list on create/update/delete
- Cache time: 2 minutes

---

## 4. API Service Layer

**`src/api/users.api.ts`**
```typescript
export const usersApi = {
  list: (params: { page?: number; limit?: number; role?: UserRole }) => 
    api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  getByEmail: (email: string) => api.get(`/users/email/${email}`),
  create: (data: CreateUserDto) => api.post('/users', data),
  update: (id: string, data: UpdateUserDto) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  restore: (id: string) => api.patch(`/users/${id}/restore`),
};
```

---

## 5. Features

### 5.1 Search & Filter
- **Search**: By name or email (client-side filtering on list)
- **Role Filter**: Dropdown with all roles
- **Status Filter**: Active/Deleted toggle

### 5.2 Soft Delete & Restore
- **Delete**: Marks user as deleted (soft delete)
- **Restore**: Re-activate deleted user
- **UI**: Show "Restore" button on deleted user detail page

### 5.3 Duplicate Email Prevention
- Backend returns `409 Conflict` on duplicate email
- Frontend should display error: "Email already exists"

---

## 6. Error Handling

- **409 Conflict**: "A user with this email already exists"
- **400 Validation**: Show field-level errors
- **403 Forbidden**: Show "You don't have permission to manage users"
- **404 Not Found**: "User not found" with link back to list

---

## 7. Styling Notes

### Table Layout
```css
.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
}

.user-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}
```

### Form Layout
```css
.user-form {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

---

## 8. Testing Checklist

- [ ] User list loads with pagination
- [ ] Role filter works correctly
- [ ] Search filters users by name/email
- [ ] Create user with student role requires track
- [ ] Create user with company rep role requires company
- [ ] Edit user updates successfully
- [ ] Delete user performs soft delete
- [ ] Restore user reactivates account
- [ ] Duplicate email shows error
- [ ] Role badges display correct colors
- [ ] Detail page shows related entities
- [ ] Delete confirmation dialog works
- [ ] Form validation prevents invalid submissions

---

## 9. Dependencies

- React Hook Form + Zod (form validation)
- React Router (navigation)
- DataTable component (custom or library)
- ConfirmDialog (modal for delete)

---

## 10. Implementation Order

1. User list page with API integration
2. Data table with pagination
3. Role badge component
4. Search & filter functionality
5. Create user form with validation
6. Edit user form with pre-fill
7. User detail page with relations
8. Soft delete & restore actions
9. Error handling & edge cases
10. Testing & polish
