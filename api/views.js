import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, type } = req.body; // type: 'view' or 'unlock'
    
    // Get current counts
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('view_count, unlock_count')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    const updateData = type === 'unlock'
      ? { unlock_count: (idea.unlock_count || 0) + 1 }
      : { view_count: (idea.view_count || 0) + 1 };
    
    const { error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
