const db = require('../db/connection')

exports.checkArticleExists = (article_id) => {
    return db.query(
        `SELECT * FROM articles
        WHERE article_id = $1
        `, [article_id]
    ).then((article) => {
        if(!article.rows.length) {
            return Promise.reject({status: 404, msg: 'no article with this id'})
        }
    })
}