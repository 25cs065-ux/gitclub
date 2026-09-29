import { Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-8 w-8 text-[#CCFF00]" />
            <span className="text-xl font-bold tracking-tight">Git Club BuildSpace</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Discover</Link>
            <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link to="/community" className="hover:text-white transition-colors">Community</Link>
            <Link to="/admin" className="hover:text-[#CCFF00] transition-colors">Admin Studio</Link>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Git Club CHARUSAT. All rights reserved.</p>
          <p>Built for the Git Club Website Challenge.</p>
        </div>
      </div>
    </footer>
  );
}
