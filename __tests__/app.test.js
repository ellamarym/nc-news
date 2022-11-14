const request = require("supertest");
const app = require('../app');
const db = require('../db/connection');
const testData = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')
beforeEach(() => seed( testData ));
afterAll(() => {
    if (db.end) db.end();
  });


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

