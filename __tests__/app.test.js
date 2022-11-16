const request = require("supertest");
const app = require('../app');
const db = require('../db/connection');
const testData = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')
beforeEach(() => seed( testData ));
afterAll(() => db.end());


describe('GET /api/topics' , () => {
  test('responds with array of topic objects with keys of slug and description', () => {
    return request(app)
    .get('/api/topics')
    .expect(200)
    .then(({body})=> {
      expect(body.topics.length).toBeGreaterThan(0);
      body.topics.forEach((topic) => {
        expect(topic).toMatchObject({
          description: expect.any(String),
          slug: expect.any(String)
        })
      })
    })
  })
    test('404 - link not found', () => {
      return request(app)
      .get("/api/notvalidlink")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('link not found')
      })
    });
})

describe('GET /api/articles', () => {
  test('responds with an array of objects, with author, title, article-id, topic, created-at, votes, and comment count keys', () => {
    return request(app)
    .get('/api/articles')
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).toBeGreaterThan(0)
      body.articles.forEach((article) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: expect.any(String),
          votes: expect.any(Number),
          comment_count: expect.any(Number)
        })
      })
    })
  });
  test('objects are sorted by date in descending order', () => {
    return request(app)
    .get('/api/articles')
    .expect(200)
    .then(({body}) => {
      expect(body.articles).toBeSortedBy('created_at', {descending : true})
    })
  }); 
})

describe('GET /api/articles/:article_id', () => {
  test('200 - should return an article object with given article-id', () => {
    return request(app)
    .get('/api/articles/1')
    .expect(200)
    .then(({body})=> {
      expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          topic: expect.any(String),
          votes: expect.any(Number),
          body: expect.any(String),
          created_at : expect.any(String)
    })
  })
  });
  test('404 - article id valid but non-existent ', () => {
    return request(app)
    .get('/api/articles/300')
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('article not found')
    })
  });
  test('400 - invalid article id', () => {
    return request(app)
    .get('/api/articles/notValidId')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('bad request')
    })
  })
})

describe('GET/api/articles/:article_id/comments', ()=> {
  test('200 - returns with array of comments for the given article', () => {
    return request(app)
    .get('/api/articles/1/comments')
    .expect(200)
    .then(({body})=> {
      expect(body.comments.length).toBeGreaterThan(0)
      body.comments.forEach((comment) => {
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String)
        })
      })
    })
  });
  test('404 - valid but non-existent article id', () => {
    return request(app)
    .get('/api/articles/300/comments')
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('article not found')
    })
  })
  test('200 - returns with empty array when given article has no comments', () => {
    return request(app)
    .get('/api/articles/2/comments')
    .expect(200)
    .then(({body})=> {
      expect(body.comments).toEqual([])
    })
  })
  test('400 - invalid article id', () => {
    return request(app)
    .get('/api/articles/invalidId/comments')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('bad request')
    })
  });
})

//ticket 7 tests here 

// describe('8. PATCH /api/articles/:article_id', () =>{
//   const voteChange = {inc_votes: 100}
//   return request(app)
//   .patch('/api/articles/1')
//   .send(voteChange)
// })