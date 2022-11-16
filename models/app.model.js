const { checkArticleExists } = require('../db/apputils')
const db = require('../db/connection')
const articles = require('../db/data/test-data/articles')

exports.fetchTopics = () => {
    return db.query(`
    SELECT * FROM topics;
    `).then((topics) => {
        return topics.rows
    })
}

exports.fetchArticles = () => {
    return db.query(`
    SELECT title, topic, articles.author, articles.article_id, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS int) AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC
    ;
    `).then((articles)=> {
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