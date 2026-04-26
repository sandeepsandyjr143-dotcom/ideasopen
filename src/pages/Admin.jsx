import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, Eye, Download, LogOut, Save, X,
  Search, Filter, ChevronDown, Loader2, AlertTriangle,
  CheckCircle, BarChart2, FileText, Globe, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ToastContainer, useToast } from '../components/Toast';

const BUSINESS_CATEGORIES = ['Franchise', 'Startup', 'Manufacturing', 'Low Investment', 'Digital', 'Passive Income'];
const FUTUREFEED_CATEGORIES = ['Apps', 'AI Tools', 'APK', 'Courses', 'Resources', 'Dev Tools'];

const EMPTY_FORM = {
  title: '',
  slug: '',
  section: 'business',
  category: 'Franchise',
  thumbnail_url: '',
  short_description: '',
  full_details: '',
  external_link: '',
  tags: '',
  status: 'draft',
  date_order: ''
};

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary">Confirm Delete</h3>
            <p className="text-gray-500 text-sm mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";

export default function Admin() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({ total: 0, published: 0, views: 0, unlocks: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadNotice, setUploadNotice] = useState('');

  const adminEmail = sessionStorage.getItem('admin_email') || 'Admin';

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_auth');
    if (!isAuth) { navigate('/admin-login'); return; }
    fetchIdeas();
  }, [navigate]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      const d = data || [];
      setIdeas(d);
      setStats({
        total: d.length,
        published: d.filter((i) => i.status === 'published').length,
        views: d.reduce((s, i) => s + (i.view_count || 0), 0),
        unlocks: d.reduce((s, i) => s + (i.unlock_count || 0), 0),
      });
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
      addToast('Failed to load ideas: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((p) => ({ ...p, title, ...(!editingIdea ? { slug: generateSlug(title) } : {}) }));
    if (formErrors.title) setFormErrors((p) => ({ ...p, title: '' }));
  };

  const handleSectionChange = (e) => {
    const section = e.target.value;
    const cats = section === 'business' ? BUSINESS_CATEGORIES : FUTUREFEED_CATEGORIES;
    setFormData((p) => ({ ...p, section, category: cats[0] }));
  };

  const formatForDatetimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    return localDate.toISOString().slice(0, 16);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file data'));
        return;
      }
      const [, base64] = result.split(',');
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });

  const uploadDirectly = async (fileName, file) => {
    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    if (urlError) {
      throw urlError;
    }

    return urlData.publicUrl;
  };

  const uploadViaServer = async (fileName, file) => {
    if (import.meta.env.DEV) {
      return uploadDirectly(fileName, file);
    }

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, contentType: file.type, data: base64 }),
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(result?.error || `Server upload failed with status ${res.status}`);
      }

      if (!result?.publicUrl) {
        throw new Error('Upload endpoint returned no publicUrl');
      }

      return result.publicUrl;
    } catch (err) {
      return uploadDirectly(fileName, file);
    }
  };



  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    addToast("Uploading...", "info");
    setUploadNotice('');

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

    try {
      const publicUrl = await uploadViaServer(fileName, file);

      setFormData((prev) => ({
        ...prev,
        thumbnail_url: publicUrl,
      }));

      addToast("Upload success", "success");
    } catch (err) {
      console.error('Upload exception:', err);
      const message = err?.message || 'Unknown upload error';
      setUploadNotice('Upload route error: ' + message);
      addToast("Upload failed: " + message, "error");
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    if (!formData.short_description.trim()) errors.short_description = 'Short description is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    setSaving(true);
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      date_order: formData.date_order ? new Date(formData.date_order).toISOString() : new Date().toISOString(),
    };

    try {
      if (editingIdea) {
        const { error } = await supabase.from('ideas').update(payload).eq('id', editingIdea.id);
        if (error) throw error;
        addToast('Idea updated successfully!', 'success');
      } else {
        const { error } = await supabase.from('ideas').insert(payload);
        if (error) throw error;
        addToast('Idea created successfully!', 'success');
      }
      closeForm();
      fetchIdeas();
    } catch (err) {
      addToast('Error saving idea: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (idea) => {
    setEditingIdea(idea);
    const fullDetails = typeof idea.full_details === 'string' ? idea.full_details : '';
    const tags = Array.isArray(idea.tags) ? idea.tags.join(', ') : (typeof idea.tags === 'string' ? idea.tags : '');
    setFormData({
      title: String(idea.title || ''),
      slug: String(idea.slug || ''),
      section: String(idea.section || 'business'),
      category: String(idea.category || 'Franchise'),
      thumbnail_url: String(idea.thumbnail_url || ''),
      short_description: String(idea.short_description || ''),
      full_details: fullDetails,
      external_link: String(idea.external_link || ''),
      tags: tags,
      status: String(idea.status || 'draft'),
      date_order: formatForDatetimeLocal(idea.date_order),
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDeleteConfirm = (idea) => setConfirmDelete(idea);

  const handleDelete = async () => {
    const idea = confirmDelete;
    setConfirmDelete(null);
    setDeleting(idea.id);
    try {
      const { error } = await supabase.from('ideas').delete().eq('id', idea.id);
      if (error) throw error;
      addToast('Idea deleted.', 'info');
      fetchIdeas();
    } catch (err) {
      addToast('Error deleting: ' + err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const closeForm = () => { setShowForm(false); setEditingIdea(null); setFormData(EMPTY_FORM); setFormErrors({}); };

  const handleLogout = () => { sessionStorage.clear(); navigate('/admin-login'); };

  const categories = formData.section === 'business' ? BUSINESS_CATEGORIES : FUTUREFEED_CATEGORIES;

  const filteredIdeas = ideas.filter((idea) => {
    const matchSearch = !searchQuery ||
      idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSection = filterSection === 'all' || idea.section === filterSection;
    const matchStatus = filterStatus === 'all' || idea.status === filterStatus;
    return matchSearch && matchSection && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirm Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Toast */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="bg-secondary text-white px-4 py-3 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg leading-none">I</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-poppins font-bold text-base leading-tight">Admin Panel</h1>
              <p className="text-white/50 text-xs truncate hidden sm:block">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex-shrink-0"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-secondary' },
            { label: 'Published', value: stats.published, icon: Globe, color: 'text-green-600' },
            { label: 'Total Views', value: stats.views, icon: Eye, color: 'text-primary' },
            { label: 'Unlocks', value: stats.unlocks, icon: Download, color: 'text-blue-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-500 text-xs">{label}</p>
                <Icon size={16} className={color} />
              </div>
              <p className={`font-poppins font-bold text-xl ${color}`}>{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => { setFormData(EMPTY_FORM); setEditingIdea(null); setFormErrors({}); setShowForm(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm"
          >
            <Plus size={18} />
            Add New Idea
          </button>

          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                style={{ fontSize: '16px' }}
              />
            </div>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
            >
              <option value="all">All Sections</option>
              <option value="business">Business</option>
              <option value="futurefeed">FutureFeed</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-500 text-xs mb-3">
          Showing {filteredIdeas.length} of {ideas.length} posts
        </p>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center overflow-y-auto py-4 sm:py-8 px-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="font-poppins font-semibold text-base text-secondary">
                  {editingIdea ? '✏️ Edit Idea' : '✨ Add New Idea'}
                </h2>
                <button onClick={closeForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <FormField label="Title" required>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter idea title..."
                    className={`${inputClass} ${formErrors.title ? 'border-red-300 focus:ring-red-200' : ''}`}
                    style={{ fontSize: '16px' }}
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </FormField>

                <FormField label="Slug / URL" required>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => { setFormData((p) => ({ ...p, slug: e.target.value })); if (formErrors.slug) setFormErrors((p) => ({ ...p, slug: '' })); }}
                    placeholder="url-friendly-slug"
                    className={`${inputClass} bg-gray-50 font-mono text-xs ${formErrors.slug ? 'border-red-300' : ''}`}
                    style={{ fontSize: '16px' }}
                  />
                  {formErrors.slug && <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>}
                  <p className="text-gray-400 text-xs mt-1">URL: /idea/{formData.slug || 'your-slug'}</p>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Section" required>
                    <select value={formData.section} onChange={handleSectionChange} className={inputClass} style={{ fontSize: '16px' }}>
                      <option value="business">Business & Hustle</option>
                      <option value="futurefeed">FutureFeed</option>
                    </select>
                  </FormField>
                  <FormField label="Category" required>
                    <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className={inputClass} style={{ fontSize: '16px' }}>
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </FormField>
                </div>

                <FormField label="Thumbnail Image">
                  <input type="file" accept="image/*" onChange={handleUpload} className={inputClass} style={{ fontSize: '16px' }} />
                  {uploadNotice && (
                    <p className="text-sm text-yellow-600 mt-2">{uploadNotice}</p>
                  )}
                  {formData.thumbnail_url && (
                    <div className="mt-2 rounded-lg overflow-hidden w-full aspect-video bg-gray-100">
                      <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </FormField>

                <FormField label="Short Description" required>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => { setFormData((p) => ({ ...p, short_description: e.target.value })); if (formErrors.short_description) setFormErrors((p) => ({ ...p, short_description: '' })); }}
                    rows={2}
                    placeholder="Brief description shown on cards..."
                    className={`${inputClass} resize-none ${formErrors.short_description ? 'border-red-300' : ''}`}
                    style={{ fontSize: '16px' }}
                  />
                  {formErrors.short_description && <p className="text-red-500 text-xs mt-1">{formErrors.short_description}</p>}
                </FormField>

                <FormField label="Full Details / Content">
                  <textarea
                    value={formData.full_details || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, full_details: e.target.value }))}
                    rows={10}
                    placeholder="Enter full details (URLs will become clickable links, image URLs will display as images)"
                    className={`${inputClass} resize-vertical font-sans`}
                    style={{ fontSize: '16px' }}
                  />
                  <p className="text-gray-400 text-xs mt-1">{(formData.full_details || '').length} characters</p>
                  <p className="text-gray-400 text-xs mt-1">💡 Tip: Paste image URLs on their own line to display images. Any URL starting with http/https will become clickable.</p>
                </FormField>

                <FormField label="External Link (Optional)">
                  <input
                    type="url"
                    value={formData.external_link}
                    onChange={(e) => setFormData((p) => ({ ...p, external_link: e.target.value }))}
                    placeholder="https://..."
                    className={inputClass}
                    style={{ fontSize: '16px' }}
                  />
                </FormField>

                <FormField label="Tags (comma separated)">
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="startup, low-investment, trending"
                    className={inputClass}
                    style={{ fontSize: '16px' }}
                  />
                  {formData.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.tags.split(',').filter(Boolean).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">#{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Status">
                    <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className={inputClass} style={{ fontSize: '16px' }}>
                      <option value="draft">📝 Draft</option>
                      <option value="published">🌐 Published</option>
                    </select>
                  </FormField>
                  <FormField label="Date / Order">
                    <input
                      type="datetime-local"
                      value={formData.date_order}
                      onChange={(e) => setFormData((p) => ({ ...p, date_order: e.target.value }))}
                      className={inputClass}
                      style={{ fontSize: '16px' }}
                    />
                  </FormField>
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                      <><Save size={16} /> {editingIdea ? 'Update Idea' : 'Publish Idea'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table — desktop; Cards — mobile */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Title', 'Section', 'Category', 'Status', 'Stats', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td></tr>
                  ))
                ) : filteredIdeas.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No ideas found</td></tr>
                ) : (
                  filteredIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {idea.thumbnail_url && (
                            <img src={idea.thumbnail_url} alt="" className="w-10 h-7 object-cover rounded-lg flex-shrink-0 bg-gray-100" onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                          <p className="font-medium text-secondary text-sm line-clamp-1 max-w-[200px]">{idea.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${idea.section === 'business' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                          {idea.section === 'business' ? '💼 Business' : '🤖 FutureFeed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{idea.category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${idea.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {idea.status === 'published' ? '🌐 Live' : '📝 Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Eye size={12} /> {idea.view_count || 0}</span>
                          <span className="flex items-center gap-1"><Download size={12} /> {idea.unlock_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(idea)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(idea)}
                            disabled={deleting === idea.id}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === idea.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-gray-100">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : filteredIdeas.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">No ideas found</div>
            ) : (
              filteredIdeas.map((idea) => (
                <div key={idea.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {idea.thumbnail_url && (
                      <img src={idea.thumbnail_url} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary text-sm line-clamp-2 mb-1">{idea.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${idea.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {idea.status}
                        </span>
                        <span className="text-xs text-gray-400">{idea.category}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Eye size={10} /> {idea.view_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(idea)} className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(idea)}
                        disabled={deleting === idea.id}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === idea.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
