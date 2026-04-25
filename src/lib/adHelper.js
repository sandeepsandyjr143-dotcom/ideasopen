// Ad Gate Helper Functions

export const isUnlocked = (slug) => {
  if (typeof window === 'undefined') return false;
  const key = `unlocked_${slug}`;
  const data = localStorage.getItem(key);
  if (!data) return false;
  
  try {
    const { timestamp } = JSON.parse(data);
    // Unlock valid for 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < twentyFourHours;
  } catch {
    return false;
  }
};

export const markAsUnlocked = (slug) => {
  if (typeof window === 'undefined') return;
  const key = `unlocked_${slug}`;
  localStorage.setItem(key, JSON.stringify({
    timestamp: Date.now(),
    slug
  }));
};

export const getCachedIdeas = () => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem('ideas_cache');
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - timestamp < oneHour) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
};

export const setCachedIdeas = (data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ideas_cache', JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

export const incrementViewCount = async (supabase, id, currentCount) => {
  try {
    await supabase
      .from('ideas')
      .update({ view_count: currentCount + 1 })
      .eq('id', id);
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }
};

export const incrementUnlockCount = async (supabase, id, currentCount) => {
  try {
    await supabase
      .from('ideas')
      .update({ unlock_count: currentCount + 1 })
      .eq('id', id);
  } catch (err) {
    console.error('Failed to increment unlock count:', err);
  }
};
