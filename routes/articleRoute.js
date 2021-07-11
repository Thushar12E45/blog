const express = require('express');

const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated } = require('../config/auth.js');
const { searchByAuthor, searchByKeyword, searchByAuthorAndKeyword, sortbyDate } = require('../util/queryFunctions.js');
// Prisma imports
const { route } = require('./users');

const prisma = new PrismaClient();

// Main blog route
try {
  router.get('/', async (req, res) => {
    const articles = await prisma.article.findMany({
      include: { userTable: true },
      orderBy: [{ date: 'desc' }],
    });
    // articles.title = articles.title.toUpperCase();
    res.render('article', { articles });
  });
} catch (e) {
  console.log(e.message);
  throw e;
}

// Read the articles
try {
  router.get('/article/show/:title', async (req, res) => {
    const article = await prisma.article.findFirst({
      where: { title: req.params.title },
      include: { userTable: true },
    });
    if (article === null) {
      res.redirect('/');
    }
    res.render('showArticle', { article });
  });
} catch (e) {
  console.log(e.message);
  throw e;
}

// Router for new article
let title;
let description;
let markdown;

let newArticle = {
  title,
  description,
  markdown,
};
router.get('/article/newArticle', (req, res) => {
  newArticle = {
    title: null,
    description: null,
    markdown: null,
  };
  res.render('author/newArticle', { newArticle });
});

// Router for user-specific article
let userName;
let userEmail;
router.get('/article/userArticles', ensureAuthenticated, async (req, res) => {
  userName = req.user.name;
  userEmail = req.user.email;
  const articles = await prisma.article.findMany({
    where: {
      userTable: {
        email: userEmail,
      },
    },
    include: { userTable: true },
    orderBy: [{ date: 'desc' }],
  });
  res.render('author/userArticles', {
    userName,
    articles,
  });
});

// Edit article
router.get('/article/editArticle/:title', ensureAuthenticated, async (req, res) => {
  newArticle = await prisma.article.findFirst({
    where: { title: req.params.title },
  });
  console.log(newArticle);
  if (newArticle === null) {
    res.redirect('/article/userArticles');
  }
  res.render('author/editArticle', { newArticle });
});

// Delete article
router.get('/article/deleteArticle/:title', ensureAuthenticated, async (req, res) => {
  await prisma.article.delete({
    where: {
      title: req.params.title,
    },
  });
  res.redirect('/article/userArticles');
});

// Sort by author
router.get('/article/sort/:name/:id', async (req, res) => {
  const userId = +req.params.id;
  userName = req.params.name;
  userName = `Author: ${userName}`;
  const articles = await prisma.article.findMany({
    where: {
      authorId: userId,
    },
    include: { userTable: true },
    orderBy: [{ date: 'desc' }],
  });
  res.render('sortArticles', {
    userName,
    articles,
  });
});

// sort by title
router.post('/article/sort/date', async (req, res) => {
  const { sortType } = req.body;
  if (sortType === 'desc') {
    res.redirect('/');
  } else {
    const articles = await prisma.article.findMany({
      include: { userTable: true },
      orderBy: [{ date: 'asc' }],
    });
    res.render('article', { articles });
  }
});

// Search
router.get('/search', async (req, res) => {
  // res.send(req.query);
  const { keyword, author, sortType } = req.query;
  console.log(author);
  let articles;
  if (keyword && author) {
    console.log('a&k');
    articles = await searchByAuthorAndKeyword(prisma, req.query);
  } else if (keyword) {
    console.log('k');
    articles = await searchByKeyword(prisma, keyword, sortType);
  } else if (author) {
    console.log('a');
    articles = await searchByAuthor(prisma, author, sortType);
  } else {
    console.log('date');
    articles = await sortbyDate(prisma, sortType);
  }
  // res.send(articles);
  res.render('article', { articles });
});

// Search by title
router.post('/article/search', async (req, res) => {
  const searchBody = req.body.search;
  console.log(searchBody);
  const userName = ` Title: ${searchBody}`;
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchBody,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchBody,
            mode: 'insensitive',
          },
        },
        {
          markdown: {
            contains: searchBody,
            mode: 'insensitive',
          },
        },
      ],
    },

    include: { userTable: true },
    orderBy: [{ date: 'desc' }],
  });
  res.render('sortArticles', { userName, articles });
});

// Showing user-specific article after creating
router.get('/article/showUserArticle/:title', async (req, res) => {
  const article = await prisma.article.findFirst({
    where: { title: req.params.title },
    include: { userTable: true },
    orderBy: [{ date: 'asc' }],
  });
  if (article === null) {
    res.redirect('/');
  }
  // console.log(article);
  res.render('author/showUserArticle', { article });
});

// Submit the article and save to database
router.post('/', async (req, res) => {
  title = req.body.title;
  title = title.toUpperCase();
  description = req.body.description;
  markdown = req.body.markdown;
  console.log(req.files.img.name);

  const email = 'thushar.bang@gmail.com';
  try {
    const authorId = await prisma.userTable.findUnique({
      where: { email },
    });

    newArticle = {
      authorId: authorId.id,
      title,
      description,
      markdown,
    };
    const file = req.files.img;
    console.log(file);
    const filename = authorId.id + title;
    file.mv(`./public/uploads/${filename}`, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('file uploaded Successfully');
      }
    });

    const newArticleData = await prisma.article.create({
      data: newArticle,
    });
    res.redirect(`/article/showUserArticle/${newArticleData.title}`);
  } catch (e) {
    const errors = [];
    console.log(e);
    errors.push({ msg: 'Title is already used. Please use a different title' });
    res.render(`author/newArticle`, { errors, newArticle });
    throw e;
  } finally {
    await prisma.$disconnect;
  }
});

// Update the article
router.post('/article/update/:id', async (req, res) => {
  title = req.body.title;
  description = req.body.description;
  markdown = req.body.markdown;
  const id = +req.params.id;
  let updatedArticle = {
    title,
    description,
    markdown,
  };
  // alert('Article Updated Successfully');

  updatedArticle = await prisma.article.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      markdown,
    },
  });
  res.redirect(`/article/showUserArticle/${updatedArticle.title}`);
});

module.exports = router;
