import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

const CATEGORIES = ['All', 'Web App', 'Mobile', 'Tooling', 'Game'];
const TECHNOLOGIES = ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Node.js', 'Python', 'Firebase', 'React Native'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A-Z', value: 'alpha' }
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All';
  const tech = searchParams.get('tech')?.split(',') || [];
  const sortBy = searchParams.get('sort') || 'newest';

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        let queryBuilder = supabase
          .from('projects')
          .select('*')
          .eq('status', 'published');

        if (category !== 'All') {
          queryBuilder = queryBuilder.eq('category', category);
        }

        const { data, error } = await queryBuilder;

        if (error) throw error;

        if (data) {
          let filtered = [...data];

          // Apply search filter client-side for simplicity and better full-text feel
          if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(p => 
              p.title.toLowerCase().includes(q) || 
              p.description.toLowerCase().includes(q)
            );
          }

          // Apply technology filter
          if (tech.length > 0) {
            filtered = filtered.filter(p => 
              tech.every(t => p.technologies?.includes(t))
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortBy === 'alpha') return a.title.localeCompare(b.title);
            return 0;
          });

          setProjects(filtered);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [query, category, tech.join(','), sortBy]);

  const updateParams = (key: string, value: string | string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All' || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else {
      newParams.set(key, Array.isArray(value) ? value.join(',') : value);
    }
    setSearchParams(newParams);
  };

  const toggleTech = (t: string) => {
    const newTech = tech.includes(t) ? tech.filter(x => x !== t) : [...tech, t];
    updateParams('tech', newTech);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6 items-end justify-between border-b border-gray-200 pb-8">
        <div className="w-full md:w-auto flex-1 max-w-xl">
          <h1 className="text-4xl font-extrabold mb-6">Explore Projects</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#1A1A1A] focus:ring-0 transition-colors"
              value={query}
              onChange={(e) => updateParams('q', e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-colors w-full md:w-auto justify-center ${
              showFilters ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters {(category !== 'All' || tech.length > 0) && <span className="w-2 h-2 rounded-full bg-[#CCFF00]"></span>}
          </button>
          <div className="relative w-full md:w-auto hidden md:block">
            <select
              className="appearance-none w-full pl-4 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium focus:border-[#1A1A1A] focus:ring-0 cursor-pointer"
              value={sortBy}
              onChange={(e) => updateParams('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="w-full lg:w-64 space-y-8 lg:shrink-0 animate-fade-in bg-white p-6 rounded-2xl border-2 border-gray-100 h-fit">
            <div className="md:hidden mb-6">
              <h3 className="font-bold mb-3">Sort By</h3>
              <select
                className="w-full p-2 border-2 border-gray-200 rounded-lg bg-white"
                value={sortBy}
                onChange={(e) => updateParams('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="font-bold mb-4">Category</h3>
              <div className="space-y-2">
                {CATEGORIES.map(c => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${category === c ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {category === c && <div className="w-2 h-2 bg-[#CCFF00] rounded-sm" />}
                    </div>
                    <input
                      type="radio"
                      name="category"
                      className="sr-only"
                      checked={category === c}
                      onChange={() => updateParams('category', c)}
                    />
                    <span className={category === c ? 'font-medium text-[#1A1A1A]' : 'text-gray-600'}>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Technologies</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {TECHNOLOGIES.map(t => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${tech.includes(t) ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {tech.includes(t) && <div className="w-2 h-2 bg-[#CCFF00] rounded-sm" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={tech.includes(t)}
                      onChange={() => toggleTech(t)}
                    />
                    <span className={tech.includes(t) ? 'font-medium text-[#1A1A1A]' : 'text-gray-600'}>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {(category !== 'All' || tech.length > 0) && (
              <button
                onClick={() => {
                  updateParams('category', 'All');
                  updateParams('tech', []);
                }}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-[#1A1A1A] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Project Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-[360px] border-2 border-gray-100" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} to={`/project/${project.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative border-b border-gray-100">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        No image
                      </div>
                    )}
                    {project.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded bg-[#CCFF00] text-[#1A1A1A] text-xs font-bold shadow-sm">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{project.category}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-charcoal line-clamp-1">{project.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {project.technologies?.slice(0, 3).map((t, i) => (
                         <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[11px] font-semibold border border-gray-200">
                          {t}
                        </span>
                      ))}
                      {(project.technologies?.length || 0) > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-[11px] font-medium border border-gray-200">
                          +{(project.technologies?.length || 0) - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
