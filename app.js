const express = require("express");
const { getTopics } = require("./controllers/app.controller");
const app = express();
app.use(express.json());

app.get('/api/topics', getTopics )


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