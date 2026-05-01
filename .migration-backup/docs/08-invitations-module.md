# Invitations Module - Detailed Implementation Guide

## Module Overview
The Invitations module manages the company invitation lifecycle, including sending invitations to companies for events, and handling accept/reject workflows via public token-based links.

---

## 1. Screens & Components

### 1.1 Invitation List Page (`/invitations`)

#### File Structure
```
src/pages/Invitations/
├── InvitationList/
│   ├── index.tsx           # Page container
│   ├── InvitationTable.tsx # Data table
│   └── InvitationFilters.tsx # Event filter
├── InvitationForm/
│   ├── index.tsx           # Create invitation page
│   ├── InvitationFormFields.tsx
│   └── invitationSchema.ts
├── InvitationDetail/
│   ├── index.tsx           # Detail view
│   └── InvitationInfo.tsx  # Invitation details
├── PublicAccept/
│   ├── index.tsx           # /invitations/accept/:token
│   └── AcceptConfirmation.tsx
├── PublicReject/
│   ├── index.tsx           # /invitations/reject/:token
│   └── RejectConfirmation.tsx
└── components/
    └── InvitationStatusBadge.tsx
```

#### Component Specification

**`InvitationListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Company Invitations" + "Send Invitation" button
  - Filter: Event dropdown (show invitations for specific event)
  - Data table with pagination
- **Access**: Admin, Staff only

**`InvitationTable`** (Data Display)
- **Columns**:
  1. Company Name (from eager-loaded company relation)
  2. Event Name (from eager-loaded event relation)
  3. Status (colored badge: pending/accepted/rejected)
  4. Date Sent (formatted)
  5. Actions (View, Delete, Resend)

- **Features**:
  - Event filter: Dropdown from `GET /events`
  - Pagination: Server-side
  - Status badge with color coding

**API Integration**
```typescript
GET /invitations?page=1&limit=20&eventId=uuid
Response: {
  success: true,
  data: {
    items: CompanyInvitation[],
    pagination: { ... }
  }
}
```

---

### 1.2 Create Invitation Form (`/invitations/new`)

**`InvitationFormPage`** (Form Container)
- **Layout**: Simple form card
- **Fields**:
  - Company Select (autocomplete/search, required)
    - Fetch from `GET /companies?status=approved`
    - Search by company name
    - Only show approved companies
  - Event Select (dropdown, required)
    - Fetch from `GET /events`
    - Show event title and date

**Validation Schema**
```typescript
z.object({
  companyId: z.string().uuid('Invalid company ID'),
  eventId: z.string().uuid('Invalid event ID'),
});
```

**API Integration**
```typescript
POST /invitations
Request: CreateCompanyInvitationDto
Response: { success: true, data: CompanyInvitation }
```

**Post-Creation**
- Show success toast
- Display invitation token (copyable)
- Option to copy invitation link: `/invitations/accept/:token`
- Redirect to invitation list

---

### 1.3 Invitation Detail Page (`/invitations/:id`)

**`InvitationDetailPage`** (Detail View)
- **Layout**:
  - Header: Company name, Event name, status badge
  - Info sections

**`InvitationInfo`** (Details Display)
- **Fields**:
  - Company Name (with link to company detail)
  - Event Name (with link to event detail)
  - Status (colored badge)
  - Invitation Token (monospace, copyable)
  - Date Created (formatted)
  - Public Links:
    - Accept: `http://localhost:5173/invitations/accept/:token`
    - Reject: `http://localhost:5173/invitations/reject/:token`

**Actions** (based on status)
- **If Pending**: Resend invitation link
- **Always**: Delete button (with confirmation)

**API Integration**
```typescript
GET /invitations/:id
Response: { success: true, data: CompanyInvitation }

GET /invitations/token/:token
Response: { success: true, data: CompanyInvitation }

DELETE /invitations/:id
Response: { success: true, data: CompanyInvitation }
```

---

### 1.4 Public Accept Page (`/invitations/accept/:token`)

**`AcceptInvitationPage`** (Public Page)
- **Layout**: Centered card, no auth required
- **Elements**:
  - Logo/Branding
  - Invitation Details:
    - Company Name
    - Event Name
    - Event Dates
  - Confirmation Message: "You have been invited to [Event Title]"
  - Action: "Accept Invitation" button (green)
  - Alternative: "Decline" link (redirects to reject page)

**`AcceptConfirmation`**
- **On Accept**:
  - Call `POST /invitations/accept/:token`
  - Show success state: "Invitation accepted! We look forward to seeing you at [Event]."
  - Display event details
  - No further action needed

**API Integration**
```typescript
POST /invitations/accept/:token
Response: { success: true, data: CompanyInvitation (status: accepted) }
```

---

### 1.5 Public Reject Page (`/invitations/reject/:token`)

**`RejectInvitationPage`** (Public Page)
- **Layout**: Centered card, no auth required
- **Elements**:
  - Invitation Details (same as accept page)
  - Confirmation Message: "You have been invited to [Event Title]"
  - Optional: Reason for rejection (textarea, optional)
  - Action: "Decline Invitation" button (red)
  - Alternative: "Accept" link (redirects to accept page)

**`RejectConfirmation`**
- **On Reject**:
  - Call `POST /invitations/reject/:token`
  - Show success state: "Invitation declined. Thank you for your response."
  - No further action needed

**API Integration**
```typescript
POST /invitations/reject/:token
Response: { success: true, data: CompanyInvitation (status: rejected) }
```

---

## 2. Reusable Components

### 2.1 InvitationStatusBadge
```typescript
interface InvitationStatusBadgeProps {
  status: CompanyInvitationStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `accepted`: Green (#22c55e) with checkmark
- `pending`: Yellow (#f59e0b) with clock
- `rejected`: Red (#ef4444) with X

### 2.2 TokenDisplay
```typescript
interface TokenDisplayProps {
  token: string;
  onCopy: () => void;
}
```

**UI**: Monospace text with copy button icon

---

## 3. State Management

### Invitation List State
- Current page
- Event filter

### Data Fetching
- Cache time: 5 minutes
- Invalidate on create/delete/accept/reject
- Preload events and companies for form dropdowns

---

## 4. API Service Layer

**`src/api/invitations.api.ts`**
```typescript
export const invitationsApi = {
  list: (params: { page?: number; limit?: number; eventId?: string }) => 
    api.get('/invitations', { params }),
  getById: (id: string) => api.get(`/invitations/${id}`),
  getByToken: (token: string) => api.get(`/invitations/token/${token}`),
  create: (data: CreateCompanyInvitationDto) => api.post('/invitations', data),
  update: (id: string, data: UpdateCompanyInvitationDto) => api.patch(`/invitations/${id}`, data),
  accept: (token: string) => api.post(`/invitations/accept/${token}`),
  reject: (token: string) => api.post(`/invitations/reject/${token}`),
  delete: (id: string) => api.delete(`/invitations/${id}`),
};
```

---

## 5. Features

### 5.1 Token-Based Public Access
- Invitation links are public (no auth required)
- Token is unique and URL-safe
- Used for accept/reject flows

### 5.2 Invitation Workflow
1. Admin/staff creates invitation (company + event)
2. Backend generates unique token
3. Frontend displays public links
4. Company receives link (via email or direct sharing)
5. Company accepts or rejects via public page
6. Status updates in system

### 5.3 Company Filtering
- Only approved companies can be invited
- Filter dropdown: `GET /companies?status=approved`
- Prevents inviting pending/rejected companies

### 5.4 Duplicate Prevention
- Backend may prevent duplicate invitations (same company + event)
- Frontend should show error: "Company already invited to this event"

---

## 6. Error Handling

- **400 Validation**: Show field-level errors
- **404 Not Found**: "Invitation not found" (invalid token)
- **409 Conflict**: "Company already invited to this event"
- **Network Errors**: Toast with retry
- **Invalid Token**: Show "Invalid or expired invitation link"

---

## 7. Styling Notes

### Public Invitation Page
```css
.public-invitation {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.public-invitation-card {
  max-width: 600px;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Invitation Table
```css
.invitation-token {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
```

---

## 8. Testing Checklist

- [ ] Invitation list loads with pagination
- [ ] Event filter works correctly
- [ ] Create invitation validates fields
- [ ] Only approved companies shown in dropdown
- [ ] Invitation detail shows all info
- [ ] Token is copyable
- [ ] Public accept page loads without auth
- [ ] Accept invitation updates status
- [ ] Public reject page loads without auth
- [ ] Reject invitation updates status
- [ ] Duplicate invitation shows error
- [ ] Invalid token shows error message
- [ ] Delete invitation works

---

## 9. Dependencies

- React Hook Form + Zod (form validation)
- React Router (public routes)
- Clipboard API (copy token)
- ConfirmDialog (delete confirmation)

---

## 10. Implementation Order

1. Invitation list page with API integration
2. Data table with event filter
3. Create invitation form
4. Invitation detail page
5. Public accept page
6. Public reject page
7. Token display & copy functionality
8. Error handling (duplicates, invalid tokens)
9. Status badge component
10. Testing & polish
