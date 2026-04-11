# ITI EMS Frontend: Exhaustive Modules & Screens Specification

This document provides the definitive blueprint for the ITI EMS frontend. It is designed to be consumed by AI agents and developers to eliminate ambiguity.

---

## 1. Authentication & Identity Module
*Design: Centered high-contrast card with floating labels and navy blue primary actions.*

### 1.1 Login Screen
- **UI Elements**: 
  - Logo Placeholder (Top Center).
  - Email Field: `type="email"`, placeholder="Email Address", icon="Mail".
  - Password Field: `type="password"`, placeholder="Password", icon="Lock", with "Show/Hide" toggle.
  - Action: "Login" Button (Navy Blue, Full Width).
  - Secondary Links: "Forgot Password?", "Don't have an account? Register as Student or Company".
- **Validation**: Email format check, password required.

### 1.2 Registration Screen (Split-View)
- **Layout**: Left side (Branding Image/Illustration), Right side (Scrollable Form).
- **Global Fields**: First Name, Last Name, Email, Password (min 6 chars), Confirm Password.
- **Role Toggle**: Segmented Control/Switch: [Student | Company Representative].
- **Dynamic Logic**:
  - **If Student**: Show "ITI Track" (Dropdown: MEARN, Cyber Security, etc.) and "Graduation Year" (Number Picker).
  - **If Company Rep**: Show "Search Company" (Autocomplete) or "Register New Company" link.
- **Action**: "Create Account" (Primary Red secondary color).

### 1.3 User Profile
- **Header**: User Avatar, Full Name, Role Badge (e.g., "Student").
- **Content Tabs**: 
  1. [Account Settings]: Email update, Password change.
  2. [Role Details]: (For Students: Track info, ID) | (For Reps: Company Name, Business Title).
- **Action**: "Save Changes" (Sticky Bottom Bar).

---

## 2. Admin & Staff Management Module
*Design: Sidebar Navigation (Fixed), Top Search Bar, Main Content Area with 8px grid spacing.*

### 2.1 Admin Overview Dashboard
- **Top Row (4 Stats Cards)**: 
  - Total Students (with +% trend).
  - Pending Companies (Red notification dot).
  - Published Events.
  - Active Interviews Today.
- **Middle Section**: 
  - [Recent Activity Feed]: List of 10 latest system logs (e.g., "New company registered").
  - [Event Analytics]: Bar chart showing attendance per track.

### 2.2 User Management Table
- **Columns**: Name (with Avatar), Email, Role (Colored Badge), Date Joined, Action.
- **Filters**: Role Dropdown, Search by Name/Email.
- **Row Actions**: Edit (Modal), Deactivate (Confirmation Dialog).

### 2.3 Company Approval Queue
- **Layout**: List of detailed cards.
- **Card Content**: Company Name, Description (truncate to 2 lines), Location, Status (Badge: Pending).
- **Actions**: [Approve] (Green), [Reject] (Red Outline), [View Full Profile] (Link).

---

## 3. Event Management Module
*Design: Filterable Grid for browsing, Wizard for creation.*

### 3.1 Event Listing
- **Filters**: All | Internal | Job Fair | External Hosted.
- **Card UI**: Cover Image (16:9), Title (Bold), Start Date/Time (Icon: Clock), Type Badge.
- **Status Overlay**: "Draft", "Published", or "Archived".

### 3.2 Event Details View
- **Top**: Hero Image with "Register" or "Edit" button.
- **Grid Layout**: 
  - Left (60%): "About Event" (Rich text), "Venue" (Map placeholder + Address).
  - Right (40%): [Agenda Timeline]. Each slot shows: Time, Title, Type (Session/Break), Speaker.

### 3.3 Event Creation Wizard (3 Steps)
1. **Step 1: Basics**: Title, Description, Type Dropdown, Date/Time Pickers (Start & End).
2. **Step 2: Venues**: Add/Remove Venue fields (Name, Capacity).
3. **Step 3: Agenda**: Dynamic form to add multiple agenda items (Time, Title, Type Enum).

---

## 4. Job Fair & Opportunities Module
*Design: Clean, high-density information layout.*

### 4.1 Job Profiles Board
- **List View**: Company Logo, Role Title, Number of Slots, Interview Type (Technical/HR).
- **Quick Action**: "Join Queue" (Visible only to Students).

### 4.2 Job Profile Detail
- **Header**: Company Logo & Name, Position Title.
- **Sections**: Job Description, Technical Requirements, Interview Process.
- **Footer**: "Join Interview Queue" (Primary Navy Button).

---

## 5. Real-Time Interview Queue Module
*Design: Live updates using WebSockets; Pulse animations to indicate activity.*

### 5.1 Student Live Queue Dashboard
- **Main View**: Large Circular Progress showing "Position # in Line".
- **Status Cards**: 
  - Current: "Now Interviewing: [Student Name]".
  - Upcoming: "Your estimated wait: [X] minutes".
- **Visuals**: Pulse animation on the "Live" indicator.

### 5.2 Interviewer Console (Split-Screen)
- **Left (List)**: Vertical scrollable list of "Waiting Students" (Name + Arrival Time).
- **Right (Active)**: 
  - Large Header: "Currently Interviewing: [Student Name]".
  - CV Preview: Embedded PDF viewer.
  - Quick Info: Student Track, Grad Year.
- **Floating Controls**: [Call Next] (Green), [Halt Queue] (Yellow), [End & Rate] (Red).

### 5.3 Interview Feedback Form (Modal)
- **Fields**: 
  - Rating: 5-Star system.
  - Technical Skills: Textarea.
  - Cultural Fit: Textarea.
  - Final Result: Dropdown (Pass, Fail, Hired, Pending).

---

## 6. Student Portfolio Module
*Design: Professional developer-centric profile.*

### 6.1 CV Portfolio Manager
- **Layout**: 
  - Left: Large interactive PDF Viewer (supports scrolling/zoom).
  - Right: Metadata panel.
- **Fields**: 
  - Upload/Replace CV (Drag & Drop zone).
  - LinkedIn URL (type="url").
  - GitHub URL (type="url").
  - Personal Portfolio (type="url").
- **Action**: "Update Portfolio" (Primary Navy).