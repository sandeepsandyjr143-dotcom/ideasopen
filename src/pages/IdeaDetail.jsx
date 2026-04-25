import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, Download, ExternalLink, Share2, Copy, Check, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import AdGate from '../components/AdGate';
import IdeaCard from '../components/IdeaCard';
import SkeletonCard from '../components/SkeletonCard';
import { supabase } from '../lib/supabase';
import { isUnlocked, markAsUnlocked, incrementViewCount, incrementUnlockCount } from '../lib/adHelper';

export default function IdeaDetail() {
  const { slug } = useParams();
  const [idea, setIdea] = useState(null);
  const [relatedIdeas, setRelatedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showAdGate, setShowAdGate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) { fetchIdea(); setUnlocked(isUnlocked(slug)); }
  }, [slug]);

  const fetchIdea = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.from('ideas').select('*').eq('slug', slug).single();
      if (error) throw error;
      if (!data || !data.id || !data.slug) {
        setError('Invalid idea data.');
        return;
      }
      setIdea(data);
      if (data) {
        incrementViewCount(supabase, data.id, data.view_count || 0);
        fetchRelated(data.section || 'business', data.category || 'Uncategorized', data.id);
      }
    } catch (err) {
      setError('Idea not found or failed to load.');
    } finally { setLoading(false); }
  };

  const fetchRelated = async (section, category, excludeId) => {
    try {
      const { data } = await supabase.from('ideas').select('*').eq('section', section).eq('status', 'published').neq('id', excludeId).limit(4);
      const validIdeas = (data || []).filter(i => i && i.id && i.slug);
      setRelatedIdeas(validIdeas);
    } catch {}
  };

  const handleUnlock = () => {
    markAsUnlocked(slug);
    setUnlocked(true);
    if (idea) incrementUnlockCount(supabase, idea.id, idea.unlock_count || 0);
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out: ${idea?.title} on IdeasOpen`;
    if (navigator.share) {
      navigator.share({ title: idea?.title, text, url }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-20 mb-4" />
          <div className="aspect-video bg-gray-200 rounded-xl mb-4" />
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-36 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-8 px-4">
        <div className="text-center">
          <AlertCircle size={44} className="mx-auto text-gray-300 mb-3" />
          <h2 className="font-poppins font-semibold text-lg text-secondary mb-1">Idea Not Found</h2>
          <p className="text-gray-500 text-sm mb-4">{error || 'This idea does not exist.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const isFutureFeed = idea.section === 'futurefeed';
  const accentBg = isFutureFeed ? 'bg-secondary' : 'bg-primary';

  return (
    <div className={`min-h-screen pb-20 md:pb-8 ${isFutureFeed ? 'bg-secondary/5' : 'bg-background'}`}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Thumbnail */}
        <div className="relative rounded-b-2xl overflow-hidden mb-4">
          <img
            src={idea.thumbnail_url || 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80'}
            alt={idea.title}
            className={`w-full aspect-video object-cover ${!unlocked ? 'blur-md scale-105' : ''} transition-all duration-500`}
          />
          {!unlocked && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 p-4">
              <Lock size={32} className="text-white opacity-80" />
              <button
                onClick={() => setShowAdGate(true)}
                className={`flex items-center gap-2 px-6 py-3 ${accentBg} text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all min-h-[48px] shadow-lg text-sm sm:text-base`}
              >
                Watch 30 Sec to Unlock
              </button>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${accentBg} text-white`}>
            {idea.category}
          </span>
          <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
            {isFutureFeed ? (
              <><Download size={13} /> {idea.unlock_count || 0} downloads</>
            ) : (
              <><Eye size={13} /> {idea.view_count || 0} views</>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-poppins font-bold text-xl sm:text-2xl text-secondary mb-2 leading-snug">{idea.title}</h1>
        <p className="text-gray-600 text-sm sm:text-base mb-4">{idea.short_description}</p>

        {/* Content */}
        {unlocked ? (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-5">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm sm:text-base">
              <div dangerouslySetInnerHTML={{ __html: idea.full_details?.replace(/\n/g, '<br/>') || '' }} />
            </div>
            {idea.external_link && (
              <a
                href={idea.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 ${accentBg} text-white font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all min-h-[44px] text-sm`}
              >
                <ExternalLink size={16} />
                Open Link
              </a>
            )}
            {idea.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {idea.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-5 text-center">
            <Lock size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-poppins font-semibold text-secondary mb-1.5 text-base">Content Locked</h3>
            <p className="text-gray-500 text-sm mb-4">Watch a 30-second ad to unlock full details for free</p>
            <button
              onClick={() => setShowAdGate(true)}
              className={`px-6 py-3 ${accentBg} text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all min-h-[48px] text-sm`}
            >
              🔓 Unlock Now
            </button>
          </div>
        )}

        {/* Share */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 active:scale-[0.97] transition-all min-h-[48px] text-sm"
          >
            <Share2 size={16} />
            Share
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 active:scale-[0.97] transition-all min-h-[48px] text-sm"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {unlocked && (
          <button
            onClick={() => setShowAdGate(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors mb-6 min-h-[48px] text-sm"
          >
            <RefreshCw size={16} /> Watch Again
          </button>
        )}

        {/* Related */}
        {relatedIdeas.length > 0 && (
          <div className="mb-8">
            <h2 className="font-poppins font-semibold text-secondary text-base sm:text-lg mb-3">You Might Also Like</h2>
            <div className="grid grid-cols-2 gap-3">
              {relatedIdeas.map((r) => <IdeaCard key={r.id} idea={r} />)}
            </div>
          </div>
        )}
      </div>

      <AdGate isOpen={showAdGate} onClose={() => setShowAdGate(false)} onUnlock={handleUnlock} ideaTitle={idea.title} />
    </div>
  );
}
