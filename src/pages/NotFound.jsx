import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <Seo
        title="Page Not Found | IdeasOpen"
        description="The page you are looking for does not exist. Return to IdeasOpen to explore business ideas and tech resources."
        url="https://ideasopen.in/404"
        type="website"
      />
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <AlertCircle size={56} className="mx-auto text-primary mb-4" />
        <h1 className="font-poppins font-bold text-2xl text-secondary mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">This route is not available or has been moved. Go back to the homepage and continue exploring.</p>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
