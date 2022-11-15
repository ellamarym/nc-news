const express = require("express");
const { getTopics, getArticles, getArticleById, postCommentByArticleId } = require("./controllers/app.controller");
const app = express();
app.use(express.json())


app.get('/api/topics', getTopics )
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)
//ticket 6 goes here
app.post('/api/articles/:article_id/comments', postCommentByArticleId)

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