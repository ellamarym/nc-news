const d = require('d')
const { checkArticleExists, checkCommentExists, countArticles } = require('../db/apputils')
const db = require('../db/connection')
const articles = require('../db/data/test-data/articles')

exports.fetchTopics = (topic) => {
    const queryValues = []
    let queryString = `
    SELECT * FROM topics
    `
    if(topic) {
        queryString += ' WHERE slug = $1'
        queryValues.push(topic)
    }
    return db.query(queryString, queryValues).then((topics) => {
        if(!topics.rows.length) {
            return Promise.reject({status: 404, msg: 'topic not found'})
         }
        
        return topics.rows
    })
}

exports.fetchArticles = (topic, sortBy, order, limit, page) => {
    const queryValues = []
    let queryString = `
    SELECT title, topic, articles.author, articles.article_id, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS int) AS comment_count,  CAST(COUNT(*) OVER() AS int) AS total_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    `
    if(topic) { 
        queryString += ` WHERE topic = $1`
        queryValues.push(topic)
        }

    queryString += ' GROUP BY articles.article_id'

    const validColumns = ['title', 'topic', 'author', 'article_id', 'created_at', 'votes', 'comment_count']
    if(sortBy && !validColumns.includes(sortBy)) {
        return Promise.reject({status: 400, msg: "invalid sort query"})    
    } else if(sortBy) {
        queryString += ` ORDER BY ${sortBy} `
    } else {
        queryString += ` ORDER BY articles.created_at `
    }
    if(!order) {
        queryString += 'DESC'
    } else {
        order = order.toUpperCase()
        if(order === 'ASC' || order ==='DESC') {
            queryString += order
        } else {
            return Promise.reject({status: 400, msg: "invalid order query"})
        }
    } 
    if(limit) {
        let offset = 0
        if(page) {
           let numPage = parseInt(page)
            if(numPage){
                offset = page*limit - limit 
            } else {
                return Promise.reject({status: 400, msg: "invalid page query"})
            }
        }
        queryString += ` LIMIT ${limit} OFFSET ${offset}`
    }

    return db.query(queryString, queryValues).then((articles)=> {
        return articles.rows

    })
}

exports.fetchArticleById = (articleId) => {
   const queryString = `
   SELECT title, topic, articles.author, articles.article_id, articles.body, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS int) AS comment_count
   FROM articles
   LEFT JOIN comments ON comments.article_id = articles.article_id
   WHERE articles.article_id = $1
   GROUP BY articles.article_id
   `
   return db.query(queryString, [articleId]).then((article) => {
    if(!article.rows.length) {
       return Promise.reject({status: 404, msg: 'article not found'})
    }
    return article.rows[0]
   })
}

exports.fetchCommentsByArticleId = (article_id, limit, page) => {
        let queryString = `
        SELECT comment_id, votes, created_at, author, body FROM comments
        WHERE article_id = $1
        `
        if(limit) {
            let offset = 0
            if(page) {
               let numPage = parseInt(page)
                if(numPage){
                    offset = page*limit - limit 
                   
                } else {
                    return Promise.reject({status: 400, msg: "invalid page query"})
                }
            }
            queryString += ` LIMIT ${limit} OFFSET ${offset}`
        }

        return db.query(queryString, [article_id])
    .then((comments) => {
        return comments.rows
    })
}

exports.insertCommentByArticleId = (articleId, {username, body}) => {
 
const queryString = `
INSERT INTO comments
(article_id, author, body)
VALUES
($1, $2, $3)
RETURNING *
`
return db.query(queryString, [articleId, username, body]).then((comment) => {
    
    return comment.rows[0]
})
}

exports.changeArticleById = (articleId, voteChange) => {
    const queryString = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *
    `
    return db.query(queryString, [voteChange, articleId]).then((article) => {
    return article.rows[0]
})

}

exports.fetchUsers = () => {
    return db.query(`
    SELECT * FROM users;
    `).then((users) => {
        return users.rows
    })
}


exports.removeCommentById = (commentId) => {
    return checkCommentExists(commentId)
    .then(()=> {
        return db.query(`
        DELETE FROM comments 
        WHERE comment_id = $1
        `, [commentId])
    })
}

exports.fetchUserByUsername = (username) => {
    const queryString = `
    SELECT * FROM users
    WHERE username = $1`
    return db.query(queryString, [username]).then((user) => {
        if(!user.rows.length) {
            return Promise.reject({status: 404, msg: 'no such user'})
        }
        return user.rows[0]
    })
}

exports.changeCommentById = async (comment_id, inc_votes) => {
    await checkCommentExists(comment_id)
    const changedComment = await db.query(`
        UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING *
    `, [inc_votes, comment_id])
    return changedComment.rows[0]
}

exports.insertArticle = async ({author, title, body, topic}) => {
    const queryString = `
    INSERT INTO articles
    (author, title, body, topic)
    VALUES 
    ($1, $2, $3, $4)
    RETURNING article_id;

    `
    const newArticle = await db.query(queryString, [author,title,body,topic])
    return newArticle.rows[0].article_id
}