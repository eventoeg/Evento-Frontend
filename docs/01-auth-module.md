# Auth Module - Detailed Implementation Guide

## Module Overview
The Authentication module handles user login, registration, session management, and profile views.

---

## 1. Screens & Components

### 1.1 Login Screen (`/login`)

#### File Structure
```
src/pages/Auth/Login/
├── index.tsx           # Page component
├── LoginForm.tsx       # Form component
└── loginSchema.ts      # Zod validation schema
```

#### Component Specification

**`LoginPage`** (Page Container)
- **Layout**: Centered card on full-screen gradient background
- **Elements**:
  - Logo/Branding (top center)
  - Login form card
  - Links to registration
- **State**: None (delegates to form)
- **Actions**: 
  - On success: store tokens, redirect to role-based dashboard

**`LoginForm`** (Form Component)
- **Fields**:
  - Email (text input with mail icon)
  - Password (password input with show/hide toggle)
- **Validation**: 
  - Email format required
  - Password required
- **Submit Handler**: 
  - Call `POST /auth/login`
  - Store `accessToken` and `refreshToken` in memory/sessionStorage
  - Dispatch auth success action
- **Error Handling**: 
  - Display field-level errors from API response
  - Show toast on network errors

**API Integration**
```typescript
POST /auth/login
Request: { email: string, password: string }
Response: { 
  success: true, 
  data: { 
    accessToken: string, 
    refreshToken: string, 
    user: User 
  } 
}
```

**Validation Schema**
```typescript
z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
```

**UI Flow**
1. User enters credentials
2. On submit, show loading state
3. On success: store auth, redirect to `/`
4. On failure: display validation errors

---

### 1.2 Registration Screen (`/register`)

#### File Structure
```
src/pages/Auth/Register/
├── index.tsx               # Page component
├── RegisterForm.tsx        # Form with role toggle
├── StudentFields.tsx       # Track & graduation year fields
├── CompanyFields.tsx       # Company search/select fields
└── registerSchema.ts       # Zod validation schema
```

#### Component Specification

**`RegisterPage`** (Page Container)
- **Layout**: Split-view
  - Left: Branding image/illustration (hidden on mobile)
  - Right: Scrollable registration form
- **Elements**:
  - Header: "Create Account"
  - Role segmented control: [Student | Company Representative]
  - Dynamic form fields based on role
  - Link to login

**`RegisterForm`** (Form Component)
- **Global Fields** (always shown):
  - First Name (text, required)
  - Last Name (text, required)
  - Email (email, required)
  - Password (password, min 6 chars, required)
  - Confirm Password (password, must match, required)

- **Role Toggle**: 
  - Segmented control switching between Student/Company Rep
  - Default: Student

- **Student Fields** (conditional):
  - ITI Track (dropdown, required)
    - Fetch from `GET /tracks`
    - Options: track.name
  - Graduation Year (number picker, optional)

- **Company Rep Fields** (conditional):
  - Company Select (autocomplete/search, required)
    - Fetch from `GET /companies?status=approved`
    - Search by company name
    - OR "Register New Company" link

**API Integration**
```typescript
POST /auth/register
Request (Student): { 
  firstName, lastName, email, password, 
  role: 'student', 
  trackId: string, 
  graduationYear?: number 
}
Request (Company Rep): { 
  firstName, lastName, email, password, 
  role: 'company_rep', 
  companyId: string 
}
Response: { 
  success: true, 
  data: { 
    accessToken, refreshToken, user 
  } 
}
```

**Validation Schema**
```typescript
z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'company_rep']),
  trackId: z.string().uuid().optional(),
  graduationYear: z.number().int().optional(),
  companyId: z.string().uuid().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'student') return !!data.trackId;
  if (data.role === 'company_rep') return !!data.companyId;
  return true;
}, {
  message: 'Required field',
  path: ['trackId'], // or companyId dynamically
});
```

**UI Flow**
1. User selects role
2. Conditional fields appear
3. On submit: validate, call API, auto-login on success
4. Redirect to dashboard

---

### 1.3 User Profile Screen (`/profile`)

#### File Structure
```
src/pages/Profile/
├── index.tsx           # Page component
├── ProfileHeader.tsx   # Avatar, name, role badge
├── AccountSettings.tsx # Email, password change tab
├── RoleDetails.tsx     # Role-specific info (track/company)
└── profileSchema.ts    # Validation schemas
```

#### Component Specification

**`ProfilePage`** (Page Container)
- **Layout**: 
  - Header with avatar, name, role badge
  - Tab navigation: [Account Settings | Role Details]
  - Content area for active tab
  - Sticky bottom bar with "Save Changes"

**`ProfileHeader`**
- **Props**: `{ user: User }`
- **Elements**:
  - Avatar (generated from initials or uploaded image)
  - Full name (firstName + lastName)
  - Role badge (colored tag)
  - Edit profile button

**`AccountSettings`** (Tab)
- **Fields**:
  - Email (read-only or editable with confirmation)
  - Current Password (for change)
  - New Password
  - Confirm New Password
- **Actions**:
  - Update profile via `PATCH /users/:id`
  - Change password (separate endpoint if available)

**`RoleDetails`** (Tab)
- **For Students**:
  - Track name & description
  - Graduation year
  - Student status (current/alumni)
- **For Company Reps**:
  - Company name
  - Company location
  - Business title

**API Integration**
```typescript
GET /auth/profile
Response: { success: true, data: User }

PATCH /users/:id
Request: { firstName?, lastName?, email? }
Response: { success: true, data: User }
```

---

## 2. State Management

### Auth Slice (Redux/Zustand)
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (tokens: { accessToken, refreshToken, user }) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  setUser: (user: User) => void;
}
```

### Storage Strategy
- **Access Token**: In-memory only (Zustand store)
- **Refresh Token**: `sessionStorage` (cleared on tab close)
- **User Object**: In-memory store
- **On Page Refresh**: Call `GET /auth/profile` if refresh token exists

---

## 3. API Service Layer

**`src/api/auth.api.ts`**
```typescript
export const authApi = {
  login: (data: LoginDto) => api.post('/auth/login', data),
  register: (data: RegisterDto) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (id: string, data: UpdateUserDto) => api.patch(`/users/${id}`, data),
};
```

---

## 4. Route Protection

**`RequireAuth` Guard**
- Check if user is authenticated
- If not, redirect to `/login`
- Preserve intended route for post-login redirect

**Role-Based Redirects**
```typescript
const roleRedirects = {
  admin: '/',
  staff: '/',
  student: '/',
  security: '/events',
  company_rep: '/job-profiles',
};
```

---

## 5. HTTP Interceptor Integration

**Request Interceptor**
- Attach `Authorization: Bearer <accessToken>` from store
- Add to every API request

**Response Interceptor**
- On `401`: 
  - Attempt token refresh via `POST /auth/refresh`
  - Retry original request with new token
  - If refresh fails: logout user
- On `403`: Show "Unauthorized" page
- On network errors: Show toast notification

---

## 6. Error Handling

### Validation Errors
- Map API `errors[]` array to form fields
- Display inline under respective inputs

### Global Errors
- `401 Unauthorized`: Redirect to login
- `403 Forbidden`: Show access denied page
- `500 Server Error`: Show error page with retry

---

## 7. Styling Notes

### Design Tokens
```css
--auth-bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
--auth-card-bg: #ffffff;
--auth-primary: #1e3a8a; /* Navy blue */
--auth-primary-hover: #1e40af;
--auth-secondary: #dc2626; /* Red for registration */
--auth-text-primary: #0f172a;
--auth-text-secondary: #64748b;
--auth-border: #e2e8f0;
```

### Layout
- Login: Centered card, max-width 420px, padding 2rem
- Register: Split 50/50 on desktop, stacked on mobile
- Profile: Full-width container, max-width 800px

---

## 8. Testing Checklist

- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Registration creates user and auto-logs in
- [ ] Student registration requires track selection
- [ ] Company registration requires company selection
- [ ] Password confirmation validates match
- [ ] Token storage works correctly
- [ ] Profile page loads current user data
- [ ] Profile updates save successfully
- [ ] Logout clears all auth state
- [ ] Token refresh works on 401
- [ ] Protected routes redirect to login when unauthenticated

---

## 9. Dependencies

- React Hook Form (form management)
- Zod (validation)
- Axios (HTTP client)
- React Router (navigation)
- Zustand/Redux (state management)
- Lucide React (icons)

---

## 10. Implementation Order

1. Auth state management (store/slice)
2. HTTP client with interceptors
3. Login page UI & validation
4. Login API integration
5. Register page UI with role toggle
6. Register API integration
7. Profile page with tabs
8. Route guards & protected routes
9. Error handling & edge cases
10. Testing & polish
