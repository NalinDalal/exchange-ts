// apps/be/index.ts
import { serve } from "bun";
import { prisma } from "../../packages/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const server = serve({
  async fetch(req) {
    const url = new URL(req.url);

    // Signup
    if (url.pathname === "/signup" && req.method === "POST") {
      const { email, password } = await req.json();

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return new Response(JSON.stringify({ error: "User already exists" }), {
          status: 400,
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: { email, passwordHash },
      });

      return new Response(JSON.stringify({ id: user.id, email: user.email }), {
        status: 201,
      });
    }

    // Signin
    if (url.pathname === "/signin" && req.method === "POST") {
      const { email, password } = await req.json();

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
        });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
        });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return new Response(
        JSON.stringify({ token, user: { id: user.id, email: user.email } }),
        { status: 200 },
      );
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

