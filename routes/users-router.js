const { getUsers } = require('../controllers/app.controller');

const userRouter = require('express').Router();

userRouter.get('/', getUsers)

module.exports =userRouter