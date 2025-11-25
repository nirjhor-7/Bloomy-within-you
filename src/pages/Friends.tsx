import React, { useState } from 'react';
import { Search, Users, Heart } from 'lucide-react';

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8 pt-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-10 w-10 text-purple-400" />
            <h1 className="text-4xl font-serif font-light text-white">Friends & Connections</h1>
          </div>
          <p className="text-gray-400 text-lg">Build meaningful connections on your wellness journey</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="dark-card rounded-2xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'friends'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Users className="h-4 w-4" />
              Friends (0)
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Search className="h-4 w-4" />
              Discover
            </button>
          </div>
        </div>

        <div className="dark-card rounded-3xl p-8">
          {activeTab === 'friends' && (
            <div>
              <h2 className="text-2xl font-serif font-light text-white mb-6 flex items-center gap-3">
                <Heart className="h-6 w-6 text-purple-400" />
                Your Friends
              </h2>

              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No friends yet</h3>
                <p className="text-gray-400 mb-6">Start building your support network by connecting with others</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300"
                >
                  Discover Friends
                </button>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <h2 className="text-2xl font-serif font-light text-white mb-6 flex items-center gap-3">
                <Search className="h-6 w-6 text-blue-400" />
                Discover Friends
              </h2>

              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Friends feature coming soon</h3>
                <p className="text-gray-400">We're building a way for you to connect with the wellness community</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
