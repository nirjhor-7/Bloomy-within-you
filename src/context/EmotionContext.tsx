import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { EmotionEntry, Emotion } from '../utils/emotionData';

interface EmotionContextType {
  entries: EmotionEntry[];
  isLoading: boolean;
  error: string | null;
  addEntry: (emotion: Emotion, note?: string, image?: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<EmotionEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesForDate: (date: Date) => EmotionEntry[];
  getRecentEntries: (limit?: number) => EmotionEntry[];
  loadEntries: () => Promise<void>;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

export const EmotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabaseUser } = useAuth();
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async () => {
    if (!supabaseUser) {
      setEntries([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('emotion_entries')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const transformedEntries: EmotionEntry[] = (data || []).map(entry => ({
        id: entry.id,
        emotion: entry.emotion as Emotion,
        timestamp: new Date(entry.created_at),
        note: entry.note,
        intensity: entry.intensity
      }));

      setEntries(transformedEntries);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load emotion entries';
      setError(message);
      console.error('Emotion load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [supabaseUser?.id]);

  const addEntry = async (emotion: Emotion, note: string = '', image?: string) => {
    if (!supabaseUser) throw new Error('Not authenticated');

    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('emotion_entries')
        .insert([{
          user_id: supabaseUser.id,
          emotion,
          note,
          intensity: 5,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      if (data) {
        const newEntry: EmotionEntry = {
          id: data.id,
          emotion: data.emotion as Emotion,
          timestamp: new Date(data.created_at),
          note: data.note,
          intensity: data.intensity
        };

        setEntries(prev => [newEntry, ...prev]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add emotion entry';
      setError(message);
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<EmotionEntry>) => {
    if (!supabaseUser) throw new Error('Not authenticated');

    setError(null);
    try {
      const updateData: any = {};
      if (updates.emotion) updateData.emotion = updates.emotion;
      if (updates.note !== undefined) updateData.note = updates.note;
      if (updates.intensity !== undefined) updateData.intensity = updates.intensity;

      updateData.updated_at = new Date().toISOString();

      const { data, error: dbError } = await supabase
        .from('emotion_entries')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', supabaseUser.id)
        .select()
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setEntries(prev =>
          prev.map(entry =>
            entry.id === id
              ? {
                  ...entry,
                  emotion: data.emotion as Emotion,
                  note: data.note,
                  intensity: data.intensity
                }
              : entry
          )
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update emotion entry';
      setError(message);
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    if (!supabaseUser) throw new Error('Not authenticated');

    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('emotion_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', supabaseUser.id);

      if (dbError) throw dbError;

      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete emotion entry';
      setError(message);
      throw err;
    }
  };

  const getEntriesForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return entries.filter(entry => entry.timestamp.toDateString() === dateStr);
  };

  const getRecentEntries = (limit = 10) => {
    return entries.slice(0, limit);
  };

  return (
    <EmotionContext.Provider value={{
      entries,
      isLoading,
      error,
      addEntry,
      updateEntry,
      deleteEntry,
      getEntriesForDate,
      getRecentEntries,
      loadEntries
    }}>
      {children}
    </EmotionContext.Provider>
  );
};
