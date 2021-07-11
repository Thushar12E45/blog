// const { prisma } = require('@prisma/client');

async function searchByAuthor(prisma, author, sortType) {
  const articles = await prisma.article.findMany({
    where: {
      userTable: {
        name: {
          contains: author,
          mode: 'insensitive',
        },
      },
    },
    include: { userTable: true },
    orderBy: [{ date: sortType }],
  });
  return articles;
}
async function searchByKeyword(prisma, keyword, sortType) {
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        {
          title: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          markdown: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      ],
    },

    include: { userTable: true },
    orderBy: [{ date: sortType }],
  });
  return articles;
}
async function searchByAuthorAndKeyword(prisma, data) {
  const { keyword, author, sortType } = data;
  const articles = await prisma.article.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              title: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              markdown: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          ],
        },
        {
          userTable: {
            name: {
              contains: author,
              mode: 'insensitive',
            },
          },
        },
      ],
    },
    include: { userTable: true },
    orderBy: [{ date: sortType }],
  });

  return articles;
}

async function sortbyDate(prisma, sortType) {
  const articles = await prisma.article.findMany({
    include: { userTable: true },
    orderBy: [{ date: sortType }],
  });
  return articles;
}

module.exports = { searchByAuthor, searchByKeyword, searchByAuthorAndKeyword, sortbyDate };
