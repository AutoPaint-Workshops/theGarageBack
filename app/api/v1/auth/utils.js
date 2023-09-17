import { hash, compare } from 'bcrypt';

export const ifType = (tipo) => {
  if (tipo !== 'cliente' && tipo !== 'empresa' && tipo !== 'administrador')
    return true;
  return false;
};

export const isActive = (tipo) =>
  tipo === 'empresa' ? 'Verificando' : 'Activo';

export const urlFoto = (userData) =>
  userData.url_foto ? userData.url_foto : 'www.urlfotodeprueba.png';

export const encryptPassword = (password) => {
  return hash(password, 10);
};

export const verifyPassword = (password, encryptPassword) => {
  return compare(password, encryptPassword);
};
