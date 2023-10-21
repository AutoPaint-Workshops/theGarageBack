import { encryptPassword } from "../api/v1/auth/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setup = async () => {
  const contrasena = await encryptPassword("Contra123456");

  const user = {
    correo: "correo_empresa@example.com",
    contrasena: "contrasena_segura",
    tipo_usuario: "Empresa",
    estatus: "Activo",
    empresa: {
      razon_social: "Mi Empresa S.A.",
      tipo_documento_empresa: "NIT",
      numero_documento_empresa: "123456789",
      telefono: "123-456-7890",
      sitio_web: "https://www.miempresa.com",
      camara_comercio: "Ruta a la cámara de comercio",
      representante_legal: "Nombre del representante legal",
      tipo_documento_representante: "Cédula",
      numero_documento_representante: "987654321",
      correo_representante: "representante@example.com",
      descripcion: "Descripción de la empresa",
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

  await prisma.empresa.create({
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
};
