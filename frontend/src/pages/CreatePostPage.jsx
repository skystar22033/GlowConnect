import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/navigation/BottomNav';
import { Image, X, Loader2, Video, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5001/api';

export default function CreatePostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`❌ Unsupported format: ${file.type}`);
        return;
      }
      // ✅ Clear video when image is selected
      setVideo(null);
      setVideoPreview('');
      setImage(file);
      setMediaType('image');
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('🎬 Video selected:', file.name, file.type, file.size);
      
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/x-msvideo'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`❌ Unsupported video format: ${file.type}. Use MP4, MOV, WEBM, or 3GP.`);
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('❌ Video too large. Max 100MB.');
        return;
      }
      // ✅ Clear image when video is selected
      setImage(null);
      setImagePreview('');
      setVideo(file);
      setMediaType('video');
      setVideoPreview(URL.createObjectURL(file));
      toast.success(`✅ Video selected: ${file.name}`);
    }
  };

  const removeMedia = () => {
    setImage(null);
    setVideo(null);
    setImagePreview('');
    setVideoPreview('');
    setMediaType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validation
    if (!content.trim() && !image && !video) {
      toast.error('❌ Please add content or media');
      return;
    }

    // ✅ If video is selected, make sure it's uploaded correctly
    if (video && !image) {
      console.log('🎬 Submitting video post...');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', content);
      
      // ✅ IMPORTANT: Append correct field name
      if (image) {
        console.log('🖼️ Appending image:', image.name);
        formData.append('image', image);  // ← Field name: 'image'
      }
      if (video) {
        console.log('🎬 Appending video:', video.name, video.type);
        formData.append('video', video);  // ← Field name: 'video' (NOT 'image')
      }

      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Post created:', response.data);
      toast.success('🎉 Post created successfully!');
      navigate('/feed');
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('❌ Response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to create post. Please try again.';
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-20">
        <h1 className="text-2xl font-bold font-display bg-gradient-brand bg-clip-text text-transparent mb-4">
          Create Post
        </h1>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="post-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.username} />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="font-semibold">{user?.fullName || user?.username}</p>
              <p className="text-sm text-text-muted">@{user?.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              className="input-field resize-none"
              rows="4"
              placeholder="What's glowing in your world today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength="2000"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mt-3">
                <div className="aspect-square bg-black/5 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black/90 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-text-muted mt-1 text-center">📐 Square image (1:1)</p>
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <div className="relative mt-3">
                <div className="aspect-square bg-black/5 rounded-xl overflow-hidden">
                  <video src={videoPreview} className="w-full h-full object-cover" controls />
                </div>
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black/90 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-text-muted mt-1 text-center">📐 Square video (1:1)</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-3">
                {/* Image Upload */}
                <label className="cursor-pointer text-text-muted hover:text-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Image className="w-5 h-5" />
                </label>

                {/* Video Upload */}
                <label className="cursor-pointer text-text-muted hover:text-primary transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <Video className="w-5 h-5" />
                </label>

                {/* Media Type Indicator */}
                {mediaType === 'image' && (
                  <span className="text-xs text-primary">📷 Image</span>
                )}
                {mediaType === 'video' && (
                  <span className="text-xs text-primary">🎬 Video</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (!content.trim() && !image && !video)}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
      <BottomNav />
    </>
  );
}