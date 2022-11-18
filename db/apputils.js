const db = require('../db/connection')

exports.checkCommentExists = (comment_id) => {
    return db.query(
        `SELECT * FROM comments
        WHERE comment_id = $1
        `, [comment_id]
    ).then((comment) => {
        if(!comment.rows.length) {
            return Promise.reject({status: 404, msg: 'comment not found'})
        }
    })
}

exports.countArticles =  (topic) => {
    const queryString =  `SELECT * FROM articles`
    if(topic) { 
        queryString += ` WHERE topic = $1`
        }
    return db.query(queryString, [topic]).then((articles) => {
        return articles.rows.length
    })
}
