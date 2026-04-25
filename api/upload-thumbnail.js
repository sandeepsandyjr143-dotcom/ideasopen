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
    const { fileName, contentType, data } = req.body;
    if (!fileName || !contentType || !data) {
      return res.status(400).json({ error: 'Missing upload payload' });
    }

    const buffer = Buffer.from(data, 'base64');
    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    if (urlError) {
      throw urlError;
    }

    return res.status(200).json({ publicUrl: urlData.publicUrl });
  } catch (err) {
    console.error('Upload API error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
