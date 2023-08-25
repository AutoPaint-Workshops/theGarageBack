import { hash, compare } from 'bcrypt';

export const fields = [
  'id',
  'correo',
  'contrasena',
  'tipo_usuario',
  'fecha_creacion',
  'estatus',
  'url_foto',
  'pais',
  'ciudad',
  'direccion',
];

export const encryptPassword = (password) => {
  return hash(password, 10);
};

export const verifyPassword = (password, encryptPassword) => {
  return compare(password, encryptPassword);
};
