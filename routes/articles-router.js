const { getArticles, getArticleById, getCommentsByArticleId, postCommentByArticleId, patchArticleById } = require('../controllers/app.controller');

const articlesRouter = require('express').Router();

articlesRouter.get('/', getArticles )
articlesRouter.get('/:article_id', getArticleById)
articlesRouter.patch('/:article_id', patchArticleById)
articlesRouter.get('/:article_id/comments', getCommentsByArticleId)
articlesRouter.post('/:article_id/comments', postCommentByArticleId)
module.exports =articlesRouter