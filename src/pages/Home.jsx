import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Cpu, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import IdeaCard from '../components/IdeaCard';
import SkeletonCard from '../components/SkeletonCard';
import { supabase } from '../lib/supabase';
import { getCachedIdeas, setCachedIdeas } from '../lib/adHelper';

export default function Home() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchIdeas(); }, []);

  const fetchIdeas = async () => {
    const cached = getCachedIdeas();
    if (cached) { setIdeas(cached); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('ideas').select('*').eq('status', 'published').order('created_at', { ascending: false });
      if (error) throw error;
      const validIdeas = (data || []).filter(i => i && i.id && i.slug);
      setIdeas(validIdeas);
      setCachedIdeas(validIdeas);
    } catch (err) {
      setError('Could not load ideas. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const trendingIdeas = ideas.slice(0, 4);
  const latestIdeas = ideas.slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-[#D55500] to-[#C04400] px-4 py-10 sm:py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={15} className="text-yellow-300" />
            <span className="text-white text-xs sm:text-sm font-medium">Free Ideas & Resources</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl sm:text-4xl text-white mb-3 leading-tight">
            Ideas Open Here 🔥
          </h1>
          <p className="text-white/90 text-sm sm:text-lg mb-6 px-2">
            Watch 30 seconds, unlock any idea for free!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-2">
            <Link
              to="/business"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all min-h-[48px] shadow-md text-sm sm:text-base"
            >
              <Briefcase size={18} />
              Explore Business
            </Link>
            <Link
              to="/futurefeed"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 active:scale-[0.97] transition-all min-h-[48px] shadow-md text-sm sm:text-base"
            >
              <Cpu size={18} />
              Explore Tech
            </Link>
          </div>
        </div>
      </section>

      {/* Section Cards */}
      <section className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/business"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#C04400] p-5 sm:p-6 text-white hover:shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="relative z-10">
              <Briefcase size={36} className="mb-3 opacity-90" />
              <h2 className="font-poppins font-bold text-lg sm:text-xl mb-1.5">Business & Hustle</h2>
              <p className="text-white/80 text-xs sm:text-sm mb-4">
                Franchise ideas, startups, money guides & hustle docs
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                Explore <ArrowRight size={15} />
              </span>
            </div>
            <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full" />
          </Link>

          <Link
            to="/futurefeed"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-purple-900 p-5 sm:p-6 text-white hover:shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="relative z-10">
              <Cpu size={36} className="mb-3 opacity-90" />
              <h2 className="font-poppins font-bold text-lg sm:text-xl mb-1.5">FutureFeed</h2>
              <p className="text-white/80 text-xs sm:text-sm mb-4">
                Apps, APK links, AI tools, tech resources & courses
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                Explore <ArrowRight size={15} />
              </span>
            </div>
            <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full" />
          </Link>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
          {error}{' '}
          <button onClick={fetchIdeas} className="underline font-medium">Retry</button>
        </div>
      )}

      {/* Trending */}
      <section className="px-4 pb-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-poppins font-semibold text-secondary text-base sm:text-lg">Trending Now</h2>
          </div>
          <Link to="/search" className="text-primary text-sm font-medium hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : trendingIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
        </div>
      </section>

      {/* Latest */}
      <section className="px-4 pb-6 max-w-7xl mx-auto">
        <h2 className="font-poppins font-semibold text-secondary text-base sm:text-lg mb-4">Latest Ideas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />) : latestIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white px-4 py-8 mt-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-poppins font-bold text-lg">IdeasOpen</span>
          </div>
          <p className="text-white/60 text-sm mb-4">Your gateway to business ideas, tech resources & more.</p>
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-sm flex-wrap">
            <Link to="/business" className="text-white/70 hover:text-white transition-colors">Business</Link>
            <Link to="/futurefeed" className="text-white/70 hover:text-white transition-colors">FutureFeed</Link>
            <Link to="/search" className="text-white/70 hover:text-white transition-colors">Search</Link>
          </div>
          <p className="text-white/30 text-xs mt-6">© 2025 IdeasOpen.in — All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
