import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { postApi } from '../../api/endpoints';
import compressImage from '../../utils/compressImage';

const MAX_CHARS = 2000;

export default function CreatePostModal({ onClose, onCreated, editingPost = null }) {
  const [content, setContent] = useState(editingPost?.content || '');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(editingPost?.image || null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!editingPost;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be under 8MB');
      return;
    }
    const compressed = await compressImage(file);
    setImageFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Write something before posting');
      return;
    }

    const formData = new FormData();
    formData.append('content', content.trim());
    if (imageFile) formData.append('image', imageFile);

    setSubmitting(true);
    try {
      const res = isEditing
        ? await postApi.update(editingPost._id, formData)
        : await postApi.create(formData);
      toast.success(isEditing ? 'Post updated' : 'Post published');
      onCreated(res.data.data.post);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{isEditing ? 'Edit post' : 'Create post'}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-faint hover:bg-surface-raised">
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

          {preview && (
            <div className="relative mt-2">
              <img src={preview} alt="Preview" className="max-h-64 w-full rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 hover:bg-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-text-muted transition hover:bg-surface-raised hover:text-glow"
            >
              <ImageIcon className="h-4 w-4" /> Add photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save changes' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
