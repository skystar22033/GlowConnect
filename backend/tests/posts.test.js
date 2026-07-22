const request = require('supertest');
const app = require('../app');

async function registerUser(overrides = {}) {
  const payload = {
    username: 'user' + Math.random().toString(36).slice(2, 8),
    email: `test${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: 'password123',
    fullName: 'Test User',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.data.token, user: res.body.data.user };
}

describe('Posts API', () => {
  test('creates a post and fetches it by id', async () => {
    const { token } = await registerUser();

    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('content', 'Hello GlowConnect!');
    expect(createRes.status).toBe(201);

    const postId = createRes.body.data.post._id;
    const getRes = await request(app).get(`/api/posts/${postId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.post.content).toBe('Hello GlowConnect!');
  });

  test('rejects posts with empty content', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('content', '   ');
    expect(res.status).toBe(400);
  });

  test('prevents non-owners from deleting a post', async () => {
    const { token: ownerToken } = await registerUser();
    const { token: otherToken } = await registerUser();

    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('content', 'Owner post');
    const postId = createRes.body.data.post._id;

    const deleteRes = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(deleteRes.status).toBe(403);
  });

  test('toggles like on a post', async () => {
    const { token } = await registerUser();
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('content', 'Like me');
    const postId = createRes.body.data.post._id;

    const likeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(likeRes.status).toBe(200);
    expect(likeRes.body.data.liked).toBe(true);
    expect(likeRes.body.data.likesCount).toBe(1);

    const unlikeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(unlikeRes.body.data.liked).toBe(false);
    expect(unlikeRes.body.data.likesCount).toBe(0);
  });

  test('adds and deletes a comment', async () => {
    const { token } = await registerUser();
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('content', 'Comment on me');
    const postId = createRes.body.data.post._id;

    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Nice post!' });
    expect(commentRes.status).toBe(201);

    const commentId = commentRes.body.data.comment._id;
    const deleteRes = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
  });

  test('feed only includes own posts and followed users posts', async () => {
    const { token: aToken, user: userA } = await registerUser();
    const { token: bToken, user: userB } = await registerUser();

    // userB posts, userA does not follow userB yet
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${bToken}`)
      .field('content', 'From B before follow');

    let feedRes = await request(app).get('/api/posts/feed').set('Authorization', `Bearer ${aToken}`);
    expect(feedRes.body.data.posts.length).toBe(0);

    // userA follows userB
    await request(app).post(`/api/users/${userB._id}/follow`).set('Authorization', `Bearer ${aToken}`);

    feedRes = await request(app).get('/api/posts/feed').set('Authorization', `Bearer ${aToken}`);
    expect(feedRes.body.data.posts.length).toBe(1);
  });
});

describe('Follow API', () => {
  test('toggles follow/unfollow between two users', async () => {
    const { token: aToken } = await registerUser();
    const { user: userB } = await registerUser();

    const followRes = await request(app)
      .post(`/api/users/${userB._id}/follow`)
      .set('Authorization', `Bearer ${aToken}`);
    expect(followRes.body.data.following).toBe(true);

    const unfollowRes = await request(app)
      .post(`/api/users/${userB._id}/follow`)
      .set('Authorization', `Bearer ${aToken}`);
    expect(unfollowRes.body.data.following).toBe(false);
  });

  test('rejects following yourself', async () => {
    const { token, user } = await registerUser();
    const res = await request(app)
      .post(`/api/users/${user._id}/follow`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
