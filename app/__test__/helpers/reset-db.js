import { prisma } from "../../database.js";

export const resetDb = async () => {
  await prisma.$transaction([
    prisma.producto.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.empresa.deleteMany(),
    prisma.usuario.deleteMany(),
    prisma.categoria.deleteMany(),
  ]);
};
