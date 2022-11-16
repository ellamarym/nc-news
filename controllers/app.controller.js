const express = require("express");
const articles = require("../db/data/test-data/articles");
const { fetchTopics, fetchArticles, fetchArticleById, insertCommentByArticleId, fetchCommentsByArticleId, changeArticleById, fetchUsers } = require("../models/app.model");

exports.getTopics = (req, res, next) => {
    fetchTopics().then((topics) => {
        res.status(200).send({topics})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    fetchArticles().then((articles) => {
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
    const promise1 = fetchArticleById(article_id)
    const promise2 = fetchCommentsByArticleId(article_id)
    
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
    })
}