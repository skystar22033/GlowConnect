import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Search, PlusSquare, Sparkles, X, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/navigation/BottomNav';
import PostSkeleton from '../components/post/PostSkeleton';

const API_URL = 'http://localhost:5001/api';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [liking, setLiking] = useState({});
  const [mutedVideos, setMutedVideos] = useState({});

  useEffect(() => {
    fetchFeed();
  }, []);

  const getToken = () => {
    return localStorage.getItem('glowconnect_token') || localStorage.getItem('token');
  };

  const fetchFeed = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data.data?.posts || []);
    } catch (error) {
      console.error('❌ Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (liking[postId]) return;
    setLiking({ ...liking, [postId]: true });
    try {
      const token = getToken();
      await axios.post(`${API_URL}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLiking({ ...liking, [postId]: false });
    }
  };

  const toggleComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    setSubmittingComment({ ...submittingComment, [postId]: true });
    try {
      const token = getToken();
      await axios.post(`${API_URL}/comments/post/${postId}`, { content: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentText({ ...commentText, [postId]: '' });
      fetchFeed();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment({ ...submittingComment, [postId]: false });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeed();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleMute = (postId) => {
    setMutedVideos(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // ✅ Helper function to get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="feed-container max-w-2xl mx-auto px-4 pt-4 pb-20">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
        <BottomNav />
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <Navbar />
        <div className="feed-container max-w-2xl mx-auto px-4 pt-4 pb-20">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h1 className="text-xl font-bold font-display">Feed</h1>
            <Link to="/search" className="text-primary text-sm font-semibold">
              Find People
            </Link>
          </div>
          <div className="card flex flex-col items-center gap-3 text-center py-16 animate-fade-in">
            <div className="relative mb-1 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-float rounded-full bg-gradient-brand opacity-15 blur-xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-card ring-1 ring-border-light">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold font-display text-text-primary">No posts yet</h3>
            <p className="text-text-muted max-w-sm">Create your first post or follow users!</p>
            <Link to="/search" className="btn-primary mt-1 flex items-center gap-2">
              <PlusSquare className="w-4 h-4" />
              Find People
            </Link>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="feed-container max-w-2xl mx-auto px-0 pt-0 pb-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="text-xl font-bold font-display">Feed</h1>
          <Link to="/search" className="text-primary text-sm font-semibold">
            Find People
          </Link>
        </div>

        {posts.map((post, index) => {
          const isLiked = post.likes?.some((like) => like._id === user?._id);
          const comments = post.comments || [];
          const isCommentVisible = showComments[post._id] || false;
          const isMuted = mutedVideos[post._id] || false;

          return (
            <div key={post._id} className="post-card rounded-none border-0 border-b border-border bg-transparent shadow-none p-0 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              {/* ✅ Post Header - No Avatar */}
              <div className="flex items-center gap-3 p-3">
                <Link to={`/profile/${post.author?._id}`}>
                  {post.author?.profileImage ? (
                    <img
                      src={post.author.profileImage}
                      alt={post.author.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(post.author?.fullName || post.author?.username)}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${post.author?._id}`} className="font-semibold text-sm hover:underline">
                    {post.author?.fullName || post.author?.username}
                  </Link>
                  <p className="text-xs text-text-muted">
                    @{post.author?.username} · {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button className="p-1.5 rounded-full hover:bg-surface-raised transition">
                  <MoreHorizontal className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              {/* Post Content */}
              <p className="px-3 pb-2 text-sm">{post.content}</p>

              {post.image && (
                <img src={post.image} alt="Post" className="w-full aspect-square object-cover" />
              )}

              {post.video && (
                <div className="relative w-full aspect-square bg-black">
                  <video 
                    src={post.video} 
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    controls
                    loop
                    playsInline
                  />
                  <button 
                    onClick={() => toggleMute(post._id)} 
                    className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-4 px-3 py-2">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center gap-1 ${isLiked ? 'text-bloom' : 'text-text-muted'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes?.length || 0}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post._id)}
                  className="flex items-center gap-1 text-text-muted hover:text-primary"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </button>
                <button className="flex items-center gap-1 text-text-muted">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Comments */}
              {isCommentVisible && (
                <div className="comment-section px-3 pb-3">
                  {comments.length === 0 ? (
                    <p className="text-sm text-text-muted py-2">No comments yet. Be the first!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 py-1">
                        {comment.author?.profileImage ? (
                          <img
                            src={comment.author.profileImage}
                            alt={comment.author.fullName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-[10px]">
                            {getInitials(comment.author?.fullName || comment.author?.username)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm">
                            <Link to={`/profile/${comment.author?._id}`} className="font-semibold hover:underline">
                              {comment.author?.username}
                            </Link>{' '}
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      className="flex-1 bg-transparent border-0 border-b border-border focus:ring-0 px-0 py-1 text-sm outline-none"
                    />
                    <button 
                      onClick={() => handleAddComment(post._id)} 
                      className="text-primary font-semibold text-sm disabled:opacity-50"
                      disabled={!commentText[post._id]?.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BottomNav />
    </>
  );
}