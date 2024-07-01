import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const prismaDisconnect = async (req: Request, res: Response, next: NextFunction) => {
  (res as any).on('finish', async () => {
    await prisma.$disconnect();
  });
  next();
};
