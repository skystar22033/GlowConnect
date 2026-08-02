import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Avatar from '../common/Avatar';
import { postApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function CommentSection({ postId, onCommentAdded, onCommentDeleted }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    postApi
      .getById(postId)
      .then((res) => {
        if (!cancelled) setComments(res.data.data.post.comments || []);
      })
      .catch(() => toast.error('Could not load comments'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await postApi.addComment(postId, text.trim());
      setComments((prev) => [res.data.data.comment, ...prev]);
      setText('');
      onCommentAdded?.();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await postApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      onCommentDeleted?.();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not delete comment');
    }
  };

  return (
    <div className="comment-section animate-fade-in">
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={500}
          className="input-field text-sm"
        />
        <button type="submit" disabled={submitting || !text.trim()} className="btn-primary px-3.5">
          <Send className="h-4 w-4" />
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-text-faint">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-faint">No comments yet. Be the first to say something.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment._id} className="flex items-start gap-2.5">
              <Avatar src={comment.author?.profileImage} name={comment.author?.fullName} size="sm" />
              <div className="comment-body">
                <div className="flex items-center justify-between gap-2">
                  <p className="comment-username">{comment.author?.fullName}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-faint">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.author?._id === user?._id && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-text-faint transition hover:text-accent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
