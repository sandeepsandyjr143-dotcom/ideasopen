import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, AlertCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import IdeaCard from '../components/IdeaCard';
import SkeletonCard from '../components/SkeletonCard';
import { supabase } from '../lib/supabase';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery);
    else fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.from('ideas').select('*').eq('status', 'published').order('created_at', { ascending: false });
      if (error) throw error;
      const validIdeas = (data || []).filter(i => i && i.id && i.slug);
      setIdeas(validIdeas);
    } catch { setError('Failed to load ideas.'); }
    finally { setLoading(false); }
  };

  const performSearch = async (q) => {
    setLoading(true); setError(null); setQuery(q); setSearchParams({ q });
    try {
      const { data, error } = await supabase.from('ideas').select('*').eq('status', 'published')
        .or(`title.ilike.%${q}%,short_description.ilike.%${q}%,category.ilike.%${q}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const validIdeas = (data || []).filter(i => i && i.id && i.slug);
      setIdeas(validIdeas);
    } catch { setError('Search failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? ideas : ideas.filter((i) => i.section === filter);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="bg-white px-4 py-5 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-poppins font-bold text-lg sm:text-xl text-secondary mb-3">Search Ideas</h1>
          <SearchBar onSearch={performSearch} initialValue={query} />
        </div>
      </div>

      <div className="px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          {['all', 'business', 'futurefeed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap transition-colors min-h-[38px] ${
                filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'business' ? 'Business' : 'FutureFeed'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 max-w-7xl mx-auto">
        {query && !loading && !error && (
          <p className="text-gray-500 text-xs sm:text-sm mb-3">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"
          </p>
        )}

        {error ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <AlertCircle size={40} className="text-gray-300" />
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon size={44} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-poppins font-semibold text-gray-500 text-sm mb-1">
              {query ? 'No results found' : 'Start searching'}
            </h3>
            <p className="text-gray-400 text-xs">
              {query ? 'Try different keywords' : 'Enter keywords to find ideas'}
            </p>
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
