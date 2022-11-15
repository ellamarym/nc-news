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
    SELECT title, topic, articles.author, articles.article_id, articles.created_at, articles.votes, COUNT(comments.article_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC
    ;
    `).then((articles)=> {
       const countToNums = articles.rows.map((article) => {
        let count = parseInt(article.comment_count)
        article.comment_count = count
        return article
       })
        return articles.rows
    })
}