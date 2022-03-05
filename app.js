require('dotenv').config();
const logger = require('morgan');
const express = require('express');
const prismic = require('@prismicio/client');
const prismicH = require('@prismicio/helpers');
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');
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

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
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

const handleLinkResolver = (doc) => {
  // if (doc.type === 'page') return `/${doc.lang}/${doc.uid}`;
  if (doc.type === 'product') return `/detail/${doc.slug}`;
  if (doc.type === 'about') return `/about`;
  if (doc.type === 'collections') return `/collections`;
  return '/';
};

const handleRequest = async () => {
  const meta = await client.getSingle('meta');
  const navigation = await client.getSingle('navigation');
  const preloader = await client.getSingle('preloader');
  return {
    meta,
    navigation,
    preloader,
  };
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  const defaults = await handleRequest();
  const home = await client.getSingle('home');
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image',
  });
  console.log(defaults);
  res.render('pages/home', { ...defaults, home, collections });
});

app.get('/about', async (req, res) => {
  const defaults = await handleRequest();
  const about = await client.getSingle('about');
  res.render('pages/about', { ...defaults, about });
});

app.get('/detail/:uid', async (req, res) => {
  const defaults = await handleRequest();
  const product = await client.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title',
  });
  res.render('pages/detail', { ...defaults, product });
});

app.get('/collections', async (req, res) => {
  const defaults = await handleRequest();
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image',
  });
  const home = await client.getSingle('home');
  res.render('pages/collections', {
    ...defaults,
    collections,
    home,
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
