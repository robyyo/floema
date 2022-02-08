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
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  const document = await client.get({
    predicates: [prismic.predicate.any('document.type', ['meta', 'home'])],
  });
  const { results } = document;
  console.log(results);
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

app.get('/collections', (req, res) => {
  res.render('pages/collection');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
