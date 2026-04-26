import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

const Home = lazy(() => import('./pages/Home'));
const Business = lazy(() => import('./pages/Business'));
const FutureFeed = lazy(() => import('./pages/FutureFeed'));
const IdeaDetail = lazy(() => import('./pages/IdeaDetail'));
const Search = lazy(() => import('./pages/Search'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="font-poppins">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/business" element={<Business />} />
                    <Route path="/futurefeed" element={<FutureFeed />} />
                    <Route path="/idea/:slug" element={<IdeaDetail />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <BottomNav />
                </>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
