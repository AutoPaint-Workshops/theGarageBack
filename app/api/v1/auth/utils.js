import fs from 'fs';
import { hash, compare } from 'bcrypt';

import { uploadFiles } from '../../../uploadsPhotos/uploads.js';

export const ifType = (tipo = 'error') => {
  if (tipo !== 'cliente' && tipo !== 'empresa' && tipo !== 'administrador')
    return true;
  return false;
};

export const isActive = (tipo = 'error') =>
  tipo === 'Empresa' ? 'Verificando' : 'Activo';

export const urlFoto = async (files) => {
  if (files.length === 0) {
    return 'https://placehold.co/400x400';
  }

  const promises = files.map((file) =>
    uploadFiles(file.path, 'profile_photos'),
  );
  const resultados = await Promise.all(promises);
  const fotosCloudinary = [];
  for (let i = 0; i < files.length; i++) {
    fotosCloudinary.push({ url_foto: resultados[i].url });
  }

  files.forEach((file) => fs.unlinkSync(file.path));

  return fotosCloudinary[0].url_foto;
};

export const urlDocument = async (files) => {
  if (files.length === 0) {
    return 'https://placehold.co/400x400';
  }

  const promises = files.map((file) =>
    uploadFiles(file.path, 'c_commerce_documents', 'pdf'),
  );
  const resultados = await Promise.all(promises);
  const documentsCloudinary = [];
  for (let i = 0; i < files.length; i++) {
    documentsCloudinary.push({ url_document: resultados[i].url });
  }

  files.forEach((file) => fs.unlinkSync(file.path));

  return documentsCloudinary[0].url_document;
};

export const encryptPassword = (password) => {
  return hash(password, 10);
};

export const verifyPassword = (password, encryptPassword) => {
  return compare(password, encryptPassword);
};
