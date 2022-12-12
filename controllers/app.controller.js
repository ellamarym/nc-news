
const { fetchTopics, fetchArticles, fetchArticleById, insertCommentByArticleId, fetchCommentsByArticleId, changeArticleById, fetchUsers, removeCommentById, fetchUserByUsername, changeCommentById, insertArticle, insertTopic, removeArticleById } = require("../models/app.model");
const {readFile} = require('fs/promises')

exports.getTopics = async (req, res, next) => {
    try {
        const topic = req.query.topic
        const topics = await fetchTopics(topic)
        res.status(200).send({topics})    
    } catch (error) {
        next(error)
    }
}

exports.getArticles = async (req, res, next) => {
    try {
        const limit = req.query.limit
        const topic = req.query.topic
        const sortBy = req.query.sortby
        const order = req.query.order
        const page = req.query.p
    
        await fetchTopics(topic)
        const articles = await fetchArticles(topic, sortBy, order, limit, page)   
        res.status(200).send({articles})
    } catch (error) {
        next(error)
    }
}

exports.getArticleById = async (req, res, next) => {
    try {
    const articleId = req.params.article_id
    const article = await fetchArticleById(articleId)
    res.status(200).send({article})       
    } catch (error) {
        next(error)
    }  
 }

exports.getCommentsByArticleId = async (req, res, next) => {
    try {
        const article_id = req.params.article_id
        const limit = req.query.limit
        const page = req.query.p
        await fetchArticleById(article_id)
        const comments = await fetchCommentsByArticleId(article_id, limit, page)
        res.status(200).send({comments})     
    } catch (error) {
        next(error)
    }
}

exports.postCommentByArticleId = async(req, res, next) => {
    try {
        const articleId = req.params.article_id
        const newComment = req.body
        await fetchArticleById(articleId)
        const comment = await insertCommentByArticleId(articleId, newComment)
        res.status(201).send({comment})   
    } catch (error) {
        next(error)
    }
}

exports.patchArticleById = async (req,res,next) => {
    try {
        const articleId = req.params.article_id
        const voteChange = req.body.inc_votes
        await fetchArticleById(articleId)
        const article = await changeArticleById(articleId, voteChange)
        res.status(200).send({article})
        
    } catch (error) {
        next(error)
    }
} 

exports.getUsers = async (req, res, next) => {
    try {
        const users = await fetchUsers()
            res.status(200).send({users})
    } catch (error) {
        next(error)
    }
}

 exports.deleteCommentById = async (req,res,next) => {
    try {
        const commentId = req.params.comment_id
       await removeCommentById(commentId)
            res.status(204).send()   
    } catch (error) {
        next(error)
    }
 }

 exports.getEndpoints = async (req, res, next) => {
    try {
      const foundEndpoints = await readFile('endpoints.json')
            const endpoints = JSON.parse(foundEndpoints)   
            res.status(200).send({endpoints})
        
    } catch (error) {
        next(error)
    }
 }

 exports.getUserByUsername = async (req, res, next) => {
    try {
        const username = req.params.username
        const user = await fetchUserByUsername(username)
            res.status(200).send({user}) 
    } catch (error) {
        next(error)
    }
 }

 exports.patchCommentById = async (req, res, next) => {
    try {
        const {comment_id} = req.params
        const {inc_votes} = req.body
        const comment = await changeCommentById(comment_id, inc_votes)
        res.status(200).send({comment})
    } catch(err) {
        next(err)
    }
 }

 exports.postArticle = async(req, res, next) => {
    try {
        const newArticle = req.body
        const username = req.body.author
        const topic = req.body.topic
        await fetchTopics(topic)
        await fetchUserByUsername(username)
        const createdArticleId = await insertArticle(newArticle)
        const article = await fetchArticleById(createdArticleId)
        res.status(201).send({article})
    } catch (err) {
        next(err)
    }
 }

 exports.postTopic = async(req,res,next) => {
    try {
        const newTopic = req.body
        const topic = await insertTopic(newTopic)
        res.status(201).send({topic})
    } catch (err) {
        next(err)
    }
 }

 exports.deleteArticleById = async (req,res,next) => {
    try {
        const articleId = req.params.article_id
        await fetchArticleById(articleId)
        await removeArticleById(articleId)
        res.status(204).send()
    } catch (err) {
        next(err)
    }
 }