import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

const CATEGORIES = ['Web App', 'Mobile', 'Tooling', 'Game'];

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProjectInsert>({
    title: '',
    slug: '',
    description: '',
    problem: '',
    solution: '',
    category: 'Web App',
    technologies: [],
    thumbnail_url: '',
    github_url: '',
    demo_url: '',
    is_featured: false,
    status: 'draft',
  });

  const [techInput, setTechInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin');
        return;
      }

      if (isEditing) {
        fetchProject();
      }
    }
    
    checkAuthAndFetch();
  }, [id, navigate, isEditing]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          description: data.description,
          problem: data.problem,
          solution: data.solution,
          category: data.category,
          technologies: data.technologies || [],
          thumbnail_url: data.thumbnail_url || '',
          github_url: data.github_url || '',
          demo_url: data.demo_url || '',
          is_featured: data.is_featured,
          status: data.status,
        });
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from title
      if (name === 'title' && !isEditing) {
        const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ 
          ...prev, 
          slug: generatedSlug 
        }));
        
        if (formErrors.slug && generatedSlug.trim()) {
           setFormErrors(prev => {
             const newErrors = { ...prev };
             delete newErrors.slug;
             return newErrors;
           });
        }
      }
    }
  };

  const addTech = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') {
      return;
    }
    
    e.preventDefault();
    const trimmed = techInput.trim();
    if (trimmed && !formData.technologies?.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), trimmed]
      }));
      setTechInput('');
      
      if (formErrors.technologies) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.technologies;
          return newErrors;
        });
      }
    }
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(t => t !== tech)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setLoading(true);
    setError(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, thumbnail_url: data.publicUrl }));
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Project Title is required";
    if (!formData.slug.trim()) errors.slug = "URL Slug is required";
    if (!formData.description.trim()) errors.description = "Short Description is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.problem.trim()) errors.problem = "The Problem is required";
    if (!formData.solution.trim()) errors.solution = "The Solution is required";
    if (!formData.technologies || formData.technologies.length === 0) errors.technologies = "At least one technology is required";
    
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (formData.github_url && formData.github_url.trim() && !urlPattern.test(formData.github_url.trim())) {
      errors.github_url = "Please enter a valid URL";
    }
    if (formData.demo_url && formData.demo_url.trim() && !urlPattern.test(formData.demo_url.trim())) {
      errors.demo_url = "Please enter a valid URL";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorKey === 'technologies') {
         const techElement = document.getElementById('tech-input');
         if (techElement) {
           techElement.focus();
           techElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formData]);
        if (error) throw error;
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName: string, isSelect = false) => {
    return `w-full p-3 border-2 rounded-xl focus:ring-0 transition-colors ${
      formErrors[fieldName] 
        ? 'border-red-500 bg-red-50 focus:border-red-600' 
        : `border-gray-200 focus:border-[#1A1A1A] ${isSelect ? 'bg-white' : ''}`
    }`;
  };

  const RequiredAsterisk = () => <span className="text-red-500 ml-1">*</span>;

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Project' : 'New Project'}</h1>
          <p className="text-gray-500 mt-1">Fill in the details for the project showcase.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 font-medium text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg text-green-700 font-medium text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Project saved successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm" noValidate>
        
        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Project Title<RequiredAsterisk /></label>
              <input
                type="text"
                name="title"
                className={getInputStyle('title')}
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Campus Buddy"
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug<RequiredAsterisk /></label>
              <input
                type="text"
                name="slug"
                className={getInputStyle('slug') + (!formErrors.slug ? ' bg-gray-50' : '')}
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="campus-buddy"
              />
              {formErrors.slug && <p className="text-red-500 text-sm mt-1">{formErrors.slug}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Short Description<RequiredAsterisk /></label>
            <textarea
              name="description"
              rows={2}
              className={getInputStyle('description')}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="A brief overview of what the project does..."
            />
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category<RequiredAsterisk /></label>
              <select
                name="category"
                className={getInputStyle('category', true)}
                value={formData.category}
                onChange={handleInputChange}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Technologies<RequiredAsterisk /></label>
              <div className="flex gap-2 mb-2">
                <input
                  id="tech-input"
                  type="text"
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onKeyDown={addTech}
                  className={`flex-1 p-3 border-2 rounded-xl focus:ring-0 transition-colors ${
                    formErrors.technologies ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-gray-200 focus:border-[#1A1A1A]'
                  }`}
                  placeholder="e.g. React (Press Enter)"
                />
                <button 
                  type="button" 
                  onClick={addTech}
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              {formErrors.technologies && <p className="text-red-500 text-sm mt-1 mb-2">{formErrors.technologies}</p>}
              <div className="flex flex-wrap gap-2">
                {formData.technologies?.map(tech => (
                  <span key={tech} className="inline-flex items-center gap-1 px-3 py-1 bg-[#1A1A1A] text-white text-sm font-medium rounded-full">
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Content */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <h2 className="text-xl font-bold border-b pb-2">Detailed Content</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">The Problem<RequiredAsterisk /></label>
            <textarea
              name="problem"
              rows={4}
              className={getInputStyle('problem')}
              value={formData.problem}
              onChange={handleInputChange}
              placeholder="What problem does this project solve?"
            />
            {formErrors.problem && <p className="text-red-500 text-sm mt-1">{formErrors.problem}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">The Solution<RequiredAsterisk /></label>
            <textarea
              name="solution"
              rows={4}
              className={getInputStyle('solution')}
              value={formData.solution}
              onChange={handleInputChange}
              placeholder="How does this project solve the problem?"
            />
            {formErrors.solution && <p className="text-red-500 text-sm mt-1">{formErrors.solution}</p>}
          </div>
        </div>

        {/* Media & Links */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <h2 className="text-xl font-bold border-b pb-2">Media & Links</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail Image</label>
            <div className="flex items-center gap-6">
              {formData.thumbnail_url && (
                <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                  <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors font-medium w-full justify-center"
                >
                  <Upload className="w-5 h-5" />
                  {loading ? 'Uploading...' : 'Upload Image'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">Recommended: 16:9 ratio. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">GitHub URL</label>
              <input
                type="url"
                name="github_url"
                className={getInputStyle('github_url')}
                value={formData.github_url || ''}
                onChange={handleInputChange}
                placeholder="https://github.com/..."
              />
              {formErrors.github_url && <p className="text-red-500 text-sm mt-1">{formErrors.github_url}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Live Demo URL</label>
              <input
                type="url"
                name="demo_url"
                className={getInputStyle('demo_url')}
                value={formData.demo_url || ''}
                onChange={handleInputChange}
                placeholder="https://..."
              />
              {formErrors.demo_url && <p className="text-red-500 text-sm mt-1">{formErrors.demo_url}</p>}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <h2 className="text-xl font-bold border-b pb-2">Status</h2>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex-1">
              <input
                type="checkbox"
                name="status"
                className="w-5 h-5 text-[#1A1A1A] border-gray-300 rounded focus:ring-[#1A1A1A]"
                checked={formData.status === 'published'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))}
              />
              <div>
                <p className="font-bold text-gray-900">Published</p>
                <p className="text-sm text-gray-500">Make this project visible to the public.</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex-1">
              <input
                type="checkbox"
                name="is_featured"
                className="w-5 h-5 text-[#1A1A1A] border-gray-300 rounded focus:ring-[#1A1A1A]"
                checked={formData.is_featured || false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
              />
              <div>
                <p className="font-bold text-gray-900">Featured</p>
                <p className="text-sm text-gray-500">Highlight this project on the homepage.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end gap-4">
          <Link
            to="/admin/dashboard"
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1A1A1A] text-[#CCFF00] font-bold rounded-xl hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
