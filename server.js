'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Home Page!');
});

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

function locationHandler(request, response) {
  const city = request.query.city;
  superagent(
    `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
  )
    .then((res) => {
      const geoData = res.body;
      const locationData = new Location(city, geoData);
      response.status(200).json(locationData);
    })
    .catch((err) => errorHandler(err, request, response));
}


function weatherHandler(request, response) {
  superagent(
    `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
  )
    .then((weatherRes) => {
      console.log(weatherRes);
      const weatherSummaries = weatherRes.body.data.map((day) => {
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch((err) => errorHandler(err, request, response));
}

function trailHandler(request, response) {
  const city1 = request.query.city1;
  superagent(
    `https://www.hikingproject.com/data/get-trails?key=${process.env.GEOCODE_API_KEY}&key=${process.env.TRAIL_API_KEY}&q=${city1}&format=json`
  )
    .then((trailRes) => {
      const trailData = trailRes.body;
      const locationData = new Trails(city1, trailData);
      response.status(200).json(locationData);
    })
    .catch((err) => errorHandler(err, request, response));
}


function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}

function Trails(city1, trailData) {
  this.search_query = city1;
  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.url;
  this.conditions = trailData.conditionStatus;
  this.condition_date = trailData.conditionDate;
  this.condition_time = trailData.conditionDate;
}

function notFoundHandler(request, response) {
  response.status(404).send('huh?');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
