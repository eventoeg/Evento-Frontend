# Student CVs Module - Detailed Implementation Guide

## Module Overview
The Student CVs module manages CV uploads, viewing, and organization for students, with PDF file handling and metadata management.

---

## 1. Screens & Components

### 1.1 CV List Page (`/students/:id/cvs`, `/profile/cvs`)

#### File Structure
```
src/pages/StudentCVs/
├── CVList/
│   ├── index.tsx           # Page container
│   ├── CVTable.tsx         # Data table
│   └── CVActions.tsx       # Bulk actions
├── CVUpload/
│   ├── index.tsx           # Upload form/modal
│   ├── FileUploadZone.tsx  # Drag & drop zone
│   └── cvSchema.ts         # Validation schema
├── CVViewer/
│   ├── index.tsx           # PDF viewer page
│   └── PDFEmbed.tsx        # Embedded PDF component
└── components/
    └── PrimaryCVBadge.tsx
```

#### Component Specification

**`CVListPage`** (Page Container)
- **Layout**:
  - PageHeader: "My CVs" (student view) or "Student CVs" (admin view)
  - Upload CV button
  - Data table with pagination
- **Access**:
  - Student: Own CVs only
  - Admin/Staff: All CVs (with student filter)

**`CVTable`** (Data Display)
- **Columns**:
  1. CV Title (clickable)
  2. Upload Date (formatted)
  3. Primary (badge if isPrimary=true)
  4. File Size (if available)
  5. Actions (View, Download, Set Primary, Delete)

- **Features**:
  - Student filter (admin view)
  - Pagination: Server-side
  - Sort by date

**API Integration**
```typescript
GET /student-cvs?page=1&limit=20&studentId=uuid
Response: {
  success: true,
  data: {
    items: StudentCv[],
    pagination: { ... }
  }
}
```

---

### 1.2 CV Upload Form

**`CVUpload`** (Upload Component)
- **Layout**: Modal or dedicated page
- **Elements**:
  - Drag & drop zone (large, prominent)
  - OR file picker button
  - Title field (optional, defaults to filename)
  - File type validation (PDF only)
  - File size validation (max 10MB recommended)
  - Upload progress bar
  - Preview after upload

**`FileUploadZone`** (Drag & Drop)
- **Features**:
  - Drag & drop support
  - Click to browse files
  - File type validation (.pdf only)
  - File size validation
  - Visual feedback on drag over
  - Upload progress indicator

**Validation Schema**
```typescript
z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === 'application/pdf', {
      message: 'Only PDF files are allowed',
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    }),
  title: z.string().min(1, 'Title is required').optional(),
});
```

**API Integration**
```typescript
POST /student-cvs/upload
Request: FormData with file and title
Content-Type: multipart/form-data
Response: { success: true, data: StudentCv }
```

**Upload Process**
1. User selects or drags PDF file
2. Frontend validates file type and size
3. Create FormData object with file and title
4. Upload via POST with multipart
5. Show progress indicator
6. On success: Add to CV list, show success toast
7. On error: Show error message

---

### 1.3 CV Viewer Page (`/student-cvs/:id/view`)

**`CVViewerPage`** (PDF Viewer)
- **Layout**:
  - Header: CV title, download button, back button
  - Full-width PDF viewer
  - Zoom controls (if supported)

**`PDFEmbed`** (PDF Viewer Component)
- **Options**:
  - `<embed>` tag with PDF URL
  - `<iframe>` with PDF URL
  - Third-party library: `react-pdf` for better control
- **Features**:
  - Scroll through pages
  - Zoom in/out
  - Download button
  - Print button (optional)

**API Integration**
```typescript
GET /student-cvs/:id
Response: { success: true, data: StudentCv }
```

**File Access**
- CV files stored in `uploads/cvs` directory
- Backend serves files via static file serving or dedicated endpoint
- Frontend accesses via URL: `http://localhost:3000/uploads/cvs/<filename>`

---

## 2. Reusable Components

### 2.1 FileUploadZone
```typescript
interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
}
```

**UI**: Dashed border box, drag-over highlight, click to browse

```css
.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}

.upload-zone.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-zone-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}
```

### 2.2 PrimaryCVBadge
```typescript
interface PrimaryCVBadgeProps {
  isPrimary: boolean;
  size?: 'sm' | 'md';
}
```

**UI**: 
- Primary: Green badge with "Primary" text
- Not Primary: Empty or no badge

### 2.3 UploadProgress
```typescript
interface UploadProgressProps {
  progress: number; // 0-100
  status: 'uploading' | 'success' | 'error';
}
```

**UI**: Progress bar with percentage and status icon

---

## 3. State Management

### CV List State
- Current page
- Student filter (admin view)

### Upload State
- Selected file
- Upload progress
- Upload status (uploading/success/error)

### Data Fetching
- Cache time: 5 minutes
- Invalidate on upload/delete
- Clear cache after mutation

---

## 4. API Service Layer

**`src/api/studentCVs.api.ts`**
```typescript
export const studentCVsApi = {
  list: (params: { page?: number; limit?: number; studentId?: string }) => 
    api.get('/student-cvs', { params }),
  getById: (id: string) => api.get(`/student-cvs/${id}`),
  upload: (data: FormData) => 
    api.post('/student-cvs/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Update upload progress in state
      },
    }),
  update: (id: string, data: { title?: string; isPrimary?: boolean }) => 
    api.patch(`/student-cvs/${id}`, data),
  delete: (id: string) => api.delete(`/student-cvs/${id}`),
};
```

---

## 5. Features

### 5.1 PDF-Only Upload
- Backend validates PDF files only
- Frontend should filter file picker to `.pdf` only
- Clear error message if wrong file type

### 5.2 File Size Limits
- Recommended: 10MB max
- Frontend validation before upload
- Backend may have additional limits

### 5.3 Primary CV Flag
- Students can mark one CV as primary
- Primary CV shown first in lists
- Used as default for interview queue display

### 5.4 Multiple CVs
- Students can upload multiple CVs
- Useful for different versions (technical, design, etc.)
- Each CV has its own title and metadata

### 5.5 CV Preview in Interviews
- Primary CV displayed in interviewer console
- PDF viewer embedded in interview detail
- Interviewers can review CV during interview

---

## 6. Integration with Other Modules

### 6.1 Student Module
- Student detail page links to CV list
- CV count shown on student profile

### 6.2 Interview Module
- CVs displayed in interviewer console
- Primary CV shown by default
- PDF viewer for CV review

### 6.3 Queue Module
- Student queue cards may show CV status
- Quick link to view CV from queue

---

## 7. Error Handling

- **400 Validation**: 
  - "Only PDF files are allowed"
  - "File size exceeds limit"
- **404 Not Found**: "CV not found"
- **403 Forbidden**: "You don't have permission to view this CV"
- **Upload Errors**:
  - Network error: "Upload failed. Please try again."
  - Server error: Show error message from response
- **File Access Errors**: 
  - "File not found" or "File unavailable"

---

## 8. Styling Notes

### Upload Zone
```css
.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.upload-zone.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}
```

### CV Table
```css
.cv-table-row:hover {
  background: #f8fafc;
  cursor: pointer;
}

.cv-title {
  font-weight: 500;
  color: #0f172a;
}
```

### PDF Viewer
```css
.pdf-viewer {
  width: 100%;
  height: calc(100vh - 200px);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.pdf-viewer embed,
.pdf-viewer iframe {
  width: 100%;
  height: 100%;
  border: none;
}
```

---

## 9. Testing Checklist

- [ ] CV list loads with pagination
- [ ] Upload accepts PDF files only
- [ ] Upload validates file size
- [ ] Drag & drop works correctly
- [ ] Upload progress displays
- [ ] Upload success adds CV to list
- [ ] Upload failure shows error message
- [ ] CV viewer displays PDF correctly
- [ ] Download CV works
- [ ] Set primary CV updates flag
- [ ] Delete CV removes from list
- [ ] Primary badge displays correctly
- [ ] Student filter works (admin view)
- [ ] Empty state shows when no CVs

---

## 10. Dependencies

- React Dropzone (drag & drop)
- React-PDF or native embed (PDF viewing)
- Axios (multipart upload with progress)
- ConfirmDialog (delete confirmation)

---

## 11. Implementation Order

1. CV list page with API integration
2. Data table with pagination
3. File upload zone with drag & drop
4. Upload form with validation
5. Multipart upload with progress tracking
6. CV viewer with PDF embed
7. Primary CV functionality
8. Delete CV action
9. Error handling & validation
10. Integration with student/interview modules
11. Testing & polish
