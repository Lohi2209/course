import { useEffect, useState } from 'react';
import { getMaterialsByCourse, createMaterial, deleteMaterial } from '../api/materialApi';
import { toAbsoluteUrl } from '../api/apiConfig';
import FileUploadComponent from './FileUploadComponent';

function CourseMaterials({ course, canManage, canDelete, onClose }) {
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    materialType: 'PDF',
    url: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, [course.id]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await getMaterialsByCourse(course.id);
      setMaterials(data);
    } catch (err) {
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await createMaterial({
        ...formData,
        courseId: course.id
      });
      setFormData({ title: '', description: '', materialType: 'PDF', url: '' });
      setShowForm(false);
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add material');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    
    try {
      await deleteMaterial(id);
      await loadMaterials();
    } catch (err) {
      setError('Failed to delete material');
    }
  };

  const getMaterialIcon = (type) => {
    const icons = {
      VIDEO: '🎥',
      PDF: '📄',
      LINK: '🔗',
      PPT: '📊'
    };
    return icons[type] || '📎';
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Match various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return null;
  };

  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  return (
    <div className="materials-overlay">
      <div className="materials-modal">
        <div className="modal-header">
          <h2>Course Materials - {course.courseName}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {canManage && (
          <div className="material-actions-bar">
            <button 
              onClick={() => setShowFileUpload(!showFileUpload)} 
              className="btn btn-primary"
            >
              {showFileUpload ? '✕ Close Upload' : '📤 Upload PDF/PPT'}
            </button>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="btn btn-secondary"
            >
              {showForm ? '✕ Cancel' : '+ Add Link'}
            </button>
          </div>
        )}

        {showFileUpload && canManage && (
          <FileUploadComponent courseId={course.id} onUploadSuccess={loadMaterials} />
        )}

        {showForm && (
          <form className="material-form" onSubmit={handleSubmit}>
            <h3>Add Material Link</h3>
            
            <label>
              Title *
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
            </label>

            <label>
              Material Type *
              <select
                name="materialType"
                value={formData.materialType}
                onChange={handleChange}
                required
              >
                <option value="VIDEO">Video</option>
                <option value="LINK">External Link</option>
              </select>
            </label>

            <label>
              URL or Link *
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                placeholder="https://..."
                maxLength={500}
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                maxLength={500}
              />
            </label>

            <div className="form-actions">
              <button type="submit">Add Material</button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '', materialType: 'VIDEO', url: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="materials-list">
          {loading ? (
            <p>Loading materials...</p>
          ) : materials.length === 0 ? (
            <p className="empty-state">No materials uploaded yet.</p>
          ) : (
            materials.map((material) => (
              <div key={material.id} className="material-item">
                <div className="material-icon">{getMaterialIcon(material.materialType)}</div>
                <div className="material-info">
                  <h4>{material.title}</h4>
                  <p className="material-meta">
                    {material.materialType} • Uploaded by {material.uploadedBy} • 
                    {new Date(material.uploadedAt).toLocaleDateString()}
                  </p>
                  {material.description && <p>{material.description}</p>}
                  {isYouTubeUrl(material.url) ? (
                    <div className="video-container">
                      <iframe
                        width="100%"
                        height="315"
                        src={getYouTubeEmbedUrl(material.url)}
                        title={material.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      <a href={material.url} target="_blank" rel="noopener noreferrer" className="material-link" style={{marginTop: '10px', display: 'inline-block'}}>
                        🔗 Open on YouTube →
                      </a>
                    </div>
                  ) : (material.materialType === 'PDF' || material.materialType === 'PPT') ? (
                    <a 
                      href={toAbsoluteUrl(material.url)} 
                      download 
                      className="material-link"
                      title="Download file"
                    >
                      ⬇️ Download {material.materialType} →
                    </a>
                  ) : (
                    <a href={material.url} target="_blank" rel="noopener noreferrer" className="material-link">
                      Open Material →
                    </a>
                  )}
                </div>
                {canDelete && (
                  <button
                    className="danger small"
                    onClick={() => handleDelete(material.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default CourseMaterials;
