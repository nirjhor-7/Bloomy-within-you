import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Mood = 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious' | 'energized';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: Mood;
  date: string;
  note: string;
  created_at: string;
  updated_at: string;
}

interface MoodContextType {
  moodEntries: MoodEntry[];
  currentMood: Mood;
  isLoading: boolean;
  error: string | null;
  addMoodEntry: (mood: Mood, note?: string) => Promise<void>;
  updateMoodEntry: (id: string, mood: Mood, note?: string) => Promise<void>;
  deleteMoodEntry: (id: string) => Promise<void>;
  setCurrentMood: (mood: Mood) => void;
  loadMoodEntries: () => Promise<void>;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabaseUser } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState<Mood>('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoodEntries = async () => {
    if (!supabaseUser) {
      setMoodEntries([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('date', { ascending: false });

      if (dbError) throw dbError;
      setMoodEntries(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load mood entries';
      setError(message);
      console.error('Mood load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMoodEntries();
  }, [supabaseUser?.id]);

  const addMoodEntry = async (mood: Mood, note: string = '') => {
    if (!supabaseUser) throw new Error('Not authenticated');

    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error: dbError } = await supabase
        .from('mood_entries')
        .upsert(
          [{
            user_id: supabaseUser.id,
            mood,
            date: today,
            note,
            updated_at: new Date().toISOString()
          }],
          { onConflict: 'user_id, date' }
        )
        .select()
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setMoodEntries(prev => {
          const filtered = prev.filter(e => e.date !== today);
          return [data, ...filtered];
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add mood entry';
      setError(message);
      throw err;
    }
  };

  const updateMoodEntry = async (id: string, mood: Mood, note: string = '') => {
    if (!supabaseUser) throw new Error('Not authenticated');

    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('mood_entries')
        .update({
          mood,
          note,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', supabaseUser.id)
        .select()
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setMoodEntries(prev =>
          prev.map(entry => entry.id === id ? data : entry)
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update mood entry';
      setError(message);
      throw err;
    }
  };

  const deleteMoodEntry = async (id: string) => {
    if (!supabaseUser) throw new Error('Not authenticated');

    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', supabaseUser.id);

      if (dbError) throw dbError;

      setMoodEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete mood entry';
      setError(message);
      throw err;
    }
  };

  return (
    <MoodContext.Provider value={{
      moodEntries,
      currentMood,
      isLoading,
      error,
      addMoodEntry,
      updateMoodEntry,
      deleteMoodEntry,
      setCurrentMood,
      loadMoodEntries
    }}>
      {children}
    </MoodContext.Provider>
  );
};
