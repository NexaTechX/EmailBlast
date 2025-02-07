import { Suspense } from "react";
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./components/home";
import LandingPage from "./pages/landing";
import AuthPage from "./pages/auth";
import PricingPage from "./pages/pricing";
import AboutPage from "./pages/about";
import { AuthProvider, useAuth } from "./lib/auth";
import { Toaster } from "./components/ui/toaster";
import { AppLayout } from "./components/layout/app-layout";
import { DashboardOverview } from "./components/dashboard/dashboard-overview";
import { CampaignList } from "./components/campaign/campaign-list";
import { SubscriberLists } from "./components/subscriber/subscriber-list";
import { AnalyticsDashboard } from "./components/analytics/analytics-dashboard";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/app/*"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<DashboardOverview />} />
                      <Route path="/campaigns" element={<CampaignList />} />
                      <Route path="/campaigns/new" element={<Home />} />
                      <Route path="/campaigns/:id" element={<Home />} />
                      <Route
                        path="/campaigns/:id/analytics"
                        element={
                          <AnalyticsDashboard campaignId="placeholder" />
                        }
                      />
                      <Route
                        path="/subscribers"
                        element={<SubscriberLists />}
                      />
                      <Route
                        path="/analytics"
                        element={
                          <AnalyticsDashboard campaignId="placeholder" />
                        }
                      />
                    </Routes>
                  </AppLayout>
                </PrivateRoute>
              }
            />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Toaster />
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
