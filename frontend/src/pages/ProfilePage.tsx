import React, { useState } from 'react';
import {
  User,
  Shield,
  Mail,
  Phone,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  KeyRound,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../api';

interface Props {
  user: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onOpenVerifyModal: (target: 'email' | 'phone') => void;
}

export const ProfilePage: React.FC<Props> = ({ user, onUserUpdated, onOpenVerifyModal }) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [organization, setOrganization] = useState(user.organization || '');
  const [designation, setDesignation] = useState(user.designation || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.updateProfile({
        full_name: fullName,
        organization,
        designation,
        avatar_url: avatarUrl,
      });
      onUserUpdated(res.user);
      setMsg({ type: 'success', text: 'Officer profile successfully updated!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Officer Profile & Identity Dossier</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official credentials, role delegation, and cryptographic verification status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span>Role: {user.role || 'Analyst'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Account Active</span>
          </span>
        </div>
      </div>

      {msg && (
        <div
          className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
            msg.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: ID Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-gov-700 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-md border-4 border-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.full_name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(user.full_name)
              )}
            </div>
            <span className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-1 border-2 border-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-900">{user.full_name}</h2>
          <p className="text-xs font-medium text-blue-600 mt-0.5">{user.designation || 'Vigilance Officer'}</p>
          <p className="text-[11px] text-slate-500 mt-1">{user.organization || 'Infrastructure Review Cell'}</p>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Security Clearance</span>
              <span className="font-bold text-slate-800">Level 3 (Auditor)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Official ID</span>
              <span className="font-mono text-slate-700 text-[11px]">{user.id.slice(0, 12)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-700">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '2026-01-15'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Verification & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Verification Status Cards */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gov-700" />
              <span>Multi-Factor Verification Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Verification Box */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-800">Email Address</span>
                  </div>
                  {user.is_email_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      <XCircle className="h-3 w-3" /> Unverified
                    </span>
                  )}
                </div>
                <p className="mt-2 font-mono text-xs text-slate-700 break-all">{user.email}</p>
                {!user.is_email_verified && (
                  <button
                    onClick={() => onOpenVerifyModal('email')}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <span>Verify via OTP</span>
                    <KeyRound className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Phone Verification Box */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-800">Mobile Number</span>
                  </div>
                  {user.is_phone_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      <XCircle className="h-3 w-3" /> Unverified
                    </span>
                  )}
                </div>
                <p className="mt-2 font-mono text-xs text-slate-700">{user.phone}</p>
                {!user.is_phone_verified && (
                  <button
                    onClick={() => onOpenVerifyModal('phone')}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <span>Verify via OTP</span>
                    <KeyRound className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Edit Personal Information</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Organization / Institution
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gov-700 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-gov-800 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
