import { Link, NavLink } from 'react-router-dom';
import { Terminal, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Discover', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#F9F8F6]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2 text-brand-charcoal hover:opacity-80 transition-opacity">
              <Terminal className="h-8 w-8 text-[#1A1A1A]" />
              <span className="text-xl font-bold tracking-tight">Git Club BuildSpace</span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-8">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#CCFF00] text-[#1A1A1A]'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
            >
              <User className="h-4 w-4" />
              Admin
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                    isActive
                      ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#1A1A1A]'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
            >
              Admin Studio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
