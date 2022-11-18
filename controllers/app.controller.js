const express = require("express");
const articles = require("../db/data/test-data/articles");
const { fetchTopics, fetchArticles, fetchArticleById, insertCommentByArticleId, fetchCommentsByArticleId, changeArticleById, fetchUsers, removeCommentById, fetchUserByUsername, changeCommentById, insertArticle } = require("../models/app.model");
const {readFile} = require('fs/promises')
exports.getTopics = (req, res, next) => {
    const topic = req.query.topic
    fetchTopics(topic).then((topics) => {
        res.status(200).send({topics})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    const limit = req.query.limit
    const topic = req.query.topic
    const sortBy = req.query.sortby
    const order = req.query.order
    const page = req.query.p

    const promise1 = fetchTopics(topic)
    const promise2 = fetchArticles(topic, sortBy, order, limit, page)

    Promise.all([promise1, promise2]).then((results) => {
        const articles = results[1]
        res.status(200).send({articles})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getArticleById = (req, res, next) => {
    const articleId = req.params.article_id
        fetchArticleById(articleId).then((article) => {
           res.status(200).send({article})
        })
        .catch((err) => {
            next(err)
        })
    }

exports.getCommentsByArticleId = (req, res, next) => {
    const article_id = req.params.article_id
    const limit = req.query.limit
    const page = req.query.p
    const promise1 = fetchArticleById(article_id)
    const promise2 = fetchCommentsByArticleId(article_id, limit, page)
    
    Promise.all([promise1 , promise2])
    .then((results) => {
        let comments = results[1]
        res.status(200).send({comments})
    }).catch((err)=> {
        next(err)
    })
}


exports.postCommentByArticleId = (req, res, next) => {
    const articleId = req.params.article_id
    const newComment = req.body
    const promise1 = fetchArticleById(articleId)
    const promise2 = insertCommentByArticleId(articleId, newComment)

    Promise.all([promise1,promise2]).then((results) => {
        const comment = results[1]
        res.status(201).send({comment})
    }).catch((err) => {
        next(err)
    })
}

exports.patchArticleById = (req,res,next) => {
    const articleId = req.params.article_id
    const voteChange = req.body.inc_votes

    const promise1 = fetchArticleById(articleId)
    const promise2 = changeArticleById(articleId, voteChange)

    Promise.all([promise1, promise2]).then((results)=> {
        const article = results[1]
        res.status(200).send({article})
    }).catch((err) => {
        next(err)
    })
} 

exports.getUsers = (req, res, next) => {
    fetchUsers().then((users) => {
        res.status(200).send({users})
    }).catch((err)=> {
        next(err)
    })
}

//ticket 11
 exports.deleteCommentById = (req,res,next) => {
    const commentId = req.params.comment_id
    removeCommentById(commentId).then(()=> {
        res.status(204).send()
    }).catch((err) => {
        next(err)
    })
 }

 exports.getEndpoints = (req, res, next) => {
    readFile('endpoints.json').then((foundEndpoints)=> {
        const endpoints = JSON.parse(foundEndpoints)   
        res.status(200).send({endpoints})
    }).catch((err) => {
        next(err)
    })
 }

 exports.getUserByUsername = (req, res, next) => {
    const username = req.params.username
    fetchUserByUsername(username).then((user) => {
        res.status(200).send({user})
    }).catch((err) => {
        next(err)
    })
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