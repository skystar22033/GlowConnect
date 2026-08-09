import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Sparkles, Video } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MAX_CHARS = 2000;
const API_URL = 'http://localhost:5001/api';

export default function CreatePostModal({ onClose, onCreated, editingPost = null }) {
  const [content, setContent] = useState(editingPost?.content || '');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [preview, setPreview] = useState(editingPost?.image || null);
  const [videoPreview, setVideoPreview] = useState(editingPost?.video || null);
  const [mediaType, setMediaType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const isEditing = !!editingPost;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setVideoFile(null);
    setVideoPreview(null);
    setImageFile(file);
    setMediaType('image');
    setPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('🎬 Video selected:', file.name, file.type, file.size);
    
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`❌ Unsupported video format: ${file.type}. Use MP4, MOV, WEBM, or 3GP.`);
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be under 100MB');
      return;
    }
    setImageFile(null);
    setPreview(null);
    setVideoFile(file);
    setMediaType('video');
    setVideoPreview(URL.createObjectURL(file));
    toast.success(`✅ Video selected: ${file.name}`);
  };

  const removeMedia = () => {
    setImageFile(null);
    setVideoFile(null);
    setPreview(null);
    setVideoPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // ✅ Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile && !videoFile) {
      toast.error('Write something or add media before posting');
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      
      // ✅ Build request data
      const postData = {
        content: content.trim(),
      };

      // ✅ Convert image to base64
      if (imageFile) {
        console.log('🖼️ Converting image to base64...');
        const base64Image = await fileToBase64(imageFile);
        postData.image = base64Image;
        postData.mediaType = 'image';
        setUploadProgress(50);
      }

      // ✅ Convert video to base64
      if (videoFile) {
        console.log('🎬 Converting video to base64...');
        const base64Video = await fileToBase64(videoFile);
        postData.video = base64Video;
        postData.mediaType = 'video';
        setUploadProgress(50);
      }

      setUploadProgress(70);

      // ✅ Send as JSON with base64
      const response = await axios.post(`${API_URL}/posts/base64`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setUploadProgress(100);
      console.log('✅ Post created:', response.data);
      toast.success('🎉 Post published successfully!');
      onCreated(response.data.data.post);
      onClose();
    } catch (err) {
      console.error('❌ Error creating post:', err);
      toast.error(err.response?.data?.message || 'Could not save post');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg animate-pop-in p-5 shadow-floating">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-text-primary">
            <Sparkles className="h-4 w-4 text-primary" />
            {isEditing ? 'Edit post' : 'Create post'}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-faint transition hover:bg-surface-raised">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            placeholder="What's glowing in your world today?"
            rows={4}
            className="input-field resize-none"
            autoFocus
          />
          <p className="mt-1 text-right text-xs text-text-faint">
            {content.length}/{MAX_CHARS}
          </p>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-1">
                {uploadProgress < 50 ? 'Processing media...' : 'Uploading...'}
              </p>
            </div>
          )}

          {preview && (
            <div className="relative mt-2">
              <img src={preview} alt="Preview" className="max-h-64 w-full rounded-2xl object-cover" />
              <button
                type="button"
                onClick={removeMedia}
                className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-white transition hover:bg-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {videoPreview && (
            <div className="relative mt-2">
              <video src={videoPreview} className="max-h-64 w-full rounded-2xl object-cover" controls />
              <button
                type="button"
                onClick={removeMedia}
                className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-white transition hover:bg-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-text-muted transition hover:bg-surface-raised hover:text-primary"
              >
                <ImageIcon className="h-4 w-4" /> Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-text-muted transition hover:bg-surface-raised hover:text-primary"
              >
                <Video className="h-4 w-4" /> Video
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />

              {mediaType === 'image' && (
                <span className="text-xs text-primary flex items-center">📷 Image</span>
              )}
              {mediaType === 'video' && (
                <span className="text-xs text-primary flex items-center">🎬 Video</span>
              )}
            </div>

            <button type="submit" disabled={submitting || (!content.trim() && !imageFile && !videoFile)} className="btn-primary">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}