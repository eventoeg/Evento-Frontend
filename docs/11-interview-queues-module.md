# Interview Queues Module - Detailed Implementation Guide

## Module Overview
The Interview Queues module provides real-time queue management for student interviews at job fairs, with WebSocket-based live updates and interviewer console functionality.

---

## 1. Screens & Components

### 1.1 Queue Board Page (`/queues`, `/queues/job-profile/:id`)

#### File Structure
```
src/pages/Queues/
├── QueueBoard/
│   ├── index.tsx           # Main queue board page
│   ├── QueueStats.tsx      # Queue statistics
│   └── QueueControls.tsx   # Global queue actions
├── StudentQueue/
│   ├── index.tsx           # Student live queue dashboard
│   ├── PositionTracker.tsx # Position in queue display
│   └── StatusCards.tsx     # Current/upcoming status
├── InterviewerConsole/
│   ├── index.tsx           # Split-screen interviewer view
│   ├── WaitingList.tsx     # Left: Waiting students
│   ├── ActiveInterview.tsx # Right: Current interview
│   └── FloatingControls.tsx # Action buttons
└── components/
    ├── QueueCard.tsx       # Student queue entry card
    ├── QueueStatusBadge.tsx
    └── LiveIndicator.tsx   # Pulsing "LIVE" indicator
```

#### Component Specification

**`QueueBoardPage`** (Main Container)
- **Layout**: 
  - Header: "Interview Queue Board" + Live indicator
  - Job Profile selector (if viewing all queues)
  - Queue stats row
  - Main content area (changes based on role)
- **Access**:
  - Admin/Staff: View all queues
  - Company Rep: View their company's queues (interviewer console)
  - Student: View their own queue position

**`QueueStats`** (Statistics Row)
- **Metrics**:
  - Total Students in Queue
  - Waiting: X
  - In Progress: X
  - Completed: X
  - Skipped/Halted: X
- **UI**: Small stat cards in a row

**API Integration**
```typescript
GET /queues?page=1&limit=100&jobProfileId=uuid
Response: {
  success: true,
  data: {
    items: InterviewQueue[],
    pagination: { ... }
  }
}
```

---

### 1.2 Student Live Queue Dashboard

**`StudentQueue`** (Student View)
- **Layout**:
  - Large circular progress showing position
  - Status cards below
  - Live pulse indicator

**`PositionTracker`** (Position Display)
- **Elements**:
  - Circular progress ring (animated)
  - Position number in center (e.g., "#3")
  - Text: "You are position X in line"
  - Estimated wait time (calculated from average interview duration)

**`StatusCards`** (Status Information)
- **Cards**:
  1. **Now Interviewing**: Current student name (from queue with status=in_progress)
  2. **Your Position**: Position number in queue
  3. **Estimated Wait**: X minutes (based on average interview time * positions ahead)
  4. **Queue Status**: Waiting/Skipped/Halted/Completed

**WebSocket Integration**
- Subscribe to `queueUpdated` events
- Update position in real-time
- Show toast when position changes
- Animate when called to interview

**API Integration**
```typescript
GET /queues?studentId=:id
Response: { success: true, data: InterviewQueue[] }
```

---

### 1.3 Interviewer Console (Company Rep View)

**`InterviewerConsole`** (Split-Screen)
- **Layout**: Two-column split
  - Left (35%): Waiting students list
  - Right (65%): Active interview area

**`WaitingList`** (Left Panel)
- **Display**: Vertical scrollable list
- **Per Student**:
  - Student Name (with avatar)
  - Track Name
  - Graduation Year
  - Arrival Time (when joined queue)
  - Time Waiting (relative: "Waiting for 15 min")
  - Actions: [Call to Interview] (green)
- **Sorting**: By position (FIFO)
- **Filter**: Show only "waiting" status

**`ActiveInterview`** (Right Panel)
- **When No Active Interview**:
  - Empty state: "No active interview"
  - Call-to-action: "Select a student from the waiting list"
- **When Interview In Progress**:
  - Header: "Currently Interviewing: [Student Name]"
  - Student Info: Track, Grad Year, Email
  - CV Preview: Embedded PDF viewer (if CV uploaded)
  - Interview Controls: [End & Rate] (red)

**`FloatingControls`** (Action Bar)
- **Buttons**:
  - [Call Next] (green): Move next waiting student to interview
  - [Halt Queue] (yellow): Pause queue processing
  - [Resume Queue] (blue): Resume halted queue
  - [Skip Student] (orange): Skip current student

**WebSocket Integration**
- Subscribe to `queueJoined`, `queueUpdated`, `interviewStarted`, `interviewEnded`
- Update waiting list in real-time
- Show notifications when students join queue
- Animate when interview starts/ends

**API Integration**
```typescript
// Get next student
GET /queues/job-profile/:id/next
Response: { success: true, data: InterviewQueue }

// Update queue status
PATCH /queues/:id/status
Request: { status: QueueStatus }
Response: { success: true, data: InterviewQueue }

// Shortcut endpoints
PATCH /queues/:id/skip
PATCH /queues/:id/halt
PATCH /queues/:id/resume
```

---

## 2. Reusable Components

### 2.1 QueueCard
```typescript
interface QueueCardProps {
  queueEntry: InterviewQueue;
  student: Student;
  onCall?: () => void;
  onSkip?: () => void;
  onViewProfile?: () => void;
  variant?: 'compact' | 'detailed';
}
```

**UI**: Card with student info, status badge, action buttons

### 2.2 QueueStatusBadge
```typescript
interface QueueStatusBadgeProps {
  status: QueueStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping**:
- `waiting`: Blue (#3b82f6)
- `in_progress`: Green (#22c55e) with pulse animation
- `skipped`: Orange (#f97316)
- `halted`: Yellow (#f59e0b)
- `completed`: Gray (#64748b)

### 2.3 LiveIndicator
```typescript
interface LiveIndicatorProps {
  isLive: boolean;
}
```

**UI**: Red dot with pulse animation + "LIVE" text

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 2s ease-in-out infinite;
}
```

### 2.4 CircularPosition
```typescript
interface CircularPositionProps {
  position: number;
  total: number;
  size?: number;
}
```

**UI**: SVG circular progress with position number in center

---

## 3. State Management

### Queue State
- Current queue entries (array)
- Selected job profile filter
- WebSocket connection status
- Active interview (if any)

### WebSocket Integration
```typescript
// Connection on mount
useEffect(() => {
  socketService.connect();
  
  socketService.onQueueJoined((data) => {
    if (data.jobProfileId === selectedJobProfileId) {
      // Add to queue list
      invalidateQueries(['queues', selectedJobProfileId]);
    }
  });
  
  socketService.onQueueUpdated((data) => {
    // Update queue entry in list
    invalidateQueries(['queues', selectedJobProfileId]);
  });
  
  // Join job profile room for targeted updates
  socketService.joinJobProfileRoom(selectedJobProfileId);
  
  return () => {
    socketService.leaveJobProfileRoom(selectedJobProfileId);
    socketService.disconnect();
  };
}, [selectedJobProfileId]);
```

### Data Fetching
- Cache time: 0 (real-time, always fresh)
- Refetch interval: 30 seconds (fallback if WebSocket fails)
- Optimistic updates for status changes

---

## 4. API Service Layer

**`src/api/queues.api.ts`**
```typescript
export const queuesApi = {
  list: (params: { page?: number; limit?: number; jobProfileId?: string; studentId?: string }) => 
    api.get('/queues', { params }),
  getById: (id: string) => api.get(`/queues/${id}`),
  getNext: (jobProfileId: string) => api.get(`/queues/job-profile/${jobProfileId}/next`),
  create: (data: CreateQueueEntryDto) => api.post('/queues', data),
  updateStatus: (id: string, data: UpdateQueueStatusDto) => 
    api.patch(`/queues/${id}/status`, data),
  skip: (id: string) => api.patch(`/queues/${id}/skip`),
  halt: (id: string) => api.patch(`/queues/${id}/halt`),
  resume: (id: string) => api.patch(`/queues/${id}/resume`),
  delete: (id: string) => api.delete(`/queues/${id}`),
};
```

---

## 5. Features

### 5.1 Real-Time Updates
- WebSocket connection for live queue updates
- Automatic reconnection on disconnect
- Room-based updates per job profile
- Fallback polling every 30 seconds

### 5.2 Queue Workflow
1. Student joins queue (status: waiting)
2. Interviewer calls next student
3. Queue status changes to in_progress
4. Interview starts (creates Interview record)
5. Interviewer ends interview with result
6. Queue status changes to completed
7. Next student automatically called

### 5.3 Queue Status Transitions
```
waiting → in_progress (called to interview)
waiting → skipped (student unavailable)
waiting → halted (queue paused)
skipped → waiting (resumed)
halted → waiting (resumed)
in_progress → completed (interview ended)
```

### 5.4 Position Calculation
- Position based on order in queue (position field)
- Recalculated when students are skipped/removed
- Displayed to students in real-time

### 5.5 Student Join Queue
- Students join queue from job profile detail page
- API: `POST /queues` with `jobProfileId` and `studentId`
- Validates student not already in queue
- Emits `queueJoined` via WebSocket

---

## 6. WebSocket Events

| Event | Payload | When Emitted | Frontend Action |
| --- | --- | --- | --- |
| `queueJoined` | InterviewQueue | Student joins queue | Add to list, show toast |
| `queueUpdated` | InterviewQueue | Status changes | Update entry in list |
| `interviewStarted` | Interview | Interview begins | Show active interview UI |
| `interviewEnded` | Interview | Interview ends | Update queue to completed |

---

## 7. Error Handling

- **400 Validation**: "Duplicate queue entry" or invalid status
- **404 Not Found**: "Queue entry not found"
- **409 Conflict**: "Student already in queue"
- **WebSocket Disconnect**: Show "Reconnecting..." banner, fallback to polling
- **Network Errors**: Toast with retry

---

## 8. Styling Notes

### Interviewer Console Layout
```css
.interviewer-console {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: 1.5rem;
  height: calc(100vh - 200px);
}

@media (max-width: 1024px) {
  .interviewer-console { grid-template-columns: 1fr; }
}

.waiting-list {
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  padding-right: 1.5rem;
}
```

### Position Tracker
```css
.position-tracker {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.circular-progress {
  width: 200px;
  height: 200px;
  position: relative;
}

.position-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  font-weight: 700;
  color: #0f172a;
}
```

---

## 9. Testing Checklist

- [ ] Queue board loads with queue entries
- [ ] Job profile filter works
- [ ] Student position displays correctly
- [ ] Real-time updates work via WebSocket
- [ ] Interviewer console shows waiting students
- [ ] Call next student updates status
- [ ] Halt queue pauses processing
- [ ] Resume queue resumes processing
- [ ] Skip student changes status
- [ ] Position tracker animates on update
- [ ] Live indicator pulses correctly
- [ ] WebSocket reconnection works
- [ ] Fallback polling when WebSocket fails
- [ ] Student can join queue from job profile
- [ ] Duplicate queue prevention works

---

## 10. Dependencies

- socket.io-client (real-time updates)
- SVG circular progress component
- PDF viewer (CV preview)
- Date-fns (relative time)

---

## 11. Implementation Order

1. Queue board page layout
2. Queue list with API integration
3. Queue status badge component
4. Student position tracker
5. Interviewer console layout
6. Waiting list component
7. Active interview section
8. Queue controls (call next, halt, resume, skip)
9. WebSocket integration
10. Real-time update handling
11. Student join queue flow
12. Error handling & reconnection
13. Testing & polish
