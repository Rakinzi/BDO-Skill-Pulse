import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User operations
export const dbUsers = {
  create: (data) =>
    prisma.user.create({ data }),
  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } }),
  findAll: () => prisma.user.findMany()
};

// Session operations
export const dbSessions = {
  create: (data) => prisma.quizSession.create({ data }),
  findAll: () => prisma.quizSession.findMany({
    include: {
      responses: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  }),
  findById: (id) => prisma.quizSession.findUnique({
    where: { id },
    include: {
      responses: {
        include: { user: true },
        orderBy: { score: 'desc' }
      }
    }
  }),
  update: (id, data) => prisma.quizSession.update({
    where: { id },
    data
  }),
  findActive: () => prisma.quizSession.findFirst({
    where: { isActive: true }
  })
};

// Response operations
export const dbResponses = {
  create: (data) => prisma.quizResponse.create({
    data,
    include: { user: true, session: true }
  }),
  findBySession: (sessionId) => prisma.quizResponse.findMany({
    where: { sessionId },
    include: { user: true }
  }),
  findByUser: (userId) => prisma.quizResponse.findMany({
    where: { userId },
    include: { session: true },
    orderBy: { completedAt: 'desc' }
  }),
  hasUserSubmitted: (sessionId, userId) =>
    prisma.quizResponse.findFirst({
      where: { sessionId, userId }
    })
};
