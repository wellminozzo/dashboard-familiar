import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../config/prisma"
import { config } from "../config"
import { AppError } from "../middlewares/error.middleware"
import type { RegisterInput, LoginInput } from "../validators/auth.schema"
import type { UpdateProfileInput, ChangePasswordInput } from "../validators/profile.schema"

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      throw new AppError("Email já cadastrado", 409)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    })

    const token = this.generateToken(user.id)
    return { token, user: { id: user.id, name: user.name, email: user.email } }
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) {
      throw new AppError("Email ou senha inválidos", 401)
    }

    const valid = await bcrypt.compare(data.password, user.password)
    if (!valid) {
      throw new AppError("Email ou senha inválidos", 401)
    }

    const token = this.generateToken(user.id)
    return { token, user: { id: user.id, name: user.name, email: user.email } }
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    })
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }
    return user
  }

  async updateProfile(userId: number, data: UpdateProfileInput) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } },
      })
      if (existing) {
        throw new AppError("Email já está em uso", 409)
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      },
      select: { id: true, name: true, email: true, avatar: true },
    })

    return user
  }

  async changePassword(userId: number, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const valid = await bcrypt.compare(data.currentPassword, user.password)
    if (!valid) {
      throw new AppError("Senha atual incorreta", 401)
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  }

  private generateToken(userId: number): string {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions)
  }
}
