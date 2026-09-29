import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star, Code2, Smartphone, Globe, Box, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

const CATEGORIES = [
  { name: 'All', icon: Box },
  { name: 'Web App', icon: Globe },
  { name: 'Mobile', icon: Smartphone },
  { name: 'Tooling', icon: Code2 },
  { name: 'Game', icon: Gamepad2 },
];

export default function Home() {
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setProjects(data);
          const featured = data.find(p => p.is_featured);
          setFeaturedProject(featured || data[0] || null);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-20 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-10 pb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#1A1A1A]">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-[#CCFF00]">Student Innovation</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-600">
          Explore production-ready applications, open-source tools, and experimental projects built by the Git Club CHARUSAT community.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#1A1A1A] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-full bg-white text-lg focus:ring-0 focus:border-[#1A1A1A] transition-all shadow-sm"
            placeholder="Search projects, technologies, or problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-6 bg-[#1A1A1A] text-[#CCFF00] font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-3 pt-6">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setActiveCategory(name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all font-medium ${
                activeCategory === name
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {name}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Project */}
      {featuredProject && activeCategory === 'All' && !searchQuery && (
        <section className="animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-[#1A1A1A] fill-[#CCFF00]" />
            <h2 className="text-2xl font-bold">Featured Spotlight</h2>
          </div>
          <Link to={`/project/${featuredProject.slug}`} className="group block">
            <div className="relative rounded-3xl overflow-hidden bg-white border-2 border-gray-100 shadow-xl transition-transform hover:-translate-y-1 duration-300">
              <div className="aspect-[21/9] md:aspect-[21/7] bg-gray-100 overflow-hidden relative">
                {featuredProject.thumbnail_url ? (
                  <img
                    src={featuredProject.thumbnail_url}
                    alt={featuredProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    No image available
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider">
                      {featuredProject.category}
                    </span>
                    <span className="text-gray-300 text-sm">Featured</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2 group-hover:text-[#CCFF00] transition-colors">{featuredProject.title}</h3>
                  <p className="text-gray-200 line-clamp-2 max-w-3xl text-lg">{featuredProject.description}</p>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Project Gallery */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold">
            {activeCategory === 'All' ? 'Latest Projects' : `${activeCategory} Projects`}
          </h2>
          <Link to="/explore" className="hidden md:flex items-center gap-2 font-semibold text-gray-600 hover:text-[#1A1A1A] transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-[400px] border-2 border-gray-100" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Link key={project.id} to={`/project/${project.slug}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      No image
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-xs font-bold">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-brand-charcoal">{project.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.technologies?.slice(0, 3).map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                    {(project.technologies?.length || 0) > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-medium">
                        +{(project.technologies?.length || 0) - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any projects matching your criteria. Try adjusting your search or category filter.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="mt-6 px-6 py-2 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
