const express = require("express");
const { getTopics, getArticles, getArticleById, getCommentsByArticleId } = require("./controllers/app.controller");
const app = express();


app.get('/api/topics', getTopics )
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)
app.get('/api/articles/:article_id/comments', getCommentsByArticleId)
app.all("/*", (req, res) => {
    res.status(404).send({ msg: "link not found" });
  });

app.use((err, req, res, next)=> {
    if(err.code == '22P02'){
        res.status(400).send({msg: 'bad request'})
    } else {
        next(err);
    }
})

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

app.all("/*", (req, res) => {
    res.status(404).send({ msg: "link not found" });
  });

app.use((err, req, res, next)=> {
    if(err.code == '22P02'){
        res.status(400).send({msg: 'bad request'})
    } else {
        next(err);
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