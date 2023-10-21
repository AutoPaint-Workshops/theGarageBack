import { prisma } from "../../database.js";
import { getProduct } from "../fixtures/fakerData.fixture.js";
import { getUsers } from "../helpers/createProfiles.js";

export const createCategories = async () => {
  await prisma.categoria.createMany({
    data: [
      {
        nombre_categoria: "Mecanica",
      },
      {
        nombre_categoria: "Transmision",
      },
      {
        nombre_categoria: "Pinturas",
      },
      {
        nombre_categoria: "Accesorios",
      },
      {
        nombre_categoria: "Llantas",
      },
      {
        nombre_categoria: "Lubricantes",
      },
      {
        nombre_categoria: "Herramientas",
      },
      {
        nombre_categoria: "Otros",
      },
    ],
  });

  return [
    "Mecanica",
    "Transmision",
    "Pinturas",
    "Accesorios",
    "Llantas",
    "Lubricantes",
    "Herramientas",
    "Otros",
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
    console.log("el error", error);
  }
};

export const createOrdersProducts = async (cliente) => {
  const empresa = await getUsers("empresa");
  const id_cliente = cliente.userTypeData.id;
  const id_empresa = empresa.userTypeData.id;
  const categorias = await createCategories();
  const producto1 = await createProducts(id_empresa, categorias);
  let result, resultEstado, resultDetalle;
  try {
    result = await prisma.Orden_Productos.create({
      data: {
        id_empresa,
        id_cliente,
        total: producto1.precio,
      },
    });

    resultEstado = await prisma.Estados_Orden_Productos.create({
      data: {
        id_orden_productos: result.id,
        estado: "Creado",
      },
    });
    resultEstado = await prisma.Estados_Orden_Productos.create({
      data: {
        id_orden_productos: result.id,
        estado: "Pagada",
      },
    });
    resultDetalle = await prisma.Detalle_Orden_Productos.create({
      data: {
        id_orden_productos: result.id,
        id_producto: producto1.id,
        cantidad: 1,
        precio_unitario: producto1.precio,
      },
    });
    return { result, resultEstado, resultDetalle };
  } catch (error) {
    return error;
  }
};

export const addStateToOrder = async (idOrder, state) => {
  const resultEstado = await prisma.Estados_Orden_Productos.create({
    data: {
      id_orden_productos: idOrder,
      estado: state,
    },
  });
  return resultEstado;
};
