import { encryptPassword } from '../../api/v1/auth/utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const setupV = async () => {
  const contrasena = await encryptPassword('Contra123456');

  const user = {
    correo: 'correo_empresa@example.com',
    contrasena: 'contrasena_segura',
    tipo_usuario: 'Empresa',
    estatus: 'Activo',
    empresa: {
      razon_social: 'Mi Empresa S.A.',
      tipo_documento_empresa: 'NIT',
      numero_documento_empresa: '123456789',
      telefono: '123-456-7890',
      sitio_web: 'https://www.miempresa.com',
      camara_comercio: 'Ruta a la cámara de comercio',
      representante_legal: 'Nombre del representante legal',
      tipo_documento_representante: 'Cédula',
      numero_documento_representante: '987654321',
      correo_representante: 'representante@example.com',
      descripcion: 'Descripción de la empresa',
    },
  };

  const data = await prisma.usuario.create({
    data: {
      correo: user.correo,
      contrasena: contrasena,
      tipo_usuario: user.tipo_usuario,
      estatus: user.estatus,
    },
  });

  const { id: companyId } = data;

  const empresa = await prisma.empresa.create({
    data: {
      id_usuario: companyId,
      razon_social: user.empresa.razon_social,
      tipo_documento_empresa: user.empresa.tipo_documento_empresa,
      numero_documento_empresa: user.empresa.numero_documento_empresa,
      telefono: user.empresa.telefono,
      sitio_web: user.empresa.sitio_web,
      camara_comercio: user.empresa.camara_comercio,
      representante_legal: user.empresa.representante_legal,
      tipo_documento_representante: user.empresa.tipo_documento_representante,
      numero_documento_representante:
        user.empresa.numero_documento_representante,
      correo_representante: user.empresa.correo_representante,
      descripcion: user.empresa.descripcion,
    },
  });

  const userClient = {
    correo: 'correo_ser@example.com',
    contrasena: 'Contra123456',
    tipo_usuario: 'Cliente',
    estatus: 'Activo',
    cliente: {
      nombre_completo: 'Nombre Completo',
      tipo_documento: 'Cédula',
      numero_documento: '123456789',
      telefono: '123-456-7890',
    },
  };
  const dataClient = await prisma.usuario.create({
    data: {
      correo: userClient.correo,
      contrasena: contrasena,
      tipo_usuario: userClient.tipo_usuario,
      estatus: userClient.estatus,
    },
  });

  const { id: clientId } = dataClient;
  const cliente = await prisma.cliente.create({
    data: {
      id_usuario: clientId,
      nombre_completo: userClient.cliente.nombre_completo,
      tipo_documento: userClient.cliente.tipo_documento,
      numero_documento: userClient.cliente.numero_documento,
      telefono: userClient.cliente.telefono,
      direccion: userClient.cliente.direccion,
    },
  });

  //Creo la categoria
  const category = await prisma.categoria.create({
    data: {
      nombre_categoria: 'Pinturas',
    },
  });

  const producto = await prisma.producto.create({
    data: {
      id_empresa: empresa.id,
      id_categoria: category.id,
      nombre: 'Nombre del Producto',
      descripcion: 'Descripción del Producto',
      ficha_tecnica: 'Ficha Técnica del Producto',
      precio: 100,
      cantidad_disponible: 1,
      estatus: true,
      tipo_entrega: 'Entrega Rápida',
      marca: 'Marca del Producto',
      impuestos: 0.16,
    },
  });

  // Crear una orden de productos
  const ordenProductos = await prisma.orden_Productos.create({
    data: {
      no_orden: 1, // Número de orden
      id_cliente: cliente.id,
      id_empresa: empresa.id,
      total: 200, // Total en tu moneda
    },
  });

  // Crear un detalle de orden de productos
  const detalleOrdenProductos = await prisma.detalle_Orden_Productos.create({
    data: {
      id_orden_productos: ordenProductos.id,
      id_producto: producto.id,
      cantidad: 2, // Cantidad de productos en la orden
      precio_unitario: producto.precio, // Precio unitario del producto
    },
  });
};
