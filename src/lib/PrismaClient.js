import { PrismaClient } from "@prisma/client";

// Membuat instance Prisma Client
const prisma = new PrismaClient();

// Menangani penutupan koneksi saat aplikasi berhenti
const shutdown = async () => {
  await prisma.$disconnect();
};

// Menangani proses shutdown untuk aplikasi
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

export default prisma;
