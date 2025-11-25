import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit3, Save, X, Settings, Users, Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getInitials = () => {
    return user.full_name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8 pt-16">
          <h1 className="text-4xl font-serif font-light text-white mb-2">Your Profile</h1>
          <p className="text-gray-400 text-lg">Manage your wellness journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="dark-card rounded-3xl p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editData.full_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full dark-input p-3 rounded-xl text-xl font-bold"
                        placeholder="Full name"
                      />
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full dark-input p-3 rounded-xl resize-none"
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-1">{user.full_name}</h2>
                      <p className="text-gray-400 mb-2">{user.email}</p>
                      <p className="text-gray-300 leading-relaxed">{user.bio || 'No bio yet'}</p>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-xl transition-all duration-300 btn-interactive disabled:opacity-50"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditData({
                            full_name: user.full_name,
                            bio: user.bio || '',
                          });
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-xl transition-colors"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">0</div>
                  <div className="text-sm text-gray-400">Friends</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-sm text-gray-400">Check-ins</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-sm text-gray-400">Days Active</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl">
                  <div>
                    <div className="text-white font-medium">Email</div>
                    <div className="text-gray-400">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="dark-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/mood-tracker')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors text-left"
                >
                  <Heart className="h-5 w-5 text-pink-400" />
                  <div>
                    <div className="text-white font-medium">Mood Tracker</div>
                    <div className="text-sm text-gray-400">Log your moods</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/emotion-tracker')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors text-left"
                >
                  <Heart className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Emotions</div>
                    <div className="text-sm text-gray-400">Track emotions</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/resources')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors text-left"
                >
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Resources</div>
                    <div className="text-sm text-gray-400">Wellness guides</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full dark-card rounded-3xl p-6 flex items-center justify-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">{isLoading ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
