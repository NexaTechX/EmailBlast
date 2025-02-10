import { Suspense } from "react";
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./components/home";
import LandingPage from "./pages/landing";
import AuthPage from "./pages/auth";
import PricingPage from "./pages/pricing";
import AboutPage from "./pages/about";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { AppLayout } from "./components/layout/app-layout";
import { DashboardOverview } from "./components/dashboard/dashboard-overview";
import { CampaignList } from "./components/campaign/campaign-list";
import { SubscriberLists } from "./components/subscriber/subscriber-list";
import { AnalyticsDashboard } from "./components/analytics/analytics-dashboard";
import { SettingsLayout } from "./components/settings/settings-layout";
import { ProfileSettings } from "./components/settings/profile-settings";
import { SubscriptionSettings } from "./components/settings/subscription-settings";
import { PreferencesSettings } from "./components/settings/preferences-settings";

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
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <AuthProvider>
        <Suspense fallback={<p>Loading...</p>}>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
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
                      <Route path="/settings" element={<SettingsLayout />}>
                        <Route index element={<ProfileSettings />} />
                        <Route
                          path="subscription"
                          element={<SubscriptionSettings />}
                        />
                        <Route
                          path="preferences"
                          element={<PreferencesSettings />}
                        />
                      </Route>
                    </Routes>
                  </AppLayout>
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
