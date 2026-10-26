function parsePagination(query) {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    if (!/^\d+$/.test(String(query.page))) {
      return { error: "page and limit must be positive integers" };
    }
    page = parseInt(query.page, 10);
    if (page <= 0) {
      return { error: "page and limit must be positive integers" };
    }
  }

  if (query.limit !== undefined) {
    if (!/^\d+$/.test(String(query.limit))) {
      return { error: "page and limit must be positive integers" };
    }
    limit = parseInt(query.limit, 10);
    if (limit <= 0) {
      return { error: "page and limit must be positive integers" };
    }
    if (limit > 50) {
      limit = 50;
    }
  }

  return { page, limit };
}

function buildMeta(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
}

module.exports = {
  parsePagination,
  buildMeta,
};
