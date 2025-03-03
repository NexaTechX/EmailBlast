import { Suspense } from "react";
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./components/home";
import LandingPage from "./pages/landing";
import AuthPage from "./pages/auth";
import PricingPage from "./pages/pricing";
import AboutPage from "./pages/about";
import { AuthProvider, useAuth } from "./lib/auth";
import AuthCallback from "./pages/auth/callback";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { AppLayout } from "./components/layout/app-layout";
import { DashboardOverview } from "./components/dashboard/dashboard-overview";
import { CampaignList } from "./components/campaign/campaign-list";
import { SubscriberLists } from "./components/subscriber/subscriber-list";
import { AdvancedAnalyticsDashboard } from "./components/analytics/advanced-analytics-dashboard";
import { SettingsLayout } from "./components/settings/settings-layout";
import { ProfileSettings } from "./components/settings/profile-settings";
import { SubscriptionSettings } from "./components/settings/subscription-settings";
import { PreferencesSettings } from "./components/settings/preferences-settings";
import { SecuritySettings } from "./components/security/security-settings";
import { TeamManagement } from "./components/collaboration/team-management";
import { DocumentationCenter } from "./components/documentation/documentation-center";
import { MobileAppPreview } from "./components/mobile/mobile-app-preview";
import { SEOOptimization } from "./components/seo/seo-optimization";
import { ComplianceChecker } from "./components/compliance/compliance-checker";
import { ABTestingTool } from "./components/ab-testing/ab-testing-tool";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isEmailVerified } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Email verification is handled by Supabase's built-in flow
  // No need to check isEmailVerified anymore

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
            <Route path="/auth/callback" element={<AuthCallback />} />
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
                          <AdvancedAnalyticsDashboard
                            campaignId={
                              window.location.pathname.split("/")[3] ||
                              "overview"
                            }
                          />
                        }
                      />
                      <Route
                        path="/subscribers"
                        element={<SubscriberLists />}
                      />
                      <Route
                        path="/analytics"
                        element={
                          <AdvancedAnalyticsDashboard campaignId="overview" />
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
                        <Route path="security" element={<SecuritySettings />} />
                        <Route path="team" element={<TeamManagement />} />
                      </Route>
                      <Route
                        path="/documentation"
                        element={<DocumentationCenter />}
                      />
                      <Route path="/mobile" element={<MobileAppPreview />} />
                      <Route path="/seo" element={<SEOOptimization />} />
                      <Route
                        path="/compliance"
                        element={<ComplianceChecker />}
                      />
                      <Route path="/ab-testing" element={<ABTestingTool />} />
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
