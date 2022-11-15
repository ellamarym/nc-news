const express = require("express");
const articles = require("../db/data/test-data/articles");
const { fetchTopics, fetchArticles, fetchArticleById, fetchCommentsByArticleId } = require("../models/app.model");

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
    const articleId = parseInt(req.params.article_id)
    
    fetchArticleById(articleId).then((article) => {
       res.status(200).send({article})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getCommentsByArticleId = (req, res, next) => {
    const article_id = req.params.article_id
    if(!parseInt(article_id)){
        res.status(400).send({msg : 'not a valid article ID'})
    }
    fetchCommentsByArticleId(article_id).then((comments) => {
        res.status(200).send({comments})
    }).catch((err)=> {
        next(err)
    })
}