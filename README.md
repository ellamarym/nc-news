# Northcoders News API

# Project summary
A server has been created allowing a user to view, post, delete or patch information from a database.
The database holds information in the following tables:
 - articles > a collection of articles, with details (author, title, topic, body, created_at, votes)
 - comments > a collection of comments relating to specified articles, with details (author, created_at, body, votes)
 - topics > a collection of topics, with details (slug, description)
 - users > a collection of users, with details (user, avatar_url, name)

# Link to hosted version
https://cloudy-girdle-bee.cyclic.app/api

# Getting started ...
 - clone the repo with 'git clone https://github.com/ellamarym/nc-news.git'
 - install dependencies
    - npm -d jest
    - npm install husky --save-dev
    - npm i -d jest-extended
    - npm i -d jest-sorted
    - npm i -d pg-format
    - npm i dotenv
    - npm i express
    - npm i pg
    - npm i postgres
    - npm i supertest
- ensure your package.json file has a key of jest which takes the form 
    - "jest": {"setupFilesAfterEnv": ["jest-extended/all", "jest-sorted"]}
- seed local database 
    - npm run seed
- run tests
    - npm test 

# to create enviroment variables
Create two files with the following names and database information;
.env.test
    - PGDATABASE=nc_news_test
.env.development
    - PGDATABASE=nc_news

# minumum requirements
    -node : >=10
    -postgres : >=3.3.1
