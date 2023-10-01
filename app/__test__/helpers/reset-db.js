import { prisma } from "../../database.js";

export const resetDb = async () => {
  await prisma.$transaction([prisma.servicio.deleteMany()]);
};

// import { resetDb } from './reset-db';

// beforeEach(async () => {
//   await resetDb();
// });
