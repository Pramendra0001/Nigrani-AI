import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { UploadPage } from './pages/UploadPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GeoMapPage } from './pages/GeoMapPage';
import { CompliancePage } from './pages/CompliancePage';
import { PredictivePage } from './pages/PredictivePage';
import { EvidencePage } from './pages/EvidencePage';
import { AlertsPage } from './pages/AlertsPage';
import { api } from './api';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'projects' | 'investigation' | 'review' | 'alerts' | 'upload' | 'analytics' | 'settings' | 'geo' | 'compliance' | 'predictive' | 'evidence'
  >('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const refreshReviewCount = async () => {
    try {
      const res = await api.getReviewQueue({ status: 'NEW', page: 1, page_size: 1 });
      setReviewCount(res.total);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshReviewCount();
  }, [activeTab]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('investigation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProjects = () => {
    setActiveTab('projects');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Top Enterprise Platform Header */}
      <Navbar
        onNavigateTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBatchAnalyze={() => refreshReviewCount()}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Responsive Split Layout */}
      <div className="flex flex-1 relative pt-16 w-full min-w-0">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab === 'investigation' ? 'projects' : activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab as any);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          reviewCount={reviewCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Center Canvas */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onSelectProject={handleSelectProject}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'investigation' && selectedProjectId && (
            <InvestigationPage
              projectId={selectedProjectId}
              onBack={handleBackToProjects}
              onSelectOtherProject={handleSelectProject}
            />
          )}

          {activeTab === 'review' && (
            <ReviewQueuePage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'geo' && (
            <GeoMapPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'compliance' && (
            <CompliancePage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'predictive' && (
            <PredictivePage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'evidence' && (
            <EvidencePage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'upload' && (
            <UploadPage
              onUploadSuccess={() => {
                refreshReviewCount();
                setActiveTab('projects');
              }}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;

