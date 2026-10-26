const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createMany({
    data: users.map((u) => ({
      username: u.username,
      email: u.email,
      fullname: u.fullname,
      bio: u.bio,
      isPrivate: u.isPrivate,
      createdAt: new Date(u.createdAt),
    })),
  });

  const createdPosts = await prisma.post.createMany({
    data: posts.map((p) => ({
      imageUrl: p.imageUrl,
      caption: p.caption,
      location: p.location,
      createdAt: new Date(p.createdAt),
    })),
  });

  console.log(`🌱 Seeded ${createdUsers.count} users and ${createdPosts.count} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
