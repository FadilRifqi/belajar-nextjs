import type { NextApiRequest, NextApiResponse } from "next";
import { lucia } from "@/lib/auth";
import prisma from "@/lib/PrismaClient";
import { registerSchema, RegisterValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";

export default async function register(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { email, password, name } = registerSchema.parse(
      req.body as RegisterValues
    );

    const hashedPassword = await hash(password, {
      memoryCost: 19456,
      timeCost: 12,
      outputLen: 32,
      parallelism: 1,
    });

    const UserId = generateIdFromEntropySize(10);

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        id: UserId,
        email,
        password: hashedPassword,
        name,
      },
    });

    const session = await lucia.createSession(UserId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.setHeader(
      "Set-Cookie",
      `${sessionCookie.name}=${sessionCookie.value}; Path=/; HttpOnly; Secure; SameSite=Strict`
    );
    return res.status(201).json({ user });
    // return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return res.status(500).json({ error: error });
  }
}
