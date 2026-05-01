import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import ToastContainer from "@/components/ToastContainer";

const LoginPage = lazy(() => import("@/app/(auth)/login/page"));
const RegisterPage = lazy(() => import("@/app/(auth)/register/page"));
const DashboardPage = lazy(() => import("@/app/(dashboard)/page"));
const AdminDashboardPage = lazy(() => import("@/app/(dashboard)/admin-dashboard/page"));
const StudentDashboardPage = lazy(() => import("@/app/(dashboard)/student-dashboard/page"));
const CompanyDashboardPage = lazy(() => import("@/app/(dashboard)/company-dashboard/page"));
const CompanyRepDashboardPage = lazy(() => import("@/app/(dashboard)/company-rep-dashboard/page"));
const StaffDashboardPage = lazy(() => import("@/app/(dashboard)/staff-dashboard/page"));
const SecurityDashboardPage = lazy(() => import("@/app/(dashboard)/security-dashboard/page"));
const ProfilePage = lazy(() => import("@/app/(dashboard)/profile/page"));
const CompaniesPage = lazy(() => import("@/app/(dashboard)/companies/page"));
const CompanyDetailPage = lazy(() => import("@/app/(dashboard)/companies/[id]/page"));
const CompanyEditPage = lazy(() => import("@/app/(dashboard)/companies/[id]/edit/page"));
const TracksPage = lazy(() => import("@/app/(dashboard)/tracks/page"));
const TrackDetailPage = lazy(() => import("@/app/(dashboard)/tracks/[id]/page"));
const TrackEditPage = lazy(() => import("@/app/(dashboard)/tracks/[id]/edit/page"));
const EventsPage = lazy(() => import("@/app/(dashboard)/events/page"));
const JobProfilesPage = lazy(() => import("@/app/(dashboard)/job-profiles/page"));
const InterviewsPage = lazy(() => import("@/app/(dashboard)/interviews/page"));
const StudentCVsPage = lazy(() => import("@/app/(dashboard)/student-cvs/page"));
const AttendancePage = lazy(() => import("@/app/(dashboard)/attendance/page"));
const FeedbackPage = lazy(() => import("@/app/(dashboard)/feedback/page"));
const UsersPage = lazy(() => import("@/app/(dashboard)/users/page"));
const UserDetailPage = lazy(() => import("@/app/(dashboard)/users/[id]/page"));
const UserEditPage = lazy(() => import("@/app/(dashboard)/users/[id]/edit/page"));
const StudentsPage = lazy(() => import("@/app/(dashboard)/students/page"));
const StudentDetailPage = lazy(() => import("@/app/(dashboard)/students/[id]/page"));
const JobFairPage = lazy(() => import("@/app/job-fair/page"));
const JobFairTokenPage = lazy(() => import("@/app/job-fair/[token]/page"));
const DashboardLayout = lazy(() => import("@/app/(dashboard)/layout"));

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" />
    </div>
  );
}

function DashboardRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardLayout>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/admin-dashboard" component={AdminDashboardPage} />
          <Route path="/student-dashboard" component={StudentDashboardPage} />
          <Route path="/company-dashboard" component={CompanyDashboardPage} />
          <Route path="/company-rep-dashboard" component={CompanyRepDashboardPage} />
          <Route path="/staff-dashboard" component={StaffDashboardPage} />
          <Route path="/security-dashboard" component={SecurityDashboardPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/companies" component={CompaniesPage} />
          <Route path="/companies/:id/edit" component={CompanyEditPage} />
          <Route path="/companies/:id" component={CompanyDetailPage} />
          <Route path="/tracks" component={TracksPage} />
          <Route path="/tracks/:id/edit" component={TrackEditPage} />
          <Route path="/tracks/:id" component={TrackDetailPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/job-profiles" component={JobProfilesPage} />
          <Route path="/interviews" component={InterviewsPage} />
          <Route path="/student-cvs" component={StudentCVsPage} />
          <Route path="/attendance" component={AttendancePage} />
          <Route path="/feedback" component={FeedbackPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/users/:id/edit" component={UserEditPage} />
          <Route path="/users/:id" component={UserDetailPage} />
          <Route path="/students" component={StudentsPage} />
          <Route path="/students/:id" component={StudentDetailPage} />
        </Switch>
      </DashboardLayout>
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <Suspense fallback={<PageLoading />}><LoginPage /></Suspense>
      </Route>
      <Route path="/register">
        <Suspense fallback={<PageLoading />}><RegisterPage /></Suspense>
      </Route>
      <Route path="/job-fair/:token">
        {(params) => (
          <Suspense fallback={<PageLoading />}><JobFairTokenPage /></Suspense>
        )}
      </Route>
      <Route path="/job-fair">
        <Suspense fallback={<PageLoading />}><JobFairPage /></Suspense>
      </Route>
      <Route>
        <DashboardRoutes />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <ToastContainer />
    </>
  );
}

export default App;
