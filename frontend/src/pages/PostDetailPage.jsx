import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import { postApi } from '../api/endpoints';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    postApi
      .getById(id)
      .then((res) => setPost(res.data.data.post))
      .catch((err) => {
        toast.error(err.friendlyMessage || 'Post not found');
        navigate('/feed');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-text-muted transition hover:bg-surface-raised hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {loading ? <PostSkeleton /> : post ? (
          <PostCard post={post} onDeleted={() => navigate('/feed')} />
        ) : null}
      </div>
    </MainLayout>
  );
}
