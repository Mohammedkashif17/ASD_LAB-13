const prisma = require("../db");

async function createPost(data) {
  return await prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      caption: data.caption !== undefined ? data.caption : null,
      location: data.location !== undefined ? data.location : null,
    },
  });
}

async function listPosts({ page = 1, limit = 10, sortBy = "createdAt", order = "desc", where = {} } = {}) {
  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

async function getPostById(id) {
  return await prisma.post.findUnique({
    where: { id },
  });
}

async function updatePost(id, data) {
  return await prisma.post.update({
    where: { id },
    data,
  });
}

async function deletePost(id) {
  return await prisma.post.delete({
    where: { id },
  });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
