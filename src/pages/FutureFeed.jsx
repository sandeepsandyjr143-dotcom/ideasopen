import { useState, useEffect } from 'react';
import { Cpu, AlertCircle, RefreshCw } from 'lucide-react';
import IdeaCard from '../components/IdeaCard';
import SkeletonCard from '../components/SkeletonCard';
import CategoryTabs from '../components/CategoryTabs';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['All', 'Apps', 'AI Tools', 'APK', 'Courses', 'Resources', 'Dev Tools'];

export default function FutureFeed() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { fetchIdeas(); }, []);

  const fetchIdeas = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.from('ideas').select('*').eq('section', 'futurefeed').eq('status', 'published').order('created_at', { ascending: false });
      if (error) throw error;
      const validIdeas = (data || []).filter(i => i && i.id && i.slug);
      setIdeas(validIdeas);
    } catch (err) {
      setError('Failed to load resources. Please try again.');
    } finally { setLoading(false); }
  };

  const filtered = activeCategory === 'All' 
    ? ideas 
    : ideas.filter((i) => i && (i.category || 'Uncategorized') === activeCategory);

  return (
    <div className="min-h-screen bg-secondary pb-20 md:pb-8">
      <div className="bg-gradient-to-r from-secondary to-purple-900 px-4 py-7 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1.5">
            <Cpu size={26} className="text-accent" />
            <h1 className="font-poppins font-bold text-xl sm:text-2xl text-white">FutureFeed</h1>
          </div>
          <p className="text-white/80 text-xs sm:text-sm">Apps, AI tools, APK links, courses & tech resources</p>
        </div>
      </div>

      <div className="sticky top-14 z-40 bg-secondary py-1.5 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <CategoryTabs categories={CATEGORIES} activeCategory={activeCategory} onCategoryChange={setActiveCategory} variant="futurefeed" />
        </div>
      </div>

      <div className="px-4 py-5 max-w-7xl mx-auto">
        {error ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <AlertCircle size={40} className="text-white/30" />
            <p className="text-white/50 text-sm">{error}</p>
            <button onClick={fetchIdeas} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium">
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Cpu size={44} className="mx-auto text-white/20 mb-3" />
            <h3 className="font-poppins font-semibold text-white/40 text-sm mb-1">No resources found</h3>
            <p className="text-white/30 text-xs">Check back later for new content</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
          </div>
        )}
      </div>
    </div>
  );
}
