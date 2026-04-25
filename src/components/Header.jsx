import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, X, ArrowLeft } from 'lucide-react';

const BACK_ROUTES = {
  '/business': '/',
  '/futurefeed': '/',
  '/search': '/',
};

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isIdeaDetail = location.pathname.startsWith('/idea/');
  const showBack = isIdeaDetail || BACK_ROUTES[location.pathname];
  const backTo = isIdeaDetail ? -1 : (BACK_ROUTES[location.pathname] || '/');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  const handleBack = () => {
    if (backTo === -1) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg leading-none">I</span>
            </div>
            {!searchOpen && (
              <span className="font-poppins font-bold text-secondary text-base sm:text-lg truncate">
                IdeasOpen
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ideas..."
                className="w-40 sm:w-64 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: '16px' }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(''); }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-primary transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
