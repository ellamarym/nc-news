const e = require("express");
const express = require("express");
const { getTopics, getArticles, getArticleById,  getCommentsByArticleId, patchArticleById, postCommentByArticleId, getUsers, deleteCommentById, getEndpoints  } = require("./controllers/app.controller");
const apiRouter = require("./routes/api-router");
const app = express();

app.use(express.json())

app.use('/api', apiRouter)




app.all("/*", (req, res) => {
    res.status(404).send({ msg: "link not found" });
  });

app.use((err, req, res, next)=> {
    if(err.code === '22P02'){
        res.status(400).send({msg: 'bad request'})
    } else {
        next(err);
    }
})

app.use((err,req,res,next) => {
    if(err.code === '42703') {
        res.status(400).send({msg: 'invalid limit query'})
    } else {
        next(err)
    }
})

app.use((err,req,res,next)=> {
    if(err.code === '23503') {
        res.status(401).send({msg: 'invalid username'})
    } else {
        next(err)
    }
})

app.use((err,req,res,next) => {
    if(err.code === '23502') {
        res.status(422).send({msg: 'invalid user input'})
    } else {
        next(err)
    }
})


app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.log(err, 'unhandled error')
    res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app