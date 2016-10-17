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
      let establishments = superagentResponse.body.establishments || false;
      if (err) {
        res.status(500).end('errar' + 500);
      } else if (!establishments || establishments.length === 0) {
        res.status(204).end('no takeout found');
      } else {
        let response = { establishments: [] }
        establishments.forEach((establishment) => response.establishments.push(generateResponse(establishment)));
        res.status(200).send(response);
      }
    });
})

function generateResponse(establishment) {
  return {
    BusinessName: establishment.BusinessName,
    RatingValue: establishment.RatingValue,
    SchemeType: establishment.SchemeType,
    RatingDate: establishment.RatingDate,
    NewRatingPending: establishment.NewRatingPending,
    AddressLine1: establishment.AddressLine1,
    AddressLine2: establishment.AddressLine2,
    AddressLine3: establishment.AddressLine3,
    AddressLine4: establishment.AddressLine4,
  };
}

app.use('/', router);
app.listen(4000);

console.log('Listening on localhost:4000');

module.exports = app;
