const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  const Database = require('better-sqlite3');
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const db = new Database('./dev.db');
  const adapter = new PrismaBetterSqlite3(db);
  prisma = new PrismaClient({ adapter });
} catch (e) {
  prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db'
  });
}

module.exports = prisma;
