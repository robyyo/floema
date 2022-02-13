require('dotenv').config();
const express = require('express');
const prismic = require('@prismicio/client');
const prismicH = require('@prismicio/helpers');
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const app = express();
const port = 3000;
const repoName = process.env.PRIMISC_REPO; // Fill in your repository name.
const accessToken = process.env.PRISMIC_ACCESS_TOKEN;
const endpoint = prismic.getEndpoint(repoName);
const routes = [
  {
    type: 'about',
    path: '/:uid',
  },
];

const client = prismic.createClient(endpoint, {
  fetch: fetch,
  accessToken,
  routes,
});

const handleLinkResolver = (doc) => {
  // if (doc.type === 'page') return `/${doc.lang}/${doc.uid}`;
  // if (doc.type === 'homepage') return `/${doc.lang}`;
  return '/';
};

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());

app.use((req, res, next) => {
  res.locals.ctx = {
    prismicH,
  };

  res.locals.link = handleLinkResolver;

  res.locals.Numbers = (index) => {
    return index === 0
      ? 'One'
      : index === 1
      ? 'Two'
      : index === 2
      ? 'Three'
      : index === 3
      ? 'Four'
      : '';
  };

  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  const home = await client.getSingle('home');
  const meta = await client.getSingle('meta');
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image',
  });
  const preloader = await client.getSingle('preloader');
  res.render('pages/home', { meta, home, collections, preloader });
});

app.get('/about', async (req, res) => {
  const about = await client.getSingle('about');
  const meta = await client.getSingle('meta');
  const preloader = await client.getSingle('preloader');
  res.render('pages/about', { meta, about, preloader });
});

app.get('/detail/:uid', async (req, res) => {
  const meta = await client.getSingle('meta');
  const product = await client.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title',
  });
  const preloader = await client.getSingle('preloader');
  res.render('pages/detail', { meta, product, preloader });
});

app.get('/collections', async (req, res) => {
  const meta = await client.getSingle('meta');
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image',
  });
  const home = await client.getSingle('home');
  const preloader = await client.getSingle('preloader');
  res.render('pages/collections', { meta, collections, home, preloader });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
