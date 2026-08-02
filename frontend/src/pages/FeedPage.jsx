import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Search, PlusSquare, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import PostSkeleton from '../components/post/PostSkeleton';

// ✅ Define API URL once
const API_URL = 'http://localhost:5001/api';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [liking, setLiking] = useState({});

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use port 5001
      const res = await axios.get(`${API_URL}/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data.data?.posts || []);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== LIKE FUNCTION ====================
  const handleLike = async (postId) => {
    if (liking[postId]) return;
    
    setLiking({ ...liking, [postId]: true });
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use port 5001
      await axios.post(
        `${API_URL}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLiking({ ...liking, [postId]: false });
    }
  };

  // ==================== COMMENT FUNCTIONS ====================
  
  const toggleComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  // ✅ FIXED: Add a comment with correct URL
  const handleAddComment = async (postId) => {
    console.log('========== COMMENT DEBUG ==========');
    console.log('postId received:', postId);
    console.log('Type of postId:', typeof postId);
    console.log('Is postId valid?', postId && postId.length === 24);
    console.log('=====================================');

    const text = commentText[postId]?.trim();
    if (!text) return;
    if (submittingComment[postId]) return;

    setSubmittingComment({ ...submittingComment, [postId]: true });
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use the correct URL - /api/comments/post/:postId
      const response = await axios.post(
        `${API_URL}/comments/post/${postId}`,  // ← FIXED!
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Comment added:', response.data);
      setCommentText({ ...commentText, [postId]: '' });
      fetchFeed();
    } catch (error) {
      console.error('Error adding comment:', error);
      console.error('Error response data:', error.response?.data);
    } finally {
      setSubmittingComment({ ...submittingComment, [postId]: false });
    }
  };

  // ✅ FIXED: Delete comment with correct URL
  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use the correct URL
      await axios.delete(
        `${API_URL}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeed();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // ==================== SKELETON LOADING ====================
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="feed-container">
          <div className="mb-6 flex items-center justify-between">
            <div className="skeleton h-8 w-32 rounded-lg" />
            <div className="skeleton h-9 w-32 rounded-full" />
          </div>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </>
    );
  }

  // ==================== RENDER ====================
  return (
    <>
      <Navbar />
      <div className="feed-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display text-text-primary">Feed</h1>
          <Link to="/search" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Find People
          </Link>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 text-center py-16">
            <div className="relative mb-1 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-float rounded-full bg-gradient-brand opacity-15 blur-xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-card ring-1 ring-border-light">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold font-display text-text-primary">No posts yet</h3>
            <p className="text-text-muted max-w-sm">Follow some users to see their posts here!</p>
            <Link to="/search" className="btn-primary mt-1 flex items-center gap-2">
              <PlusSquare className="w-4 h-4" />
              Find People
            </Link>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = post.likes?.some((like) => like._id === user?._id);
            const comments = post.comments || [];
            const isCommentVisible = showComments[post._id] || false;

            return (
              <div key={post._id} className="post-card">
                {/* ========== POST HEADER ========== */}
                <div className="post-header">
                  <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="post-avatar">
                      {post.author?.profileImage ? (
                        <img src={post.author.profileImage} alt={post.author.username} />
                      ) : (
                        post.author?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="post-username truncate">{post.author?.fullName || post.author?.username}</div>
                      <div className="post-timestamp truncate">
                        @{post.author?.username} · {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                  <button className="rounded-full p-1.5 text-text-faint transition hover:bg-surface-raised hover:text-text-primary">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* ========== POST CONTENT ========== */}
                <div className="post-content">{post.content}</div>

                {post.image && (
                  <img src={post.image} alt="Post" className="post-image" />
                )}

                {/* ========== POST ACTIONS ========== */}
                <div className="post-actions">
                  <button
                    onClick={() => handleLike(post._id)}
                    disabled={liking[post._id]}
                    className={`post-action-btn ${isLiked ? 'liked' : ''}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
                    />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => toggleComments(post._id)}
                    className="post-action-btn"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{comments.length}</span>
                  </button>
                  
                  <button className="post-action-btn">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                {/* ========== COMMENT SECTION ========== */}
                <div className="comment-section">
                  {/* Show comments count and toggle */}
                  {comments.length > 0 && (
                    <button
                      onClick={() => toggleComments(post._id)}
                      className="text-sm text-text-muted hover:text-primary transition-colors mb-2"
                    >
                      {isCommentVisible ? 'Hide' : 'View all'} {comments.length} comment{comments.length > 1 ? 's' : ''}
                    </button>
                  )}

                  {/* Comments list */}
                  {isCommentVisible && comments.length > 0 && (
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                      {comments.map((comment) => {
                        const isOwnComment = comment.author?._id === user?._id;
                        return (
                          <div key={comment._id} className="comment-item">
                            <Link to={`/profile/${comment.author?._id}`} className="comment-avatar flex-shrink-0">
                              {comment.author?.profileImage ? (
                                <img 
                                  src={comment.author.profileImage} 
                                  alt={comment.author.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                comment.author?.username?.charAt(0).toUpperCase() || 'U'
                              )}
                            </Link>
                            <div className="comment-body">
                              <div className="flex items-center gap-2">
                                <Link 
                                  to={`/profile/${comment.author?._id}`}
                                  className="comment-username hover:text-primary transition-colors"
                                >
                                  @{comment.author?.username}
                                </Link>
                                {isOwnComment && (
                                  <button
                                    onClick={() => handleDeleteComment(post._id, comment._id)}
                                    className="text-text-faint hover:text-bloom transition-colors"
                                    title="Delete comment"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="comment-text">{comment.content}</div>
                              <div className="text-xs text-text-faint mt-0.5">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add comment input */}
                  <div className="comment-input mt-3">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(post._id);
                        }
                      }}
                      disabled={submittingComment[post._id]}
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      disabled={!commentText[post._id]?.trim() || submittingComment[post._id]}
                      className="btn-primary text-sm py-1.5 px-4"
                    >
                      {submittingComment[post._id] ? '...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}