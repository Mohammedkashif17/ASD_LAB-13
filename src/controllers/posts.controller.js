const postsService = require("../services/posts.service");
const prisma = require("../db");
const { parsePagination, buildMeta } = require("../utils/pagination");

async function create(req, res) {
  const { imageUrl, authorId, caption, location } = req.body;
  if (!imageUrl || authorId === undefined || authorId === null) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  const parsedAuthorId = parseInt(authorId, 10);
  if (isNaN(parsedAuthorId)) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  const user = await prisma.user.findUnique({ where: { id: parsedAuthorId } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const post = await postsService.createPost({
      imageUrl,
      authorId: parsedAuthorId,
      caption,
      location,
    });
    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }
  const { page, limit } = pagination;

  const sortBy = req.query.sortBy || "createdAt";
  const allowedSortBy = ["createdAt", "updatedAt", "likes"];
  if (!allowedSortBy.includes(sortBy)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
  }

  const order = req.query.order || "desc";
  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const where = {};

  if (req.query.location) {
    where.location = { equals: req.query.location, mode: "insensitive" };
  }

  if (req.query.search) {
    where.caption = { contains: req.query.search, mode: "insensitive" };
  }

  if (req.query.from || req.query.to) {
    const fromDate = req.query.from ? new Date(req.query.from) : null;
    const toDate = req.query.to ? new Date(req.query.to) : null;

    if (
      (req.query.from && (!fromDate || isNaN(fromDate.getTime()))) ||
      (req.query.to && (!toDate || isNaN(toDate.getTime())))
    ) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }

    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lt = toDate;
  }

  try {
    const { data, total } = await postsService.listPosts({ page, limit, sortBy, order, where });
    return res.status(200).json({
      data,
      meta: buildMeta(page, limit, total),
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { caption, location } = req.body;
  const data = {};
  if (caption !== undefined) data.caption = caption;
  if (location !== undefined) data.location = location;

  try {
    const updated = await postsService.updatePost(id, data);
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
