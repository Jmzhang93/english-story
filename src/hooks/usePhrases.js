import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

export const usePhrases = () => {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhrases();

    // 实时订阅数据变化
    const subscription = supabase
      .channel('phrases_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'phrases' }, () => {
        fetchPhrases();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const fetchPhrases = async () => {
    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhrases(data);
    }
    setLoading(false);
  };

  const addPhrase = useCallback(async (phrase, meaning) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    const newPhrase = {
      id,
      phrase: phrase.trim(),
      meaning: meaning.trim(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('phrases').insert([newPhrase]);
    if (error) {
      console.error('Error adding phrase:', error);
      return null;
    }
    return newPhrase;
  }, []);

  const updatePhrase = useCallback(async (id, phrase, meaning) => {
    const { error } = await supabase
      .from('phrases')
      .update({ phrase: phrase.trim(), meaning: meaning.trim() })
      .eq('id', id);

    if (error) {
      console.error('Error updating phrase:', error);
    }
  }, []);

  const deletePhrase = useCallback(async (id) => {
    const { error } = await supabase.from('phrases').delete().eq('id', id);
    if (error) {
      console.error('Error deleting phrase:', error);
    }
  }, []);

  const searchPhrases = useCallback((query) => {
    if (!query || !query.trim()) return phrases;
    const lowerQuery = query.toLowerCase();
    return phrases.filter(
      p =>
        p.phrase.toLowerCase().includes(lowerQuery) ||
        p.meaning.toLowerCase().includes(lowerQuery)
    );
  }, [phrases]);

  return {
    phrases,
    loading,
    addPhrase,
    updatePhrase,
    deletePhrase,
    searchPhrases,
  };
};