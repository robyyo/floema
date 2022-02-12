require('dotenv').config();
const express = require('express');
const prismic = require('@prismicio/client');
const prismicH = require('@prismicio/helpers');
const fetch = require('node-fetch');
const path = require('path');
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

app.use((req, res, next) => {
  res.locals.ctx = {
    prismicH,
  };

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
  const document = await client.get({
    predicates: [prismic.predicate.any('document.type', ['meta', 'home'])],
  });

  const { results } = document;

  const [meta, home] = results;
  res.render('pages/home', { meta, home });
});

app.get('/about', async (req, res) => {
  const document = await client.get({
    predicates: [prismic.predicate.any('document.type', ['meta', 'about'])],
  });
  const { results } = document;
  const [meta, about] = results;
  console.log(meta, about);
  res.render('pages/about', { meta, about });
});

app.get('/detail/:uid', async (req, res) => {
  const meta = await client.getSingle('meta');
  const product = await client.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title',
  });
  console.log(product.data);
  res.render('pages/detail', { meta, product });
});

app.get('/collections', async (req, res) => {
  const meta = await client.getSingle('meta');
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image',
  });
  const home = await client.getSingle('home');
  console.log(collections[0]);
  console.log(meta);
  res.render('pages/collections', { meta, collections, home });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
