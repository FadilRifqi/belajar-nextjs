import { createHash, randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/PrismaClient";
import { env } from "process";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      // Mengambil daftar semua pengguna
      try {
        console.log(env.SALT);
        const users = await prisma.user.findMany();
        res.status(200).json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
      }
      break;

    case "POST":
      // Membuat pengguna baru
      try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
          res
            .status(400)
            .json({ error: "Name, email, and password are required" });
          return;
        }
        const hashedPassword = createHash("sha256");
        hashedPassword.update(password + env.SALT);

        const newUser = await prisma.user.create({
          data: { name, email, password: hashedPassword.digest("hex") },
        });
        res.status(201).json(newUser);
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Error creating user" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
