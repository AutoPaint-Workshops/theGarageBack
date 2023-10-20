import { prisma } from '../../database.js';

export const resetDb = async () => {
  await prisma.$transaction([
    prisma.valoracion.deleteMany(),
    prisma.pagos.deleteMany(),
    prisma.orden_Productos.deleteMany(),
    prisma.producto.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.empresa.deleteMany(),
    prisma.usuario.deleteMany(),
    prisma.categoria.deleteMany(),
  ]);
};
