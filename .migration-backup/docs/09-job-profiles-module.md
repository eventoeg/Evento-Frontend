# Job Profiles Module - Detailed Implementation Guide

## Module Overview
The Job Profiles module manages company job postings linked to events and companies, driving the queueing and interview workflow for job fairs.

---

## 1. Screens & Components

### 1.1 Job Profiles List Page (`/job-profiles`)

#### File Structure
```
src/pages/JobProfiles/
├── JobProfileList/
│   ├── index.tsx           # Page container
│   ├── JobProfileGrid.tsx  # Card grid view
│   ├── JobProfileTable.tsx # Table view
│   └── JobProfileFilters.tsx # Event & company filters
├── JobProfileForm/
│   ├── index.tsx           # Create/Edit page
│   ├── JobProfileFormFields.tsx
│   └── jobProfileSchema.ts
├── JobProfileDetail/
│   ├── index.tsx           # Detail view
│   ├── JobProfileInfo.tsx  # Job details display
│   └── JobProfileQueue.tsx # Queue preview
└── components/
    ├── InterviewTypeBadge.tsx
    └── ApprovalBadge.tsx
```

#### Component Specification

**`JobProfileListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Job Profiles" + "Create Job Profile" button
  - Filter bar: Event dropdown, Company dropdown
  - Card grid or table toggle
  - Pagination controls
- **Access**: 
  - Admin/Staff: All job profiles
  - Company Rep: Only their company's profiles
  - Student: All approved profiles (read-only)

**`JobProfileGrid`** (Card Display)
- **Layout**: Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- **Card Structure**:
  - Company Logo placeholder (top)
  - Company Name (small text)
  - Job Title (bold, large)
  - Required Positions (badge: "X positions")
  - Interview Type (badge: HR/Technical/Both)
  - Approval Status (small badge: Approved/Pending)
  - Footer: 
    - Students: "View Details" + "Join Queue" (if approved)
    - Company Rep: "View Details" + "Edit"
    - Admin: "View Details" + "Approve" (if not approved)

**API Integration**
```typescript
GET /job-profiles?page=1&limit=20&eventId=uuid&companyId=uuid
Response: {
  success: true,
  data: {
    items: JobProfile[],
    pagination: { ... }
  }
}
```

---

### 1.2 Job Profile Create/Edit Form (`/job-profiles/new`, `/job-profiles/:id/edit`)

**`JobProfileFormPage`** (Form Container)
- **Layout**: Single-column form with cards
- **Fields**:
  - Job Title (text, required)
  - Job Description (textarea, required, min 10 chars)
  - Required Positions (number, min 1, required)
  - Interview Type (dropdown, required)
    - Options: hr, technical, both
  - Company Select (dropdown, required)
    - Fetch from `GET /companies?status=approved`
    - Auto-select if user is company_rep
  - Event Select (dropdown, required)
    - Fetch from `GET /events`
    - Show upcoming events

**Validation Schema**
```typescript
z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().min(10, 'Description must be at least 10 characters'),
  requiredPositions: z.number().int().min(1, 'At least 1 position required'),
  interviewType: z.enum(['hr', 'technical', 'both']),
  companyId: z.string().uuid('Invalid company ID'),
  eventId: z.string().uuid('Invalid event ID'),
});
```

**API Integration**
```typescript
// Create
POST /job-profiles
Request: CreateJobProfileDto
Response: { success: true, data: JobProfile }

// Update
PATCH /job-profiles/:id
Request: UpdateJobProfileDto
Response: { success: true, data: JobProfile }
```

---

### 1.3 Job Profile Detail Page (`/job-profiles/:id`)

**`JobProfileDetailPage`** (Detail View)
- **Layout**:
  - Header: Job title, company name, action buttons
  - Two-column grid:
    - Left (60%): Job details, requirements
    - Right (40%): Queue status, interview info

**`JobProfileInfo`** (Details Display)
- **Sections**:
  1. **Header**:
     - Company Logo & Name
     - Job Title (large)
     - Approval badge (if approved)
  2. **Job Details**:
     - Description (rich text)
     - Required Positions (number)
     - Interview Type (badge)
  3. **Linked Entities**:
     - Event Name & Dates (with link)
     - Company Name & Location (with link)

**`JobProfileQueue`** (Queue Preview)
- **Display**: Summary of queue for this job profile
- **Elements**:
  - Total students in queue
  - Current position (if student is in queue)
  - Status breakdown:
    - Waiting: X
    - In Progress: X
    - Completed: X
  - Action: "View Full Queue" button (links to `/queues/job-profile/:id`)

**Actions** (based on role & status)
- **If Not Approved** (admin/staff): [Approve] button (green)
- **If Approved** (student): [Join Queue] button (navy)
- **If In Queue** (student): [View My Position] button
- **Company Rep**: [Edit] button

**API Integration**
```typescript
GET /job-profiles/:id
Response: { success: true, data: JobProfile (with company & event) }

PATCH /job-profiles/:id/approve
Response: { success: true, data: JobProfile (isApproved: true) }

DELETE /job-profiles/:id
Response: { success: true, data: JobProfile }
```

---

## 2. Reusable Components

### 2.1 InterviewTypeBadge
```typescript
interface InterviewTypeBadgeProps {
  type: InterviewType;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `hr`: Blue (#3b82f6)
- `technical`: Purple (#8b5cf6)
- `both`: Orange (#f97316)

### 2.2 ApprovalBadge
```typescript
interface ApprovalBadgeProps {
  isApproved: boolean;
  size?: 'sm' | 'md';
}
```

**UI**:
- Approved: Green checkmark + "Approved"
- Pending: Yellow clock + "Pending Approval"

---

## 3. State Management

### Job Profile List State
- Current page
- Event filter
- Company filter
- View mode (grid/table)

### Data Fetching
- Cache time: 5 minutes
- Invalidate on create/update/approve/delete
- Preload for student dashboard

---

## 4. API Service Layer

**`src/api/jobProfiles.api.ts`**
```typescript
export const jobProfilesApi = {
  list: (params: { page?: number; limit?: number; eventId?: string; companyId?: string }) => 
    api.get('/job-profiles', { params }),
  getById: (id: string) => api.get(`/job-profiles/${id}`),
  create: (data: CreateJobProfileDto) => api.post('/job-profiles', data),
  update: (id: string, data: UpdateJobProfileDto) => api.patch(`/job-profiles/${id}`, data),
  approve: (id: string) => api.patch(`/job-profiles/${id}/approve`),
  delete: (id: string) => api.delete(`/job-profiles/${id}`),
  getQueue: (id: string) => api.get('/queues', { params: { jobProfileId: id } }),
};
```

---

## 5. Features

### 5.1 Approval Workflow
- Job profiles start as unapproved (`isApproved: false`)
- Admin/staff can approve via `PATCH /job-profiles/:id/approve`
- Students can only join queues for approved profiles
- Frontend should disable "Join Queue" button if not approved

### 5.2 Role-Based Filtering
- **Company Rep**: Auto-filter to their company's profiles
- **Student**: Show only approved profiles (optional filter)
- **Admin/Staff**: Show all profiles

### 5.3 Queue Integration
- Job profiles link to their interview queues
- Queue preview on detail page
- "Join Queue" button for students (triggers queue creation)

### 5.4 Event Linking
- Job profiles are tied to specific events
- Event dropdown filtered to upcoming/published events
- Event detail page could show linked job profiles

---

## 6. Error Handling

- **400 Validation**: Show field-level errors
- **404 Not Found**: "Job profile not found"
- **403 Forbidden**: "You don't have permission to manage this job profile"
- **Network Errors**: Toast with retry
- **Approval State**: "Cannot join queue for unapproved job profile"

---

## 7. Styling Notes

### Job Profile Card
```css
.job-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.job-company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Job Detail Layout
```css
.job-detail {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .job-detail { grid-template-columns: 1fr; }
}
```

---

## 8. Testing Checklist

- [ ] Job profile list loads with pagination
- [ ] Event filter works correctly
- [ ] Company filter works correctly
- [ ] Create job profile validates all fields
- [ ] Edit job profile updates successfully
- [ ] Approval changes isApproved status
- [ ] Job detail shows all sections
- [ ] Queue preview displays correct counts
- [ ] Join Queue button visible to students
- [ ] Approve button visible to admin/staff
- [ ] Role-based filtering works
- [ ] Grid view is responsive
- [ ] Empty states display correctly

---

## 9. Dependencies

- React Hook Form + Zod (form validation)
- InterviewTypeBadge component
- ApprovalBadge component
- ConfirmDialog (approve confirmation)

---

## 10. Implementation Order

1. Job profile list page with API integration
2. Card grid view with filters
3. Create/edit form
4. Job profile detail page
5. Approval workflow
6. Queue preview integration
7. Role-based access control
8. Error handling & validation
9. Testing & responsive design
