import { useState, useRef } from 'react';
import { X, Loader2, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import Avatar from '../common/Avatar';
import { userApi } from '../../api/endpoints';
import compressImage from '../../utils/compressImage';

const BIO_LIMIT = 160;

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [profileImage, setProfileImage] = useState(profile.profileImage || '');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilePick = () => fileInputRef.current?.click();

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    setUploadingAvatar(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 800, quality: 0.85 });
      const formData = new FormData();
      formData.append('avatar', compressed);
      const res = await userApi.uploadAvatar(formData);
      setProfileImage(res.data.data.profileImage);
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await userApi.updateProfile(profile._id, {
        fullName: fullName.trim(),
        bio: bio.trim(),
        ...(profileImage.trim() && { profileImage: profileImage.trim() }),
      });
      toast.success('Profile updated');
      onSaved(res.data.data.user);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Edit profile</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-text-faint hover:bg-surface-raised">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <button type="button" onClick={handleFilePick} className="relative" disabled={uploadingAvatar}>
              <Avatar src={profileImage} name={fullName} size="xl" />
              <span className="absolute bottom-0 right-0 rounded-full bg-glow p-1.5 text-ink">
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFile}
              className="hidden"
            />
          </div>
          <p className="-mt-2 text-center text-xs text-text-faint">Tap the photo to upload a new one</p>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Full name</label>
            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Bio</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_LIMIT))}
            />
            <p className="mt-1 text-right text-xs text-text-faint">
              {bio.length}/{BIO_LIMIT}
            </p>
          </div>

          <button type="submit" disabled={submitting || uploadingAvatar} className="btn-primary w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

