import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Code, ExternalLink, ArrowLeft, Users, Calendar, Info, Star, Code2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type Member = Database['public']['Tables']['members']['Row'];

export default function ProjectDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectData() {
      if (!slug) return;
      
      setLoading(true);
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .single();

        if (projectError) throw projectError;
        
        if (projectData) {
          setProject(projectData);
          
          // Fetch members if project exists
          const { data: memberData, error: memberError } = await supabase
            .from('project_members')
            .select(`
              members (*)
            `)
            .eq('project_id', projectData.id);
            
          if (!memberError && memberData) {
            const formattedMembers = memberData
              .map((item: any) => item.members)
              .filter(Boolean);
            setMembers(formattedMembers);
          }
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectData();
  }, [slug]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="aspect-[21/9] bg-gray-200 rounded-3xl"></div>
        <div className="h-12 w-3/4 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold mb-4">Project Not Found</h2>
        <p className="text-gray-500 mb-8">The project you're looking for doesn't exist or has been removed.</p>
        <Link to="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1A1A1A] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#1A1A1A] text-white text-sm font-bold rounded-full">{project.category}</span>
              {project.is_featured && (
                <span className="px-3 py-1 bg-[#CCFF00] text-[#1A1A1A] text-sm font-bold rounded-full">Featured</span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1A1A1A]">{project.title}</h1>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">{project.description}</p>
          </div>

          <div className="flex gap-4 shrink-0">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-gray-200 font-semibold hover:border-[#1A1A1A] hover:bg-gray-50 transition-all">
                <Code className="w-5 h-5" />
                <span>Repository</span>
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1A1A1A] text-white font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                <ExternalLink className="w-5 h-5" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {project.thumbnail_url && (
          <div className="aspect-[21/9] md:aspect-[21/10] rounded-3xl overflow-hidden border-2 border-gray-100 shadow-xl bg-white">
            <img src={project.thumbnail_url} alt={`${project.title} thumbnail`} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 border-b-2 border-gray-100 pb-4">
              <Info className="w-6 h-6 text-gray-400" /> The Problem
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>{project.problem}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 border-b-2 border-gray-100 pb-4">
              <Star className="w-6 h-6 text-gray-400" /> The Solution
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>{project.solution}</p>
            </div>
          </section>

        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm space-y-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <Code2 className="w-5 h-5 text-gray-400" /> Technology Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold border border-gray-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-gray-400" /> Members
              </h3>
              {members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      {member.github_url && (
                         <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-gray-400 hover:text-[#1A1A1A] transition-colors">
                           <Code className="w-4 h-4" />
                         </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No members listed.</p>
              )}
            </div>

            <div className="border-t-2 border-gray-100 pt-8">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-gray-400" /> Published
              </h3>
              <p className="text-gray-600 font-medium">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
