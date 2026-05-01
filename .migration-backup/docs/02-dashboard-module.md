# Dashboard Module - Detailed Implementation Guide

## Module Overview
The Dashboard module serves as the landing page for authenticated users, displaying role-based summaries, statistics, and quick actions.

---

## 1. Screens & Components

### 1.1 Dashboard Home (`/`)

#### File Structure
```
src/pages/Dashboard/
├── index.tsx                 # Page container with role-based routing
├── AdminDashboard.tsx        # Admin stats & analytics
├── StaffDashboard.tsx        # Staff operational view
├── StudentDashboard.tsx      # Student-focused dashboard
├── SecurityDashboard.tsx     # Security read-only view
├── CompanyDashboard.tsx      # Company rep dashboard
├── StatsCard.tsx             # Reusable statistics card
├── ActivityFeed.tsx          # Recent activity list
└── QuickActions.tsx          # Role-based action buttons
```

#### Component Specification

**`DashboardPage`** (Router Component)
- **Logic**: Redirect to role-specific dashboard based on user role
- **Roles**:
  - `admin` → AdminDashboard
  - `staff` → StaffDashboard
  - `student` → StudentDashboard
  - `security` → SecurityDashboard
  - `company_rep` → CompanyDashboard

---

### 1.2 Admin Dashboard

**Layout Structure**
```
┌─────────────────────────────────────┐
│  Welcome Back, [Name]               │
├─────────────────────────────────────┤
│ [Stats] [Stats] [Stats] [Stats]     │  ← 4 cards in row
├──────────────────┬──────────────────┤
│  Recent Activity │  Event Analytics │  ← 2-column grid
│  (60%)           │  (40%)           │
└──────────────────┴──────────────────┘
```

**Stats Cards** (Top Row)
1. **Total Students**
   - Icon: Users
   - Number: Large bold
   - Trend: "+X% this month" (green if positive, red if negative)
   - Link: `/students`

2. **Pending Companies**
   - Icon: Building
   - Number: Count of companies with status='pending'
   - Badge: Red notification dot if > 0
   - Link: `/companies?status=pending`

3. **Published Events**
   - Icon: Calendar
   - Number: Count of events with status='published'
   - Link: `/events?status=published`

4. **Active Interviews Today**
   - Icon: Briefcase
   - Number: Count of interviews today with status='in_progress' or 'completed'
   - Link: `/interviews`

**Recent Activity Feed** (Left Column - 60%)
- **Data Source**: TODO - Backend may not have activity logs endpoint yet
- **Display**: List of 10 latest activities
- **Item Structure**:
  - Icon (action type)
  - Description text (e.g., "New company registered: TechCorp")
  - Timestamp (relative: "2 hours ago")
  - User avatar (who performed action)
- **Fallback**: Show empty state if no data

**Event Analytics** (Right Column - 40%)
- **Chart Type**: Bar chart showing attendance per track
- **Data Source**: Aggregate from attendance/events data
- **Library**: Recharts or Chart.js
- **Fallback**: Show placeholder if no data

**API Integration**
```typescript
// Stats aggregation (may require backend aggregation endpoints)
GET /students?limit=1              // Total count
GET /companies?status=pending      // Pending companies
GET /events?status=published       // Published events
GET /interviews                    // Filter by date on frontend
```

---

### 1.3 Staff Dashboard

**Layout**: Similar to admin but without system-wide stats

**Stats Cards**
1. Events I'm Managing
2. Pending Invitations
3. Active Job Profiles
4. Today's Interview Queue

**Quick Actions**
- Create Event
- Manage Companies
- View Interview Queues

---

### 1.4 Student Dashboard

**Layout Structure**
```
┌─────────────────────────────────────┐
│  Welcome, [FirstName]               │
├─────────────────────────────────────┤
│ [My Track] [My CV Status]           │  ← 2 cards
├─────────────────────────────────────┤
│  Upcoming Events  │  My Queue Status│
├─────────────────────────────────────┤
│  Recommended Job Profiles            │
└─────────────────────────────────────┘
```

**Sections**
1. **My Track Info**
   - Track name & description
   - Link to `/tracks/:id`

2. **CV Status**
   - Has CV: Show "CV Uploaded" badge with checkmark
   - No CV: Warning "Upload your CV to join interview queues"
   - Link: `/profile`

3. **Upcoming Events**
   - List of next 3 published events
   - Card: Title, date, type badge
   - Link: `/events/:id`

4. **My Queue Status** (if in any queue)
   - Current position
   - Status badge (waiting/in_progress/completed)
   - Link: `/queues`

5. **Recommended Job Profiles**
   - Job profiles from current event
   - Grid of 3-6 cards
   - Link: `/job-profiles`

**API Integration**
```typescript
GET /auth/profile                  // User & track info
GET /student-cvs                   // CV status
GET /events?status=published       // Upcoming events
GET /queues?studentId=:id          // My queue entries
GET /job-profiles                  // Available jobs
```

---

### 1.5 Security Dashboard

**Read-Only View**
- Today's Events (list with venues)
- Event Details: Title, time, location
- No edit/create actions

---

### 1.6 Company Rep Dashboard

**Stats Cards**
1. My Job Profiles
2. Active Interviews
3. Students in Queue
4. Pending Invitations

**Sections**
- My Job Profiles (list)
- Upcoming Branding Sessions
- Interview Results Summary

---

## 2. Reusable Components

### 2.1 StatsCard
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  link?: string;
  badge?: {
    count: number;
    color: string;
  };
  loading?: boolean;
}
```

**UI**: Card with icon, title, large value, optional trend arrow/link

### 2.2 ActivityFeed
```typescript
interface ActivityFeedProps {
  activities: Activity[];
  loading: boolean;
  maxItems?: number;
}

interface Activity {
  id: string;
  description: string;
  timestamp: string;
  user: { name: string; avatar?: string };
  type: 'create' | 'update' | 'delete' | 'approve' | 'reject';
}
```

### 2.3 QuickActions
```typescript
interface QuickActionsProps {
  actions: {
    label: string;
    icon: ReactNode;
    link: string;
    color?: string;
  }[];
}
```

---

## 3. State Management

### Dashboard State (Local to pages)
- No global state needed
- Fetch stats on mount
- Refetch on manual refresh or after mutations

### Data Fetching Strategy
- Use RTK Query or React Query
- Stale time: 5 minutes for stats
- Manual refetch after create/update actions

---

## 4. API Service Layer

**`src/api/dashboard.api.ts`**
```typescript
export const dashboardApi = {
  getStudentCount: () => api.get('/students', { params: { limit: 1 } }),
  getPendingCompanies: () => api.get('/companies', { params: { status: 'pending' } }),
  getPublishedEvents: () => api.get('/events', { params: { status: 'published' } }),
  getTodaysInterviews: () => api.get('/interviews'),
  getMyQueues: (studentId: string) => api.get('/queues', { params: { studentId } }),
  getMyJobProfiles: (companyId: string) => api.get('/job-profiles', { params: { companyId } }),
};
```

**Note**: Backend may need aggregation endpoints for efficient dashboard loading.

---

## 5. Chart Integration

### Event Analytics Chart
```typescript
// Using Recharts
<BarChart data={trackAttendance}>
  <XAxis dataKey="trackName" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="attendanceCount" fill="#3b82f6" />
</BarChart>
```

**Data Shape**
```typescript
interface TrackAttendance {
  trackName: string;
  attendanceCount: number;
}
```

---

## 6. Error Handling

- **Partial Failures**: If one stat fails to load, show others with error state on failed card
- **Empty States**: Show friendly messages when no data
- **Loading States**: Skeleton loaders for cards and lists

---

## 7. Styling Notes

### Grid Layouts
```css
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .dashboard-stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .dashboard-stats { grid-template-columns: 1fr; }
}
```

### Dashboard Two-Column
```css
.dashboard-content {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 1.5rem;
}
```

---

## 8. Testing Checklist

- [ ] Admin dashboard shows correct stats
- [ ] Student dashboard shows personalized data
- [ ] Role-based routing works correctly
- [ ] Stats cards link to correct pages
- [ ] Activity feed displays recent actions
- [ ] Charts render with real data
- [ ] Loading skeletons show during fetch
- [ ] Empty states display when no data
- [ ] Quick action buttons navigate correctly
- [ ] Responsive layout works on mobile

---

## 9. Dependencies

- Recharts or Chart.js (analytics charts)
- Lucide React (stat card icons)
- React Router (navigation links)
- Date-fns (relative time formatting)

---

## 10. Implementation Order

1. Dashboard router component (role-based)
2. StatsCard reusable component
3. Admin dashboard layout & stats
4. Student dashboard with personalized data
5. Other role dashboards
6. Activity feed component
7. Analytics chart integration
8. Quick actions component
9. Error handling & loading states
10. Testing & responsive design
