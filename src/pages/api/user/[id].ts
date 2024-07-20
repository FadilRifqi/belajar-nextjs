import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/PrismaClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const userId = parseInt(id as string);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  switch (req.method) {
    case "GET":
      // Mendapatkan pengguna berdasarkan ID
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Error fetching user" });
      }
      break;

    case "PUT":
      // Memperbarui pengguna berdasarkan ID (Pembaruan penuh)
      try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
          return res
            .status(400)
            .json({ error: "Name, email, and password are required" });
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { name, email, password },
        });

        res.status(200).json(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Error updating user" });
      }
      break;

    case "PATCH":
      // Memperbarui pengguna berdasarkan ID (Pembaruan parsial)
      try {
        const { name, email, password } = req.body;

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(password && { password }),
          },
        });

        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Error updating user" });
      }
      break;

    case "DELETE":
      // Menghapus pengguna berdasarkan ID
      try {
        const deletedUser = await prisma.user.delete({
          where: { id: userId },
        });

        res.status(200).json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Error deleting user" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
