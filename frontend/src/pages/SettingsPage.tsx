import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Lock,
  Smartphone,
  Laptop,
  Bell,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, UserSessionItem } from '../types';
import { api } from '../api';

interface Props {
  user: UserProfile;
  onAccountDeleted: () => void;
}

export const SettingsPage: React.FC<Props> = ({ user, onAccountDeleted }) => {
  const [activeSection, setActiveSection] = useState<'security' | 'sessions' | 'notifications' | 'data' | 'danger'>('security');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsMsg, setSessionsMsg] = useState<string | null>(null);

  // Notification toggles
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyDuplicate, setNotifyDuplicate] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(false);
  const [notifySms, setNotifySms] = useState(false);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await api.listSessions();
      setSessions(res);
    } catch {
      // ignore
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setPwdLoading(true);
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPwdMsg({ type: 'success', text: 'Security credentials updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      await api.revokeOtherSessions();
      setSessionsMsg('Logged out from all other devices successfully.');
      loadSessions();
    } catch (err: any) {
      setSessionsMsg('Failed to revoke sessions: ' + err.message);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      export_timestamp: new Date().toISOString(),
      platform: 'Nigrani AI — Public Project Intelligence Platform',
      security_classification: 'Official Auditor Copy',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nigrani_account_dossier_${user.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }
    setDeleteLoading(true);
    try {
      await api.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      onAccountDeleted();
    } catch (err: any) {
      setDeleteError(err.message || 'Account deletion failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gov-700" />
          <span>Account Settings & Governance Controls</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage credentials, active login stations, vigilance notification triggers, and data controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveSection('security')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeSection === 'security'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => setActiveSection('sessions')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeSection === 'sessions'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Active Sessions ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeSection === 'notifications'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Vigilance Alerts</span>
          </button>

          <button
            onClick={() => setActiveSection('data')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeSection === 'data'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Privacy & Data Dossier</span>
          </button>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => setActiveSection('danger')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                activeSection === 'danger'
                  ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span>Danger Zone</span>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3">
          {/* 1. PASSWORD & SECURITY */}
          {activeSection === 'security' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Change Account Password</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your account password. All changes require re-authentication.
                </p>
              </div>

              {pwdMsg && (
                <div
                  className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
                    pwdMsg.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  {pwdMsg.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Strong Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="rounded-lg bg-gov-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-gov-800 disabled:opacity-50"
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* 2. ACTIVE SESSIONS */}
          {activeSection === 'sessions' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Active Login Sessions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Devices and IP addresses currently authenticated to your vigilance workspace.
                  </p>
                </div>
                <button
                  onClick={handleRevokeOtherSessions}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out Other Sessions</span>
                </button>
              </div>

              {sessionsMsg && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                  {sessionsMsg}
                </div>
              )}

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        {sess.device_info.toLowerCase().includes('mobile') ||
                        sess.device_info.toLowerCase().includes('android') ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Laptop className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {sess.device_info.slice(0, 45)}
                          </span>
                          {sess.is_current && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          IP: {sess.ip_address} • Logged in: {new Date(sess.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Vigilance & Anomaly Triggers</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure automated dispatch alerts for public infrastructure anomalies.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Critical & High Risk Project Flags</h4>
                    <p className="text-[11px] text-slate-500">
                      Notify immediately when an uploaded project scores over 80/100 risk.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyCritical}
                    onChange={(e) => setNotifyCritical(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Geospatial Duplicate Warnings</h4>
                    <p className="text-[11px] text-slate-500">
                      Alert when two tenders overlap within 500m radius with matching budgets.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyDuplicate}
                    onChange={(e) => setNotifyDuplicate(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Weekly Executive Digest (PDF)</h4>
                    <p className="text-[11px] text-slate-500">
                      Receive automated weekly analytical summary every Monday at 08:00 AM IST.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyWeekly}
                    onChange={(e) => setNotifyWeekly(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. PRIVACY & DATA */}
          {activeSection === 'data' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Privacy & Data Governance</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export complete personal and audit records in standardized JSON.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-xs font-bold text-slate-800">Official Data Dossier</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Downloads all account profile details, security logs, and role credentials.
                </p>
                <button
                  onClick={handleExportData}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  <span>Download JSON Dossier</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. DANGER ZONE */}
          {activeSection === 'danger' && (
            <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-sm font-bold">Danger Zone: Account Deletion</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permanently deletes your vigilance officer profile, cryptographic session keys, and verification
                records from the Nigrani AI system. This action is irrevocable.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-700"
                >
                  Permanently Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Irrevocable Account Deletion</span>
            </div>

            <p className="text-xs text-slate-600">
              Please enter your password and type <span className="font-mono font-bold text-rose-600">DELETE</span> to confirm permanent deletion.
            </p>

            {deleteError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
