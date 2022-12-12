
const {  checkCommentExists } = require('../db/apputils')
const db = require('../db/connection')

exports.fetchTopics = async (topic) => {
    const queryValues = []
    let queryString = `
    SELECT * FROM topics
    `
    if(topic) {
        queryString += ' WHERE slug = $1'
        queryValues.push(topic)
    }
    const topics = await db.query(queryString, queryValues)
        if(!topics.rows.length) {
            return Promise.reject({status: 404, msg: 'topic not found'})
         }
        
        return topics.rows
    
}

exports.fetchArticles = async (topic, sortBy, order, limit, page) => {
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
    const articles =  await db.query(queryString, queryValues)
        return articles.rows
}

exports.fetchArticleById = async (articleId) => {
   const queryString = `
   SELECT title, topic, articles.author, articles.article_id, articles.body, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS int) AS comment_count
   FROM articles
   LEFT JOIN comments ON comments.article_id = articles.article_id
   WHERE articles.article_id = $1
   GROUP BY articles.article_id
   `
   const article = await db.query(queryString, [articleId])
    if(!article.rows.length) {
       return Promise.reject({status: 404, msg: 'article not found'})
    }
    return article.rows[0]
   
}

exports.fetchCommentsByArticleId = async (article_id, limit, page) => {
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
        const comments = await db.query(queryString, [article_id])   
        return comments.rows  
}

exports.insertCommentByArticleId = async (articleId, {username, body}) => {
    const queryString = `
    INSERT INTO comments
    (article_id, author, body)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `
    const comment = await db.query(queryString, [articleId, username, body]) 
    return comment.rows[0]
}

exports.changeArticleById = async (articleId, voteChange) => {
    const queryString = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *
    `
    const article = await db.query(queryString, [voteChange, articleId])
    return article.rows[0]
}

exports.fetchUsers = async () => {
    const users = await db.query(`
    SELECT * FROM users;
    `)
        return users.rows
}

exports.removeCommentById = async (commentId) => {
    await checkCommentExists(commentId)
        await db.query(`
        DELETE FROM comments 
        WHERE comment_id = $1
        `, [commentId])
    
}

exports.fetchUserByUsername = async (username) => {
    const queryString = `
    SELECT * FROM users
    WHERE username = $1`
    const user = await db.query(queryString, [username])
        if(!user.rows.length) {
            return Promise.reject({status: 404, msg: 'no such user'})
        }
        return user.rows[0]
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

exports.insertTopic = async ({slug, description}) => {
    const queryString = `
    INSERT INTO topics
    (slug, description)
    VALUES
    ($1, $2)
    RETURNING *;
    `
    const createdTopic = await db.query(queryString, [slug, description])
    return createdTopic.rows[0]
}

exports.removeArticleById = async (articleId) => {
    const queryString = `
    DELETE FROM articles 
    WHERE article_id = $1
    `
    await db.query(queryString, [articleId])
}