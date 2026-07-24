import api from './axios';

// ---- Auth ----
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
};

// ---- Users ----
export const userApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, payload) => api.put(`/users/${id}`, payload),
  search: (q) => api.get('/users/search', { params: { q } }),
  toggleFollow: (id) => api.post(`/users/${id}/follow`),
  uploadAvatar: (formData) =>
    api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ---- Posts ----
export const postApi = {
  getFeed: (page = 1, limit = 10) => api.get('/posts/feed', { params: { page, limit } }),
  getUserPosts: (userId, page = 1, limit = 12) =>
    api.get(`/posts/user/${userId}`, { params: { page, limit } }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (formData) =>
    api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};
