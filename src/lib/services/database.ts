import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User operations
export const dbUsers = {
  create: (data: { email: string; department: string; isAdmin?: boolean }) =>
    prisma.user.create({ data }),
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),
  findAll: () => prisma.user.findMany()
};

// Session operations
export const dbSessions = {
  create: (data: any) => prisma.quizSession.create({ data }),
  findAll: () => prisma.quizSession.findMany({
    include: {
      responses: {
        include: { user: true }
      }
    }
  }),
  findById: (id: string) => prisma.quizSession.findUnique({
    where: { id },
    include: {
      responses: {
        include: { user: true }
      }
    }
  }),
  update: (id: string, data: any) => prisma.quizSession.update({
    where: { id },
    data
  }),
  findActive: () => prisma.quizSession.findFirst({
    where: { isActive: true }
  })
};

// Response operations
export const dbResponses = {
  create: (data: any) => prisma.quizResponse.create({
    data,
    include: { user: true, session: true }
  }),
  findBySession: (sessionId: string) => prisma.quizResponse.findMany({
    where: { sessionId },
    include: { user: true }
  }),
  findByUser: (userId: string) => prisma.quizResponse.findMany({
    where: { userId },
    include: { session: true },
    orderBy: { completedAt: 'desc' }
  }),
  hasUserSubmitted: (sessionId: string, userId: string) =>
    prisma.quizResponse.findFirst({
      where: { sessionId, userId }
    })
};
