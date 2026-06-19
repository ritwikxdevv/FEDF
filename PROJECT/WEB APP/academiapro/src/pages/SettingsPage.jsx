import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { 
  User, 
  Lock, 
  Bell, 
  Mail, 
  Camera, 
  Shield, 
  Smartphone, 
  Activity 
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [bio, setBio] = useState('Computer Science Department, Year 3.'); // Default dummy bio as in original UI
  
  // Feedback Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'account', label: 'Account Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Fetch authenticated user profile on load
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch('/api/auth/profile');
      const nameParts = (data.name || '').trim().split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(data.email || '');
      setRole(data.role || 'student');
    } catch (err) {
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Update Profile Submit Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const updated = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: email.trim().toLowerCase()
        })
      });
      
      // Update local storage in case username/email is cached there
      localStorage.setItem('userName', updated.name);
      
      const nameParts = (updated.name || '').trim().split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(updated.email || '');
      setSuccess('Profile updated successfully!');
      
      // Optional: Dispatch storage event so other components refresh user info immediately
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  // Update Password Submit Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          password: newPassword
        })
      });
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 bg-surface min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-sm text-on-surface-variant">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-surface min-h-full">
      
      {/* Header */}
      <div className="mb-8 fade-in-up">
        <h1 className="text-headline-md font-semibold text-on-surface">Settings</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">Manage your account preferences and system configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 fade-in-up fade-in-up-1">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                  setSuccess('');
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-body-sm font-semibold transition-all duration-200 border
                  ${isActive 
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' 
                    : 'text-on-surface-variant border-transparent hover:bg-surface-container hover:text-on-surface'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-outline'} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 fade-in-up">
              <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-body-base font-bold text-on-surface">Profile Details</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    {role}
                  </span>
                </div>
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-outline-variant/40">
                  <div className="relative group cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-surface-container-highest border-2 border-outline-variant flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50">
                      <User size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-surface rounded-full shadow-md hover:bg-primary-container transition-transform active:scale-95">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-body-base font-semibold text-on-surface">Avatar</h3>
                    <p className="text-[12px] text-on-surface-variant mt-1 font-medium">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                {/* Feedback Messages */}
                {error && (
                  <p className="mb-4 text-body-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-md px-4 py-2.5">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="mb-4 text-body-sm text-green-400 bg-green-900/20 border border-green-700/40 rounded-md px-4 py-2.5">
                    {success}
                  </p>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="input-field w-full py-2.5" 
                        required 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="input-field w-full py-2.5" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="input-field w-full pl-11 py-2.5" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">Bio / Department</label>
                    <textarea 
                      rows="3" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      className="input-field w-full py-3 resize-none" 
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="btn-primary px-6 py-2.5 shadow-sm disabled:opacity-60"
                    >
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Account Security Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6 fade-in-up">
              
              {/* Password Section */}
              <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-card">
                <h2 className="text-body-base font-bold text-on-surface mb-6">Change Password</h2>

                {/* Password Alerts */}
                {passwordError && (
                  <p className="mb-4 text-body-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-md px-4 py-2.5">
                    {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p className="mb-4 text-body-sm text-green-400 bg-green-900/20 border border-green-700/40 rounded-md px-4 py-2.5">
                    {passwordSuccess}
                  </p>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="input-field w-full pl-11 py-2.5" 
                      />
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-outline-variant/30 my-2" />
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Must be at least 8 characters" 
                        className="input-field w-full pl-11 py-2.5" 
                        required 
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-label-caps text-on-surface-variant uppercase tracking-widest font-bold">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password" 
                        className="input-field w-full pl-11 py-2.5" 
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={updatingPassword}
                      className="btn-primary px-6 py-2.5 shadow-sm disabled:opacity-60"
                    >
                      {updatingPassword ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* 2FA Section */}
              <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-body-base font-bold text-on-surface flex items-center gap-2 mb-2">
                    <Shield size={18} className="text-primary"/> Two-Factor Authentication
                  </h2>
                  <p className="text-body-sm text-on-surface-variant font-medium max-w-md">
                    Add an extra layer of security to your account by requiring a verification code upon login.
                  </p>
                </div>
                <button type="button" className="btn-ghost shrink-0 bg-surface-container-low font-semibold shadow-sm">Enable 2FA</button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 fade-in-up">
              <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-card">
                <h2 className="text-body-base font-bold text-on-surface mb-8">Notification Preferences</h2>
                
                <div className="space-y-8">
                  {/* Email Toggle */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-on-surface-variant shrink-0 shadow-sm">
                        <Mail size={18} />
                      </div>
                      <div>
                        <h3 className="text-body-sm font-bold text-on-surface">Email Notifications</h3>
                        <p className="text-[12px] text-on-surface-variant mt-1 font-medium">Receive important updates, exam alerts and result summaries via email.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>

                  <div className="w-full h-px bg-outline-variant/40" />

                  {/* Push Toggle */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-on-surface-variant shrink-0 shadow-sm">
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <h3 className="text-body-sm font-bold text-on-surface">Push Notifications</h3>
                        <p className="text-[12px] text-on-surface-variant mt-1 font-medium">Get live updates and real-time reminders directly in your browser.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>
                  
                  <div className="w-full h-px bg-outline-variant/40" />

                  {/* Activity Toggle */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-on-surface-variant shrink-0 shadow-sm">
                        <Activity size={18} />
                      </div>
                      <div>
                        <h3 className="text-body-sm font-bold text-on-surface">Weekly Progress Reports</h3>
                        <p className="text-[12px] text-on-surface-variant mt-1 font-medium">Receive a weekly summary of your learning progress and upcoming tasks.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
