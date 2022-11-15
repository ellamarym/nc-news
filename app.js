const express = require("express");
const { getTopics, getArticles } = require("./controllers/app.controller");
const app = express();


app.get('/api/topics', getTopics )
app.get('/api/articles', getArticles)


app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
});

app.all("/*", (req, res) => {
    res.status(404).send({ msg: "link not found" });
  });

app.use((err, req, res, next) => {
    res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app