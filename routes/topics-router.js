const { getTopics } = require('../controllers/app.controller');


const topicsRouter = require('express').Router();

topicsRouter.get('/', getTopics)

module.exports =topicsRouter