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

describe('PATCH /api/articles/:article_id', () =>{
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

describe('/api/users', () => {
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

describe('GET /api/articles (queries)', () => {
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
    .get('/api/articles?topic=invalid')
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

describe('/api/articles/:article_id (comment count)', () => {
  test('200 - returns article with comment count included ', () => {
    return request(app)
    .get('/api/articles/1')
    .expect(200)
    .then(({body})=> {
      expect(body.article).toMatchObject({
          article_id: 1,
          comment_count : expect.any(Number)
    })
  })
  });
})

describe('DELETE /api/comments/:comment_id', () => {
  test('204 - comment deleted and no content returned ', () => {
    return request(app)
    .delete('/api/comments/1')
    .expect(204)
  });
  test('404 - valid but non-existent comment id', () => {
    return request(app)
    .delete('/api/comments/1000')
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('comment not found')
    })
  })
  test('400 - invalid comment id', () => {
    return request(app)
    .delete('/api/comments/invalid')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('bad request')
    })
  })
})

describe('GET /api' , () => {
  test('200 - responds with JSON object of endpoint descriptions', () => {
    return request(app)
    .get('/api')
    .expect(200)
    .then(({body}) => {
      expect(typeof body.endpoints).toBe('object')
      expect(body.endpoints).toMatchObject({
        "GET /api" : expect.any(Object),
        "GET /api/topics": expect.any(Object),
        "GET /api/articles": expect.any(Object),
        "GET /api/articles/:article_id" : expect.any(Object),
        "GET/api/articles/:article_id/comments" : expect.any(Object),
        "POST /api/articles/:article_id/comments" : expect.any(Object),
        "PATCH /api/articles/:article_id" : expect.any(Object),
        "GET /api/users" : expect.any(Object),
        "DELETE /api/comments/:comment_id" : expect.any(Object)
      })
    })
  });
})

describe('GET /api/users/:username', () => {
  test('200 - returns with user object with given username', () => {
    return request(app)
    .get('/api/users/icellusedkars')
    .expect(200)
    .then(({body}) => {
      expect(body.user).toMatchObject({
        username: 'icellusedkars',
        avatar_url: expect.any(String),
        name: expect.any(String)
      })
    })
  });
  test('400 - invalid username', () => {
    return request(app)
    .get('/api/users/35')
    .expect(404)
    .then(({body})=>{
      expect(body.msg).toBe('no such user')
    })
  })
})

describe('PATCH /api/comments/:comment_id', ()=> {
  test('200 - responds with comment object with updated vote count (increment)', ()=> {
    return request(app)
    .patch('/api/comments/1')
    .send({inc_votes : 2 })
    .expect(200)
    .then(({body})=> {
      expect(body.comment).toMatchObject({
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 18,
        author: "butter_bridge",
        article_id: 9,
        created_at: expect.any(String),
      })
    })
  })
  test('200 - responds with comment object with updated vote count (decrement)', ()=> {
    return request(app)
    .patch('/api/comments/1')
    .send({inc_votes : -2 })
    .expect(200)
    .then(({body})=> {
      expect(body.comment).toMatchObject({
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 14,
        author: "butter_bridge",
        article_id: 9,
        created_at: expect.any(String),
      })
    })
  })
  test('404 - valid but non-existent comment id', () => {
    return request(app)
    .patch('/api/comments/1000')
    .send({inc_votes : 1})
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('comment not found')
    })
  })
  test('400 - invalid comment id', () => {
    return request(app)
    .patch('/api/comments/invalid')
    .send({inc_votes : 1})
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('bad request')
    })
  })
  test('400 - invalid vote input', () => {
    return request(app)
    .patch('/api/comments/1')
    .send({inc_votes : 'banana'})
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('bad request')
    })
  })
  test('422 - input invalid due to mispelling of key', () => {
    return request(app)
    .patch('/api/comments/1')
    .send({change_votes : 1})
    .expect(422)
    .then(({body})=> {
      expect(body.msg).toBe('invalid user input')
    })
  })
})

describe('POST /api/articles', () => {
  test('201 - new article created and returned', () => {
    const newArticle = {
      author: 'butter_bridge' , 
      title: 'This is an article' , 
      body: 'This is a very boring article', 
      topic: 'paper'}
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(201)
    .then(({body})=> {
      expect(body.article).toMatchObject({
        article_id: expect.any(Number),
        votes: 0,
        created_at: expect.any(String),
        comment_count: 0,
        ...newArticle
      })
    })
  })
  test('404 - valid but non existent user', ()=> {
    const newArticle = {
      author: 'not valid user' , 
      title: 'This is an article' , 
      body: 'This is a very boring article', 
      topic: 'paper'}
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('no such user')
    })
  })
  test('422 - invalid input - missing keys', ()=> {
    const newArticle = {
      author: 'butter_bridge' ,  
      body: 'This is a very boring article', 
      topic: 'paper'}
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(422)
    .then(({body})=> {
      expect(body.msg).toBe('invalid user input')
    })
  })
  test('404 - valid but non existent topic', ()=> {
    const newArticle = {
      author: 'butter_bridge' , 
      title: 'This is an article' , 
      body: 'This is a very boring article', 
      topic: 'noTopic'}
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('topic not found')
    })
  })
})

describe('GET /api/articles (pagination)', () => {
  test('200 - limit query applied', () => {
    return request(app)
    .get('/api/articles?limit=6')
    .expect(200)
    .then(({body})=> {
      expect(body.articles.length).toBe(6)
      body.articles.forEach((article) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: expect.any(String),
          votes: expect.any(Number),
          comment_count: expect.any(Number),
          total_count: expect.any(Number)
        })
      })
    })
  })
  test('200 - limit query and topic query applied, total count returns correct total count', () => {
    return request(app)
    .get('/api/articles?limit=5&topic=mitch')
    .expect(200)
    .then(({body})=> {
      expect(body.articles.length).toBe(5)
      body.articles.forEach((article) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: 'mitch',
          votes: expect.any(Number),
          comment_count: expect.any(Number),
          total_count: 11
        })
      })
    })
  })
  test('200 - limit query and pagination query applied', () => {
    return request(app)
    .get('/api/articles?limit=5&p=2')
    .expect(200)
    .then(({body})=> {
      expect(body.articles.length).toBe(5)
      expect(body.articles[0]).toEqual( 
        {
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          article_id: 1,
          created_at: '2020-07-09T20:11:00.000Z',
          votes: 100,
          comment_count: 11,
          total_count: 12
        },
      )
    })
  })
  test('400 - invalid limit query', () => {
    return request(app)
    .get('/api/articles?limit=invalid')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid limit query')
    })
  })
  test('400 - invalid page query', () => {
    return request(app)
    .get('/api/articles?limit=5&p=invalid')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid page query')
    })
  })
  test('400 - invalid page query', () => {
    return request(app)
    .get('/api/articles?limit=5&p=-1')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid page query')
    })
  })
})

describe('GET /api/articles/:article_id/comments (pagination)', () => {
  test('200 - limit query applied, should return limited comments', () => {
    return request(app)
    .get('/api/articles/1/comments?limit=5')
    .expect(200)
    .then(({body})=> {
      expect(body.comments.length).toBe(5)
    })
  });
  test('200 - limit and page query applied, returns correct comments', () => {
    return request(app)
    .get('/api/articles/1/comments?limit=2&p=2')
    .expect(200)
    .then(({body})=>{
      expect(body.comments.length).toBe(2)
      expect(body.comments[0]).toEqual({
        comment_id: 4,
        votes: -100,
        created_at: '2020-02-23T12:01:00.000Z',
        author: 'icellusedkars',
        body: ' I carry a log — yes. Is it funny to you? It is not to me.'
      })
    })
  })
  test('400 - invalid limit query', () => {
    return request(app)
    .get('/api/articles/1/comments?limit=invalid')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid limit query')
    })
  })
  test('400 - invalid page query', () => {
    return request(app)
    .get('/api/articles/1/comments?limit=5&p=invalid')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid page query')
    })
  })
  test('400 - invalid page query', () => {
    return request(app)
    .get('/api/articles/1/comments?limit=5&p=-1')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('invalid page query')
    })
  })
})

describe('POST /api/topics', () => {
  test('200 - adds new topic, returns topic', ()=> {
    return request(app)
    .post('/api/topics')
    .send({
      slug: "topical",
      description: "welcome to the top"
    })
    .expect(201)
    .then(({body}) => {
      expect(body.topic).toEqual({  
      slug: "topical",
      description: "welcome to the top"})
    })
  })
  test('422 - invalid input', () => {
    return request(app)
    .post('/api/topics')
    .send({
      topic: 'topical',
      description: "its topic time"
    })
    .expect(422)
    .then(({body}) => {
      expect(body.msg).toBe('invalid user input')
    })
  } )
})

describe(' DELETE /api/articles/:article_id', () => {
  test('204 - deletes article', () => {
    return request(app)
    .delete('/api/articles/4')
    .expect(204)
  });
  test('404 - valid but non-existent article id', () => {
    return request(app)
    .delete('/api/articles/1000')
    .expect(404)
    .then(({body})=> {
      expect(body.msg).toBe('article not found')
    })
  })
  test('400 - invalid article id', () => {
    return request(app)
    .delete('/api/articles/invalid')
    .expect(400)
    .then(({body})=> {
      expect(body.msg).toBe('bad request')
    })
  })

})