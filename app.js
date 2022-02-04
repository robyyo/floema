require('dotenv').config();

const express = require('express');
const prismic = require('@prismicio/client');
import * as prismicH from '@prismicio/helpers';
import { client } from './config/prismicConfig.js';
const path = require('path');
const app = express();
const port = 3000;

const handleLinkResolver = (doc) => {
  // if (doc.type === 'page') return `/${doc.lang}/${doc.uid}`;
  // if (doc.type === 'homepage') return `/${doc.lang}`;
  return '/';
};

app.use((req, res, next) => {
  res.locals.ctx = {
    prismicH,
  };
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/about', (req, res) => {
  res.render('pages/about');
});

app.get('/detail/:uid', (req, res) => {
  res.render('pages/detail');
});

app.get('/collections', (req, res) => {
  res.render('pages/collections');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
