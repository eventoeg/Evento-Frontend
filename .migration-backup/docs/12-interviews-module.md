# Interviews Module - Detailed Implementation Guide

## Module Overview
The Interviews module manages interview execution and results, including starting interviews from queues, recording outcomes, and providing feedback forms.

---

## 1. Screens & Components

### 1.1 Interviews List Page (`/interviews`)

#### File Structure
```
src/pages/Interviews/
├── InterviewList/
│   ├── index.tsx           # Page container
│   ├── InterviewTable.tsx  # Data table
│   └── InterviewFilters.tsx # Date & status filters
├── InterviewForm/
│   ├── index.tsx           # Start interview page
│   └── interviewSchema.ts
├── InterviewDetail/
│   ├── index.tsx           # Detail view
│   ├── InterviewInfo.tsx   # Interview details
│   └── FeedbackForm.tsx    # Results entry form
└── components/
    └── InterviewResultBadge.tsx
```

#### Component Specification

**`InterviewListPage`** (Page Container)
- **Layout**:
  - PageHeader: "Interviews"
  - Filter bar: Date range, Result filter
  - Data table with pagination
- **Access**: Company Rep (own interviews), Admin/Staff (all)

**`InterviewTable`** (Data Display)
- **Columns**:
  1. Student Name (from queue relation, with avatar)
  2. Job Profile (job title)
  3. Interviewer Name
  4. Started At (formatted datetime)
  5. Ended At (formatted datetime or "In Progress")
  6. Result (colored badge)
  7. Actions (View, Edit Result)

- **Features**:
  - Date range filter
  - Result filter: pending/passed/failed/hired
  - Pagination: Server-side
  - Export to CSV (optional)

**API Integration**
```typescript
GET /interviews?page=1&limit=20
Response: {
  success: true,
  data: {
    items: Interview[],
    pagination: { ... }
  }
}
```

---

### 1.2 Start Interview Form (`/interviews/new`)

**`StartInterviewPage`** (Form Container)
- **Trigger**: From interviewer console when calling next student
- **Layout**: Modal or simple form
- **Fields**:
  - Queue ID (auto-populated from selected queue entry)
  - Interviewer Name (text, required, pre-fill from user profile)
  - Notes (textarea, optional, pre-interview notes)

**Validation Schema**
```typescript
z.object({
  queueId: z.string().uuid('Invalid queue ID'),
  interviewerName: z.string().min(1, 'Interviewer name is required'),
  notes: z.string().optional(),
});
```

**API Integration**
```typescript
POST /interviews
Request: CreateInterviewDto
Response: { success: true, data: Interview }
```

**Post-Creation**
- Queue status automatically changes to `in_progress` (backend)
- WebSocket emits `interviewStarted`
- Redirect to active interview view

---

### 1.3 Interview Detail Page (`/interviews/:id`)

**`InterviewDetailPage`** (Detail View)
- **Layout**:
  - Header: Interview status, result badge
  - Two-column grid:
    - Left (60%): Interview details, feedback form
    - Right (40%): Student info, CV preview

**`InterviewInfo`** (Details Display)
- **Sections**:
  1. **Interview Metadata**:
     - Interviewer Name
     - Started At (formatted datetime)
     - Ended At (formatted datetime or null if ongoing)
     - Duration (calculated: endedAt - startedAt)
  2. **Linked Entities**:
     - Student Name & Track (with link)
     - Job Profile (title, company)
     - Queue Position

**`FeedbackForm`** (Results Entry)
- **Layout**: Form card (visible to interviewer)
- **Fields**:
  - Rating (5-star system, required)
  - Technical Skills (textarea, optional)
  - Cultural Fit (textarea, optional)
  - Final Result (dropdown, required)
    - Options: pending, passed, failed, hired
  - Notes (textarea, optional, interview notes)
- **Actions**: [Submit Feedback] (primary), [Save Draft] (secondary)

**Validation Schema**
```typescript
z.object({
  result: z.enum(['pending', 'passed', 'failed', 'hired']),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  technicalSkills: z.string().optional(),
  culturalFit: z.string().optional(),
});
```

**API Integration**
```typescript
PATCH /interviews/:id
Request: UpdateInterviewDto
Response: { success: true, data: Interview }
```

**Post-Update**
- Queue status changes to `completed` (backend)
- WebSocket emits `interviewEnded`
- Show success toast
- Next student can be called

---

## 2. Reusable Components

### 2.1 InterviewResultBadge
```typescript
interface InterviewResultBadgeProps {
  result: InterviewResult;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `passed`: Green (#22c55e) with checkmark
- `failed`: Red (#ef4444) with X
- `hired`: Blue (#3b82f6) with star
- `pending`: Yellow (#f59e0b) with clock

### 2.2 StarRating
```typescript
interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  maxStars?: number;
}
```

**UI**: Interactive 5-star rating with hover effect

```css
.star-rating {
  display: flex;
  gap: 0.25rem;
}

.star {
  cursor: pointer;
  color: #e2e8f0;
  transition: color 0.2s;
}

.star.active, .star:hover {
  color: #f59e0b;
}
```

### 2.3 FeedbackForm Modal (for interviewer console)
```typescript
interface FeedbackModalProps {
  open: boolean;
  interviewId: string;
  onSubmit: (data: UpdateInterviewDto) => void;
  onCancel: () => void;
}
```

**UI**: Modal with form fields, submit/cancel buttons

---

## 3. State Management

### Interview List State
- Current page
- Date range filter
- Result filter

### Active Interview State
- Current interview being conducted
- Form data (unsaved feedback)
- WebSocket status

### Data Fetching
- Cache time: 2 minutes
- Invalidate on create/update
- Real-time updates via WebSocket for active interviews

---

## 4. API Service Layer

**`src/api/interviews.api.ts`**
```typescript
export const interviewsApi = {
  list: (params: { page?: number; limit?: number; startDate?: string; endDate?: string; result?: InterviewResult }) => 
    api.get('/interviews', { params }),
  getById: (id: string) => api.get(`/interviews/${id}`),
  create: (data: CreateInterviewDto) => api.post('/interviews', data),
  update: (id: string, data: UpdateInterviewDto) => api.patch(`/interviews/${id}`, data),
};
```

---

## 5. Features

### 5.1 Interview Workflow
1. Interviewer calls next student from queue
2. Frontend creates interview record via `POST /interviews`
3. Backend sets queue status to `in_progress`
4. WebSocket emits `interviewStarted`
5. Interviewer conducts interview
6. Interviewer fills feedback form
7. Submit feedback via `PATCH /interviews/:id`
8. Backend sets queue status to `completed`
9. WebSocket emits `interviewEnded`
10. Next student can be called

### 5.2 Rating System
- 5-star rating for overall performance
- Optional detailed feedback fields
- Visible to student after interview (optional, depends on requirements)

### 5.3 Interview Notes
- Free-form text for interviewer observations
- Can be entered during or after interview
- Stored with interview record

### 5.4 Result Tracking
- Results: pending, passed, failed, hired
- Used for analytics and reporting
- Student can see their result (optional)

---

## 6. WebSocket Integration

Subscribe to interview events on active interview page:

```typescript
socketService.onInterviewStarted((data) => {
  // Show active interview UI
  setActiveInterview(data);
  showToast('Interview started with ' + data.queue.student.user.firstName);
});

socketService.onInterviewEnded((data) => {
  // Clear active interview
  setActiveInterview(null);
  showToast('Interview completed. Result: ' + data.result);
  invalidateQueries(['interviews']);
});
```

---

## 7. Error Handling

- **400 Validation**: Show field-level errors
- **404 Not Found**: "Interview not found"
- **403 Forbidden**: "You don't have permission to view this interview"
- **Network Errors**: Toast with retry
- **WebSocket Disconnect**: Fallback to polling for active interview

---

## 8. Styling Notes

### Interview Detail Layout
```css
.interview-detail {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .interview-detail { grid-template-columns: 1fr; }
}
```

### Feedback Form
```css
.feedback-form {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
}

.feedback-form h3 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-field {
  margin-bottom: 1.5rem;
}
```

### Interview Table Styles
```css
.interview-in-progress {
  background: #fef9c3;
  border-left: 4px solid #f59e0b;
}
```

---

## 9. Testing Checklist

- [ ] Interview list loads with pagination
- [ ] Date filter works correctly
- [ ] Result filter works correctly
- [ ] Start interview creates interview record
- [ ] Interview detail shows all sections
- [ ] Feedback form validates correctly
- [ ] Submit feedback updates interview
- [ ] Result badge displays correct color
- [ ] Star rating works interactively
- [ ] Real-time updates via WebSocket
- [ ] Interview duration calculates correctly
- [ ] CV preview displays correctly
- [ ] Form data persists during editing

---

## 10. Dependencies

- React Hook Form + Zod (form validation)
- Star rating component (custom or library)
- socket.io-client (real-time updates)
- PDF viewer (CV preview)
- Modal component

---

## 11. Implementation Order

1. Interview list page with API integration
2. Data table with filters
3. Start interview form
4. Interview detail page
5. Feedback form with validation
6. Star rating component
7. Result badge component
8. WebSocket integration
9. Interview workflow integration with queues
10. Error handling & edge cases
11. Testing & polish
