import React, { useState } from 'react';
import { useMood, Mood } from '../context/MoodContext';
import { ArrowLeft, ArrowRight, Calendar, TrendingUp, Heart, Sparkles, AlertCircle } from 'lucide-react';

const getMoodEmoji = (mood: Mood): string => {
  switch (mood) {
    case 'happy': return '😊';
    case 'calm': return '😌';
    case 'neutral': return '😐';
    case 'sad': return '😔';
    case 'anxious': return '😰';
    case 'energized': return '🤩';
    default: return '😐';
  }
};

const MoodTracker: React.FC = () => {
  const { moodEntries, addMoodEntry, updateMoodEntry, isLoading, error } = useMood();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toISOString().split('T')[0];
      const moodEntry = moodEntries.find(entry => entry.date === date);

      days.push({
        day,
        date,
        mood: moodEntry?.mood,
        note: moodEntry?.note,
        id: moodEntry?.id
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayClick = (date: string | null) => {
    if (!date) return;

    setSelectedDate(date);
    const moodEntry = moodEntries.find(entry => entry.date === date);

    if (moodEntry) {
      setSelectedMood(moodEntry.mood);
      setNote(moodEntry.note || '');
    } else {
      setSelectedMood(null);
      setNote('');
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleSaveMood = async () => {
    if (selectedDate && selectedMood) {
      setIsSaving(true);
      try {
        const moodEntry = moodEntries.find(entry => entry.date === selectedDate);

        if (moodEntry) {
          await updateMoodEntry(moodEntry.id, selectedMood, note);
        } else {
          await addMoodEntry(selectedMood, note);
        }

        setSelectedDate(null);
        setSelectedMood(null);
        setNote('');
      } catch (err) {
        console.error('Failed to save mood:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDays = generateCalendarDays();

  const moodOptions: Mood[] = ['happy', 'calm', 'neutral', 'sad', 'anxious', 'energized'];

  const getMoodStats = () => {
    if (moodEntries.length === 0) return null;

    const moodCounts = moodOptions.reduce((acc, mood) => {
      acc[mood] = moodEntries.filter(entry => entry.mood === mood).length;
      return acc;
    }, {} as Record<Mood, number>);

    const totalEntries = moodEntries.length;
    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) =>
      moodCounts[a[0] as Mood] > moodCounts[b[0] as Mood] ? a : b
    )[0] as Mood;

    return { moodCounts, totalEntries, mostCommonMood };
  };

  const stats = getMoodStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your mood data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8 pt-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Calendar className="h-10 w-10 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
            </div>
            <h1 className="text-4xl font-serif font-light text-white">Mood Calendar</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Track your emotional journey and discover patterns in your wellbeing
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-2xl p-4 mb-6 flex gap-3 text-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="dark-card rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-3 rounded-full hover:bg-gray-700 transition-colors btn-interactive"
            >
              <ArrowLeft className="h-6 w-6 text-gray-300" />
            </button>

            <h2 className="text-2xl font-serif font-light text-white">{formatMonthYear(currentMonth)}</h2>

            <button
              onClick={handleNextMonth}
              className="p-3 rounded-full hover:bg-gray-700 transition-colors btn-interactive"
            >
              <ArrowRight className="h-6 w-6 text-gray-300" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-400 py-3">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => handleDayClick(day.date)}
                className={`calendar-day aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300 mood-card ${
                  day.date === selectedDate
                    ? 'selected ring-4 ring-purple-500'
                    : day.date
                      ? 'cursor-pointer'
                      : ''
                }`}
              >
                {day.day && (
                  <>
                    <span className="text-sm font-medium text-gray-300 mb-1">{day.day}</span>
                    {day.mood && (
                      <div className="relative">
                        <span className="text-2xl" title={day.mood}>
                          {getMoodEmoji(day.mood)}
                        </span>
                        <div className="absolute inset-0 bg-yellow-300/20 rounded-full blur-sm"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="dark-card rounded-3xl p-6 mb-6 animate-fadeInUp">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <h3 className="text-xl font-serif font-light text-white">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4 font-medium">How are you feeling today?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moodOptions.map(mood => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className={`py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 mood-card font-medium ${
                      selectedMood === mood
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:shadow-md'
                    }`}
                  >
                    <span className="text-2xl">{getMoodEmoji(mood)}</span>
                    <span className="capitalize">{mood}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="note" className="block text-gray-300 font-medium mb-3">
                Journal Entry (optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind today? How are you feeling? What happened that influenced your mood?"
                className="w-full dark-input p-4 rounded-2xl focus:outline-none focus:border-purple-500 transition-colors min-h-[120px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedMood(null);
                  setNote('');
                }}
                className="px-6 py-3 text-gray-400 hover:bg-gray-800 rounded-2xl transition-colors font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveMood}
                disabled={!selectedMood || isSaving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 btn-interactive font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}

        {!selectedDate && stats && (
          <div className="dark-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <h3 className="text-xl font-serif font-light text-white">Your Mood Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/20">
                <h4 className="font-semibold text-gray-300 mb-2">Total Entries</h4>
                <p className="text-3xl font-bold text-purple-400">{stats.totalEntries}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 border border-blue-500/20">
                <h4 className="font-semibold text-gray-300 mb-2">Most Common Mood</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(stats.mostCommonMood)}</span>
                  <span className="text-xl font-bold text-blue-400 capitalize">{stats.mostCommonMood}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-300 mb-4">Mood Distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moodOptions.map(mood => {
                  const count = stats.moodCounts[mood];
                  if (count === 0) return null;

                  return (
                    <div
                      key={mood}
                      className="bg-gray-800/70 rounded-2xl p-4 text-center mood-card border border-gray-700"
                    >
                      <div className="text-2xl mb-2">{getMoodEmoji(mood)}</div>
                      <div className="font-medium text-gray-300 capitalize mb-1">{mood}</div>
                      <div className="text-sm text-gray-500">{count} {count === 1 ? 'entry' : 'entries'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-green-400" />
                <h4 className="font-semibold text-gray-300">Keep Going!</h4>
              </div>
              <p className="text-gray-400">
                Tracking your moods helps you understand your emotional patterns and triggers.
                The more consistently you log your feelings, the more insights you'll gain about your mental wellbeing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
