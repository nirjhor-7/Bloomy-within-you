import React, { useState } from 'react';
import { Search, HelpCircle, Plus, ArrowLeft, Camera, Edit3, Trash2, Heart } from 'lucide-react';
import { emotions, getEmotionsByCategory, Emotion, getCategoryColor } from '../utils/emotionData';
import { useEmotion } from '../context/EmotionContext';

const EmotionTracker: React.FC = () => {
  const [view, setView] = useState<'selection' | 'checkin' | 'journal'>('selection');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { entries, addEntry, getRecentEntries } = useEmotion();

  const filteredEmotions = emotions.filter(emotion =>
    emotion.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setView('checkin');
  };

  const handleSaveEntry = async () => {
    if (selectedEmotion) {
      setIsSaving(true);
      try {
        await addEntry(selectedEmotion, note);
        setNote('');
        setSelectedEmotion(null);
        setView('journal');
      } catch (err) {
        console.error('Failed to save emotion entry:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (view === 'selection') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="px-6 pt-16 pb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-serif font-light mb-2">Check in to track</h1>
              <h2 className="text-4xl font-serif font-light">your emotions</h2>
            </div>
            <div className="flex gap-4">
              <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <Search className="h-6 w-6" />
              </button>
              <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <HelpCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search emotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Emotion Bubbles */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-3 gap-4">
            {filteredEmotions.map((emotion, index) => (
              <button
                key={emotion.id}
                onClick={() => handleEmotionSelect(emotion)}
                className={`${emotion.bgColor} aspect-square rounded-3xl flex flex-col items-center justify-center text-white font-medium text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeInUp`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-2xl mb-2">{emotion.icon}</span>
                <span className="text-center px-2">{emotion.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setView('journal')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Edit3 className="h-5 w-5" />
              <span>View Journal</span>
            </button>
            <div className="text-gray-500 text-sm">
              {entries.length} entries logged
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'checkin') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="px-6 pt-16 pb-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setView('selection')}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-serif font-light">How are you feeling?</h1>
          </div>
        </div>

        {/* Selected Emotion Display */}
        {selectedEmotion && (
          <div className="px-6 mb-8">
            <div className={`${selectedEmotion.bgColor} rounded-3xl p-8 text-center mb-6`}>
              <div className="text-6xl mb-4">{selectedEmotion.icon}</div>
              <h2 className="text-3xl font-serif font-light mb-2">I'm feeling</h2>
              <h3 className="text-4xl font-serif font-bold">{selectedEmotion.name.toLowerCase()}</h3>
            </div>

            {/* Timestamp */}
            <div className="text-center text-gray-400 mb-8">
              {formatDateTime(new Date())}
            </div>

            {/* Note Input */}
            <div className="mb-8">
              <label className="block text-gray-300 mb-4 font-medium">
                What's on your mind? (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share your thoughts, what triggered this feeling, or anything else you'd like to remember..."
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors min-h-[120px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setView('selection');
                  setSelectedEmotion(null);
                  setNote('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Journal View
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('selection')}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-serif font-light">Check in to learn about</h1>
              <h2 className="text-3xl font-serif font-light">your emotions</h2>
            </div>
          </div>
          <button
            onClick={() => setView('selection')}
            className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="px-6 pb-20">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-serif font-light mb-2">No entries yet</h3>
            <p className="text-gray-400 mb-8">Start tracking your emotions to see patterns over time</p>
            <button
              onClick={() => setView('selection')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300"
            >
              Add Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {getRecentEntries(20).map((entry, index) => (
              <div
                key={entry.id}
                className="bg-gray-900 rounded-3xl overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${entry.emotion.bgColor} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{entry.emotion.icon}</span>
                      <div>
                        <div className="text-sm opacity-90">{formatTime(entry.timestamp)}</div>
                        <div className="text-xl font-serif">
                          I'm feeling <span className="font-bold">{entry.emotion.name.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>
                    <Heart className="h-6 w-6 opacity-70" />
                  </div>
                </div>
                
                {entry.note && (
                  <div className="p-6 text-gray-300 leading-relaxed">
                    {entry.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionTracker;