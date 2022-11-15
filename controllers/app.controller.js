const express = require("express");
const articles = require("../db/data/test-data/articles");
const { fetchTopics, fetchArticles, fetchArticleById } = require("../models/app.model");

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