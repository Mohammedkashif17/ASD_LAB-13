const prisma = require("../db");

async function addLike(postId, userId) {
  return await prisma.like.create({
    data: {
      postId,
      userId,
    },
  });
}

async function removeLike(postId, userId) {
  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
}

module.exports = {
  addLike,
  removeLike,
};
