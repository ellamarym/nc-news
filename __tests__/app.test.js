const e = require("express");
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

describe ('POST /api/articles/:article_id/comments', () => {
  test('201 - new comment added to table', () => {
    const newComment = {
      username: 'butter_bridge',
      body: "this article is a big pile of poo"
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(201)
    .then(({body}) => {
      expect(body.comment).toEqual({
        comment_id: 19,
        article_id: 1, 
        created_at: expect.any(String),
        votes: expect.any(Number),
        author: 'butter_bridge',
        body: "this article is a big pile of poo"
      })
    })
  });
  test('404 - article id valid but non-existent', () => {
    const newComment = {
      username: 'butter_bridge',
      body: "this article is a big pile of poo"}
      return request(app)
      .post('/api/articles/2050/comments')
    .send(newComment)
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toBe('article not found')
    })
    })
    test('400 - not a valid article id', () => {
      const newComment = {
        username: 'butter_bridge',
        body: "this article is a big pile of poo"}
        return request(app)
        .post('/api/articles/invalid/comments')
      .send(newComment)
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
    })
    test('401 - not a valid username', () => {
      const newComment = {
        username: 'margarine_bridge',
        body: "this article is a big pile of poo"}
        return request(app)
        .post('/api/articles/1/comments')
      .send(newComment)
      .expect(401)
      .then(({body}) => {
        expect(body.msg).toBe('invalid username')
      })
    })
    test('422 - comment input invalid due to mispelling of username key', () => {
      const newComment = {
        name: 'margarine_bridge',
        body: "this article is a big pile of poo"}
        return request(app)
        .post('/api/articles/1/comments')
      .send(newComment)
      .expect(422)
      .then(({body}) => {
        expect(body.msg).toBe('invalid user input')
      })
    })
    test('422 - comment input invalid due to mispelling of body key', () => {
      const newComment = {
        username: 'margarine_bridge',
        bodii: "this article is a big pile of poo"}
        return request(app)
        .post('/api/articles/1/comments')
      .send(newComment)
      .expect(422)
      .then(({body}) => {
        expect(body.msg).toBe('invalid user input')
      })
    })
  });



describe('8. PATCH /api/articles/:article_id', () =>{
 test('201 - positive vote change adds votes to count', () => {
    return request(app)
    .patch('/api/articles/1')
    .send({inc_votes : 100})
    .expect(200)
    .then(({body}) => {
      expect(body.article).toMatchObject({
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: expect.any(String),
        votes: 200,
        article_id: 1
      })
    })
 });
 test('201 - negative vote change subtracts votes to count', () => {
  return request(app)
  .patch('/api/articles/2')
  .send({inc_votes : -100})
  .expect(200)
  .then(({body}) => {
    expect(body.article).toMatchObject({
      title: "Sony Vaio; or, The Laptop",
      topic: "mitch",
      author: "icellusedkars",
      body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
      created_at: expect.any(String),
      votes: -100,
      article_id: 2
    })
  })
});
test('404 - valid but non-existent article id', () => {
  return request(app)
  .patch('/api/articles/200')
  .send({inc_votes: 200})
  .expect(404)
  .then(({body})=> {
    expect(body.msg).toBe('article not found')
  })
});
test('400 - invalid article id', () => {
  return request(app)
  .patch('/api/articles/invalid')
  .send({inc_votes: 1})
  .expect(400)
  .then(({body})=> {
    expect(body.msg).toBe('bad request')
  })
})
test('400 - invalid vote input', () => {
  return request(app)
  .patch('/api/articles/1')
  .send({inc_votes: 'banana'})
  .expect(400)
  .then(({body}) => {
    expect(body.msg).toBe('bad request')
  })
})
test('422 - input invalid due to mispelling of key', () => {
  return request(app)
  .patch('/api/articles/1')
  .send({inc_voters: 5})
  .expect(422)
  .then(({body})=> {
    expect(body.msg).toBe('invalid user input')
  })
})
})

describe(' GET /api/users', () => {
    test('200 - returns with an array of users', () => {
      return request(app)
      .get('/api/users')
      .expect(200)
      .then(({body}) => {
        expect(body.users.length).toBeGreaterThan(0)
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
          })
        })
      })
    });
  })



describe('10. GET /api/articles (queries)', () => {
  test('200 - topic query added and returned articles match this topic', () => {
    return request(app)
    .get('/api/articles?topic=cats')
    .expect(200)
    .then(({body})=> {
      expect(body.articles.length).toBeGreaterThan(0)
      body.articles.forEach((article) => {
        expect(article).toMatchObject({
          title: expect.any(String),
          topic: "cats",
          author: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_id: expect.any(Number),
          comment_count: expect.any(Number)
        })
      })
    })
  });
  test('404 - valid but non-existent topic', () => {
    return request(app)
    .get('/api/articles?topic=bums')
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('topic not found')
    })
  })
  test('200 - no articles with given topic', () => {
    return request(app)
    .get('/api/articles?topic=paper')
    .expect(200)
    .then(({body})=> {
      expect(body.articles).toEqual([])
    })
  })
  test('200 - sorts by by given column, defaulting to descending ', () => {
    return request(app)
    .get('/api/articles?sortby=author')
    .expect(200)
    .then(({body})=> {
      expect(body.articles.length).toBeGreaterThan(0)
      expect(body.articles).toBeSortedBy('author', {descending: true})
    })
  })
  test('200 - order given and sorts by that' , () => {
    return request(app)
    .get('/api/articles?order=asc')
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).toBeGreaterThan(0)
      expect(body.articles).toBeSortedBy('created_at')
    })
  })
  test('200 - query supermix - multiple queries working together', () => {
    return request(app)
    .get('/api/articles?topic=mitch&sortby=title&order=asc')
    .expect(200)
    .then(({body})=> {
      expect(body.articles).toBeSortedBy('title')
      expect(body.articles.length).toBeGreaterThan(0)
      body.articles.forEach((article) => {
        expect(article).toMatchObject({
          title: expect.any(String),
          topic: "mitch",
          author: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_id: expect.any(Number),
          comment_count: expect.any(Number)
        })
      })
    })
  })
  test('400 - invalid sort query', () => {
    return request(app)
    .get('/api/articles?sortby=lemons')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid sort query')
    })
  });
  test('400 - invalid order query', () => {
    return request(app)
    .get('/api/articles?order=right')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid order query')
    })
  });
})

//ticket 11 here

describe('12. DELETE /api/comments/:comment_id', () => {
  test('204 - comment deleted and no content returned ', () => {
    return request(app)
    .delete('/api/comments/1')
    .expect(204)
  });
  xtest('404 - valid but non-existent comment id', () => {
    return request(app)
    .delete('/api/comments/1000')
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('comment not found')
    })
    
  })
})