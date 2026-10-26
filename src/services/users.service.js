const prisma = require("../db");

async function createUser(data) {
  return await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullname: data.fullname,
      bio: data.bio !== undefined ? data.bio : null,
    },
  });
}

async function listUsers({ page = 1, limit = 10, sortBy = "createdAt", order = "desc", where = {} } = {}) {
  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
}

async function getUserPosts(id, { page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  const where = { authorId: id };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

async function getLikedPosts(id, { page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  const where = { likes: { some: { userId: id } } };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
}

async function updateUser(id, data) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id },
  });
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  getUserPosts,
  getLikedPosts,
  updateUser,
  deleteUser,
};
