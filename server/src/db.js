const { PrismaClient } = require("@prisma/client");

// Singleton Prisma client reused across the app.
const prisma = new PrismaClient();

module.exports = prisma;
