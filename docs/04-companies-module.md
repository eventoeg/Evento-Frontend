# Companies Module - Detailed Implementation Guide

## Module Overview
The Companies module manages company profiles, including registration, approval workflow, and status management.

---

## 1. Screens & Components

### 1.1 Company List Page (`/companies`)

#### File Structure
```
src/pages/Companies/
├── CompanyList/
│   ├── index.tsx           # Page container
│   ├── CompanyTable.tsx    # Data table
│   └── CompanyFilters.tsx  # Status filter
├── CompanyForm/
│   ├── index.tsx           # Create/Edit page
│   ├── CompanyFormFields.tsx
│   └── companySchema.ts
├── CompanyDetail/
│   ├── index.tsx           # Detail view
│   ├── CompanyInfo.tsx     # Company profile display
│   └── CompanyRelations.tsx # Job profiles, speakers, invitations
└── components/
    └── StatusBadge.tsx     # Company status badge
```

#### Component Specification

**`CompanyListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Company Management" + "Register Company" button
  - Filter bar: Status dropdown (All, Approved, Pending, Rejected)
  - Data table with pagination
- **Access**: Admin, Staff only

**`CompanyTable`** (Data Display)
- **Columns**:
  1. Company Name (bold, clickable)
  2. Location
  3. Status (colored badge)
  4. Date Created
  5. Actions (View, Edit, Approve/Reject, Delete)

- **Features**:
  - Status filter in query params
  - Pagination: Server-side
  - Row actions depend on current status
  - Loading state: Skeleton rows

**API Integration**
```typescript
GET /companies?page=1&limit=20&status=pending
Response: {
  success: true,
  data: {
    items: Company[],
    pagination: { ... }
  }
}
```

---

### 1.2 Company Create/Edit Form (`/companies/new`, `/companies/:id/edit`)

**`CompanyFormPage`** (Form Container)
- **Layout**: Single-column form with cards
- **Sections**:
  1. Company Details

**`CompanyFormFields`**
- **Fields**:
  - Company Name (text, required)
  - Location (text, required)
  - Description (textarea, required, min 10 chars)
  - Status (dropdown, default: 'pending')
    - Options: pending, approved, rejected

**Validation Schema**
```typescript
z.object({
  companyName: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});
```

**API Integration**
```typescript
// Create
POST /companies
Request: CreateCompanyDto
Response: { success: true, data: Company }

// Update
PATCH /companies/:id
Request: UpdateCompanyDto
Response: { success: true, data: Company }
```

---

### 1.3 Company Detail Page (`/companies/:id`)

**`CompanyDetailPage`** (Detail View)
- **Layout**:
  - Header: Company name, status badge, action buttons
  - Info cards in grid
  - Related entities section

**`CompanyInfo`** (Profile Display)
- **Fields**:
  - Company Name (large header)
  - Location (with map pin icon)
  - Description (rich text)
  - Status (colored badge)
  - Date Created

**`CompanyRelations`** (Linked Entities)
- **Sections** (if data available):
  1. **Company Representatives** (users with role=company_rep)
     - List of users linked to this company
  2. **Job Profiles**
     - Table of job profiles created by this company
     - Link to `/job-profiles?companyId=:id`
  3. **Branding Speakers**
     - List of speakers for this company
     - Link to `/branding-speakers?companyId=:id`
  4. **Invitations**
     - Event invitations sent to this company
     - Status of each invitation

**Action Buttons** (based on status)
- **If Pending**: [Approve] (green), [Reject] (red outline)
- **If Approved/Rejected**: [Edit] (blue)
- **Always**: [Delete] (red, with confirmation)

**API Integration**
```typescript
GET /companies/:id
Response: { success: true, data: Company (with relations) }

PATCH /companies/:id/approve
Response: { success: true, data: Company }

PATCH /companies/:id/reject
Response: { success: true, data: Company }

DELETE /companies/:id
Response: { success: true, data: Company }

PATCH /companies/:id/restore
Response: { success: true, data: Company }
```

---

## 2. Reusable Components

### 2.1 CompanyStatusBadge
```typescript
interface CompanyStatusBadgeProps {
  status: CompanyStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `approved`: Green (#22c55e) with checkmark icon
- `pending`: Yellow (#f59e0b) with clock icon
- `rejected`: Red (#ef4444) with X icon

### 2.2 CompanyCard (for list view)
```typescript
interface CompanyCardProps {
  company: Company;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView: (id: string) => void;
}
```

---

## 3. Approval Workflow

### 3.1 Approve Company
- **Trigger**: Click "Approve" button on detail page or list action
- **Confirmation**: Dialog "Are you sure you want to approve [Company Name]?"
- **API**: `PATCH /companies/:id/approve`
- **On Success**: 
  - Update status to 'approved'
  - Show success toast
  - Refetch company data
  - Invalidate company list cache

### 3.2 Reject Company
- **Trigger**: Click "Reject" button
- **Confirmation**: Dialog "Are you sure you want to reject [Company Name]? This action can be undone."
- **API**: `PATCH /companies/:id/reject`
- **On Success**: 
  - Update status to 'rejected'
  - Show warning toast
  - Refetch data

---

## 4. State Management

### Company List State
- Current page
- Status filter
- Search query (if implemented)

### Data Fetching
- Cache time: 5 minutes
- Invalidate on create/update/approve/reject/delete
- Optimistic updates for approve/reject actions

---

## 5. API Service Layer

**`src/api/companies.api.ts`**
```typescript
export const companiesApi = {
  list: (params: { page?: number; limit?: number; status?: CompanyStatus }) => 
    api.get('/companies', { params }),
  getById: (id: string) => api.get(`/companies/${id}`),
  create: (data: CreateCompanyDto) => api.post('/companies', data),
  update: (id: string, data: UpdateCompanyDto) => api.patch(`/companies/${id}`, data),
  approve: (id: string) => api.patch(`/companies/${id}/approve`),
  reject: (id: string) => api.patch(`/companies/${id}/reject`),
  delete: (id: string) => api.delete(`/companies/${id}`),
  restore: (id: string) => api.patch(`/companies/${id}/restore`),
};
```

---

## 6. Features

### 6.1 Status Filtering
- Filter companies by approval status
- Useful for admin queue: `/companies?status=pending`
- Visual indicator on filter count

### 6.2 Soft Delete & Restore
- Delete keeps company in database (soft delete)
- Restore option available on deleted companies
- Audit trail preserved

### 6.3 Company Search
- Search by company name or location
- Client-side or server-side (depends on backend support)

---

## 7. Error Handling

- **400 Validation**: Show field-level errors
- **404 Not Found**: "Company not found" with back to list link
- **403 Forbidden**: "You don't have permission to manage companies"
- **Network Errors**: Toast notification with retry option

---

## 8. Styling Notes

### Company Card Layout
```css
.company-card {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.company-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Status Badge Colors
```css
.status-approved { background: #dcfce7; color: #166534; }
.status-pending { background: #fef9c3; color: #854d0e; }
.status-rejected { background: #fee2e2; color: #991b1b; }
```

---

## 9. Testing Checklist

- [ ] Company list loads with pagination
- [ ] Status filter works correctly
- [ ] Create company validates all fields
- [ ] Edit company updates successfully
- [ ] Approve company changes status to approved
- [ ] Reject company changes status to rejected
- [ ] Delete performs soft delete
- [ ] Restore reactivates deleted company
- [ ] Detail page shows related entities
- [ ] Confirmation dialogs work correctly
- [ ] Success/error toasts display
- [ ] Form validation prevents invalid submissions
- [ ] Status badges show correct colors

---

## 10. Dependencies

- React Hook Form + Zod (form validation)
- ConfirmDialog (approval/rejection confirmation)
- StatusBadge component
- DataTable component

---

## 11. Implementation Order

1. Company list page with API integration
2. Data table with pagination & status filter
3. Status badge component
4. Create company form
5. Edit company form
6. Company detail page
7. Approve/reject workflow
8. Soft delete & restore actions
9. Related entities display
10. Error handling & testing
