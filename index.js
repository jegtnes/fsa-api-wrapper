"use strict";

const express = require('express');
const app = express();
const router = express.Router();

const request = require('superagent');

router.route('/').get(function(req, res) {
  res.json({message: "hello world"});
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.route('/establishments').get(function(req, res) {
  const baseURL = 'http://api.ratings.food.gov.uk/Establishments?'
  let params = '';

  if (!req.query.address) {
    res.sendStatus(400).end();
  }

  params += 'address=' + req.query.address;

  if (req.query.name) {
    params += '&name=' + req.query.name;
  }

  request
    .get(baseURL + params)
    .set({ 'x-api-version': 2 })
    .end(function(err, superagentResponse) {
      if (err) {
        superagentResponse.sendStatus(500).end();
      } else if (!superagentResponse.body.establishments) {
        superagentResponse.sendStatus(204).end();
      } else if (superagentResponse.body.establishments.length > 1) {
        superagentResponse.sendStatus(400).end();
      } else {
        res.status(200).end(superagentResponse.body.establishments[0].RatingValue);
      }
    });
})

app.use('/', router);
app.listen(4000);

console.log('Listening on localhost:4000');

module.exports = app;
