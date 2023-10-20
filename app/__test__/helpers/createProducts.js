import { prisma } from '../../database.js';
import { getProduct } from '../fixtures/fakerData.fixture.js';

export const createCategories = async () => {
  await prisma.categoria.createMany({
    data: [
      {
        nombre_categoria: 'Mecanica',
      },
      {
        nombre_categoria: 'Transmision',
      },
      {
        nombre_categoria: 'Pinturas',
      },
      {
        nombre_categoria: 'Accesorios',
      },
      {
        nombre_categoria: 'Llantas',
      },
      {
        nombre_categoria: 'Lubricantes',
      },
      {
        nombre_categoria: 'Herramientas',
      },
      {
        nombre_categoria: 'Otros',
      },
    ],
  });

  return [
    'Mecanica',
    'Transmision',
    'Pinturas',
    'Accesorios',
    'Llantas',
    'Lubricantes',
    'Herramientas',
    'Otros',
  ];
};

export const createProducts = async (id_empresa, category = []) => {
  const product = getProduct(category);

  try {
    const { id: id_categoria } = await prisma.categoria.findFirst({
      where: {
        nombre_categoria: product.category,
      },
      select: {
        id: true,
      },
    });

    const response = await prisma.producto.create({
      data: {
        nombre: product.nombre,
        descripcion: product.descripcion,
        ficha_tecnica: product.ficha_tecnica,
        precio: product.precio,
        cantidad_disponible: product.cantidad_disponible,
        estatus: true,
        tipo_entrega: product.tipo_entrega,
        marca: product.marca,
        impuestos: product.impuestos,
        id_empresa,
        id_categoria,
      },
    });
    return response;
  } catch (error) {
    console.log('el error', error);
  }
};
