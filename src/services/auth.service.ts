import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { RegisterInput, LoginInput, AuthResponse } from "../types";
import { JWT_CONFIG, ERROR_MESSAGES } from "../constants";
import { ConflictError, NotFoundError, UnauthorizedError, BadRequestError } from "../utils/errors";

const SALT_ROUNDS = 10;

export async function register(data: RegisterInput): Promise<AuthResponse> {
  if (!data.email || !data.name || !data.password) {
    throw new BadRequestError("email, name, and password are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      settings: { create: {} },
    },
    include: { settings: true },
  });

  const token = generateToken(user.id, user.email);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  if (!data.email || !data.password) {
    throw new BadRequestError("email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const token = generateToken(user.id, user.email);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
  });
}
