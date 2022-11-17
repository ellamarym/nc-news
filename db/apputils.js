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