# Plan: Remaining Frontend Modules & Screens Implementation

This plan outlines the implementation of the remaining modules for the ITI EMS frontend, focusing on robust role-based access control (RBAC), Job Fair workflows, and event management.

## 1. Authentication & Role Foundation

### Goal
Establish a granular permission system and role-aware UI to ensure security and a tailored user experience.

### Changes
- **Implement `RoleGuard`**: Create a wrapper component to protect routes and UI elements based on `UserRole`.
- **Role-Aware Navigation**: Update `src/app/(dashboard)/layout.tsx` to filter navigation items based on the user's role.
- **Enhanced Registration Flow**:
    - Add logic for "Private Link" registration for ITI students.
    - Implement "Previous Student" email detection and "Pending Update" status.
    - Ensure registration form fields dynamically adjust for Student vs. Company Representative roles (partially implemented, needs refinement).

## 2. Job Fair Module Implementation

### Goal
Provide a complete end-to-end workflow for companies, students, and admins during Job Fair events.

### 2.1 Company Perspective
- **Invitation & Application**:
    - Create a landing page for companies arriving via invitation links.
    - Implement the comprehensive Job Fair application form (Company details, rep info).
- **Setup & Configuration**:
    - **Job Profiles**: Screen for creating/editing job profiles (positions, interview types: HR/Technical/Both).
    - **Queue Config**: UI for defining number of queues and max concurrent interviews.
    - **Branding Day**: Form to request branding days and provide speaker data.
- **Talent Management**:
    - **CV Browser**: Dedicated view for browsing and shortlisting student CVs.
    - **Interviewer Management**: Screen to assign interviewers to specific queues.
- **Interview Execution**:
    - **Live Console**: Real-time dashboard for conducting interviews. Features:
        - PDF CV viewer integration.
        - "Call Next", "Skip Student", "Mark Break" controls.
        - Mandatory feedback form before moving to the next student.

### 2.2 Student Perspective
- **Portfolio Management**:
    - Enhance CV upload to support multiple files and marking a "Primary CV".
- **Event Participation**:
    - **Check-in UI**: Simple check-in action for Job Fair attendance.
    - **Live Queue Dashboard**: Real-time position tracking, status updates (Halted if in another interview), and estimated wait times.
- **Feedback & Outcomes**:
    - **Feedback Forms**: Optional feedback for the event and companies.
    - **Acceptance Form**: Final confirmation of acceptance/hiring status.

### 2.3 Admin Perspective
- **Approvals**:
    - Refine the Company and Job Profile approval queues.
- **Logistics**:
    - **Venue Management**: Interface for assigning labs/halls to companies.
    - **Agenda Builder**: Drag-and-drop calendar view for scheduling Job Fair and Branding Day agendas.
- **Monitoring**:
    - **Real-time Dashboard**: Monitor all active queues, attendance stats, and interview progress.
    - **Rescheduling Tools**: Ability to manually adjust company appointments or student positions.

## 3. Internal & Tech Events

### Goal
Manage ITI's internal event lifecycle and student engagement.

### Admin Features
- **Event Creator**: Expand the event creation wizard with agenda items and speaker details.
- **Dynamic Feedback**: UI to build custom feedback forms per event.
- **Speaker Sharing**: Tool to generate and share feedback results with speakers.

### Student Features
- **Event Discovery**: Browsing and "Joining" internal events.
- **Interactive Session**: Access to Q&A tool links and live event details.
- **Post-Event**: Easy access to feedback forms.

## 4. External Hosted ITI Events

### Goal
Standardize registration for external coordinators.

- **Coordinator Form**: A public-facing form for external organizers to register events at ITI, featuring standardized dropdowns for faculties and universities.

## 5. Roles & Permissions Investigation

### Current State
- `UserRole` enum exists.
- `AuthGuard` handles basic authentication.
- Navigation is static.

### Proposed Granular Permissions
We will map features to roles:
- `ADMIN`: Global CRUD, All Approvals, All Analytics.
- `STAFF`: Event moderation, User management assistance.
- `STUDENT`: Profile, CVs, Event Joining, Queues, Feedback.
- `SECURITY`: Check-in (Attendance) only.
- `COMPANY_REP`: Job Profiles, CV Viewing, Interviewing, Feedback.

## Verification & Testing
- **Role Switching**: Log in as each role to verify that unauthorized routes/buttons are hidden.
- **Real-time Simulation**: Test WebSocket-driven queue updates with multiple simulated students and companies.
- **Form Validations**: Ensure mandatory feedback and data safety (pended review) work correctly.
- **Edge Cases**: Verify "Halted" queue status when a student is in another interview.

## Questions & Clarifications
1. **Private Link Logic**: Should the "private link" for students be a static URL or a tokenized one?
2. **Branding Day**: Is "Branding Day" a separate event ID or a sub-type/agenda item within a Job Fair?
3. **Reschedule Approval**: When a company requests a reschedule, does it automatically alert the admin in a specific dashboard?
4. **Physical Locations**: Do we need a predefined list of ITI labs/halls, or should they be free-text with capacity?
5. **Shortlisting Access**: The text says "Access need to be adjusted manually not automatically" for student CVs. Does this mean admin must enable CV visibility for each company?
