import { Link } from 'react-router-dom';
import { Eye, Download, Lock } from 'lucide-react';
import { isUnlocked } from '../lib/adHelper';

export default function IdeaCard({ idea }) {
  // Defensive checks for required properties
  if (!idea || !idea.id || !idea.slug) {
    return null; // Skip rendering invalid ideas
  }

  const unlocked = isUnlocked(idea.slug);
  const isFutureFeed = idea.section === 'futurefeed';
  const category = idea.category || 'Uncategorized';
  const title = idea.title || 'Untitled';
  const thumbnail = idea.thumbnail_url || 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&q=80';
  const viewCount = idea.view_count || 0;
  const unlockCount = idea.unlock_count || 0;

  return (
    <Link
      to={`/idea/${idea.slug}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200 overflow-hidden group"
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&q=80'; }}
        />
        <div className="absolute top-1.5 left-1.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isFutureFeed ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
            {category}
          </span>
        </div>
        {!unlocked && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
              <Lock size={13} className="text-primary" />
              <span className="text-xs font-medium text-secondary">Watch to Unlock</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3">
        <h3 className="font-poppins font-semibold text-secondary text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-1 mb-2 hidden sm:block">
          {idea.short_description || 'No description'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            {isFutureFeed ? <><Download size={11} /> {unlockCount}</> : <><Eye size={11} /> {viewCount}</> }
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
            unlocked ? 'bg-green-100 text-green-700' :
            isFutureFeed ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
          }`}>
            {unlocked ? '✓ View' : 'Unlock'}
          </span>
        </div>
      </div>
    </Link>
  );
}
