import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { UploadPage } from './pages/UploadPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './components/AuthModal';
import { api } from './api';
import { UserProfile } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'projects' | 'investigation' | 'review' | 'upload' | 'analytics' | 'profile' | 'settings'
  >('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);

  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nigrani_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
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
    // Validate session on boot if token exists
    const token = localStorage.getItem('nigrani_access_token');
    if (token && !user) {
      api.getMe().then((profile) => setUser(profile)).catch(() => {});
    }
  }, [activeTab]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('investigation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProjects = () => {
    setActiveTab('projects');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Government Platform Header */}
      <Navbar
        user={user}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={handleLogout}
        onBatchAnalyze={() => refreshReviewCount()}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Split Layout */}
      <div className="flex flex-1 relative">
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
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
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

          {activeTab === 'upload' && (
            <UploadPage
              onUploadSuccess={() => {
                refreshReviewCount();
                setActiveTab('projects');
              }}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}

          {activeTab === 'profile' && user && (
            <ProfilePage
              user={user}
              onUserUpdated={(updated) => setUser(updated)}
              onOpenVerifyModal={(target) => {
                setAuthModalMode('register');
                setAuthModalOpen(true);
              }}
            />
          )}

          {activeTab === 'settings' && user && (
            <SettingsPage
              user={user}
              onAccountDeleted={() => {
                setUser(null);
                setActiveTab('dashboard');
              }}
            />
          )}
        </main>
      </div>

      {/* Authentication & Verification Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setAuthModalOpen(false);
        }}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;
