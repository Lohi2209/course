import React, { useState, useRef } from 'react';
import { uploadMaterial, getMaterialsByCourse, deleteMaterial, downloadMaterial } from '../api/uploadApi';

const FileUploadComponent = ({ courseId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [showMaterials, setShowMaterials] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (!['pdf', 'ppt', 'pptx'].includes(fileExtension)) {
        setError('Only PDF, PPT, and PPTX files are allowed');
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Simulate change event
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const materialType = file.name.endsWith('.pdf') ? 'PDF' : 'PPT';
      await uploadMaterial(file, title, description, courseId, materialType);

      setSuccess(`${materialType} file uploaded successfully!`);
      setFile(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh materials list
      if (showMaterials) {
        loadMaterials();
      }

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const data = await getMaterialsByCourse(courseId);
      setMaterials(data || []);
    } catch (err) {
      setError('Failed to load materials');
      console.error('Load materials error:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleViewMaterials = async () => {
    if (!showMaterials) {
      await loadMaterials();
    }
    setShowMaterials(!showMaterials);
  };

  const handleDownload = (material) => {
    downloadMaterial(material.url);
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await deleteMaterial(materialId);
      setSuccess('Material deleted successfully');
      await loadMaterials();
    } catch (err) {
      setError('Failed to delete material');
    }
  };

  const getFileIcon = (materialType) => {
    switch (materialType) {
      case 'PDF':
        return '📄';
      case 'PPT':
      case 'PPTX':
        return '📊';
      default:
        return '📎';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <h3>📤 Upload Course Materials (PDF/PPT)</h3>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div
            className={`file-upload-area ${file ? 'file-selected' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {file ? (
              <div className="file-info">
                <div className="file-icon">📁</div>
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">⬆️</div>
                <p className="upload-text">Drag and drop your PDF or PPT file here</p>
                <p className="upload-subtext">or click to browse</p>
                <p className="upload-formats">Supports: PDF, PPT, PPTX (Max 50MB)</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title (e.g., 'Chapter 3 - Introduction to Algorithms')"
              maxLength="200"
            />
            <small>{title.length}/200 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter optional description"
              maxLength="500"
              rows="3"
            />
            <small>{description.length}/500 characters</small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !file}
            >
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
            {file && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="materials-section">
        <button
          className="btn btn-secondary"
          onClick={handleViewMaterials}
        >
          {showMaterials ? '📂 Hide Materials' : '📂 View Materials'} ({materials.length})
        </button>

        {showMaterials && (
          <div className="materials-list">
            {loadingMaterials ? (
              <p className="loading">Loading materials...</p>
            ) : materials.length === 0 ? (
              <p className="no-materials">No materials uploaded yet</p>
            ) : (
              <div className="materials-grid">
                {materials.map((material) => (
                  <div key={material.id} className="material-card">
                    <div className="material-icon">
                      {getFileIcon(material.materialType)}
                    </div>
                    <div className="material-content">
                      <h4>{material.title}</h4>
                      {material.description && (
                        <p className="material-desc">{material.description}</p>
                      )}
                      <div className="material-meta">
                        <span className="material-type">{material.materialType}</span>
                        <span className="material-date">{formatDate(material.uploadedAt)}</span>
                      </div>
                      {material.uploadedBy && (
                        <small className="material-uploader">By: {material.uploadedBy}</small>
                      )}
                    </div>
                    <div className="material-actions">
                      <button
                        className="btn-icon download-btn"
                        onClick={() => handleDownload(material)}
                        title="Download"
                      >
                        ⬇️
                      </button>
                      <button
                        className="btn-icon delete-btn"
                        onClick={() => handleDelete(material.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadComponent;
