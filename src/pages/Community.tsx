import { useEffect, useState } from 'react';
import { Code, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Member = Database['public']['Tables']['members']['Row'];

export default function Community() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('name');
          
        if (error) throw error;
        if (data) setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Our Community</h1>
        <p className="text-xl text-gray-600">
          Meet the builders, designers, and innovators behind the projects in Git Club BuildSpace.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-64 border-2 border-gray-100 p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
          {members.map((person) => (
            <div key={person.id} className="bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-gray-300 transition-colors flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-white shadow-md overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                {person.avatar_url ? (
                  <img src={person.avatar_url} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
              <p className="text-sm font-medium text-gray-500 mb-4">{person.role}</p>
              
              <div className="flex gap-3 mt-auto">
                {person.github_url && (
                  <a href={person.github_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1A1A1A] hover:text-white transition-colors">
                    <Code className="w-4 h-4" />
                  </a>
                )}
                {person.linkedin_url && (
                  <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0A66C2] hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 max-w-2xl mx-auto">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No contributors yet</h3>
          <p className="text-gray-500">
            Community members will appear here once they are added to projects.
          </p>
        </div>
      )}
    </div>
  );
}
