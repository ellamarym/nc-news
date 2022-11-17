const { checkArticleExists, checkCommentExists } = require('../db/apputils')
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

exports.fetchArticles = (topic, sortBy, order) => {
    
    const queryValues = []
    let queryString = `
    SELECT title, topic, articles.author, articles.article_id, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS int) AS comment_count
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

    return db.query(queryString, queryValues).then((articles)=> {
        return articles.rows

    })
}

exports.fetchArticleById = (articleId) => {
   const queryString = `
   SELECT * FROM articles
   WHERE article_id = $1
   `
   return db.query(queryString, [articleId]).then((article) => {
    if(!article.rows.length) {
       return Promise.reject({status: 404, msg: 'article not found'})
    }
    return article.rows[0]
   })
}

exports.fetchCommentsByArticleId = (article_id) => {
        const queryString = `
        SELECT comment_id, votes, created_at, author, body FROM comments
        WHERE article_id = $1
        `
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

//ticket 11

exports.removeCommentById = (commentId) => {
    checkCommentExists(commentId)
   return db.query(`
   DELETE FROM comments 
   WHERE comment_id = $1
   `, [commentId])

}