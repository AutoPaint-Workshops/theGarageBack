import { encryptPassword } from '../../api/v1/auth/utils.js';
import { prisma } from '../../database.js';
import {
  getClient,
  getAdmin,
  getCompany,
} from '../fixtures/fakerData.fixture.js';

export const getUsers = async (role, overrides = {}) => {
  const user =
    role === 'cliente' ? getClient(overrides) : getCompany(overrides);
  const userResult = {
    userData: {},
    userTypeData: {},
    password: user.userData.contrasena,
  };
  try {
    await prisma.$transaction(async (transaction) => {
      const password = await encryptPassword(user.userData.contrasena);
      const response = await transaction.usuario.create({
        data: {
          ...user.userData,
          url_foto: 'https://placehold.it/300x300',
          estatus: 'Activo',
          contrasena: password,
        },
      });
      userResult.userData = response;
      const { userTypeData } = user;

      if (role === 'cliente') {
        userResult.userTypeData = await transaction.cliente.create({
          data: {
            id_usuario: response.id,
            ...userTypeData,
          },
        });
      } else if (role === 'empresa') {
        userResult.userTypeData = await transaction.empresa.create({
          data: {
            id_usuario: response.id,
            ...userTypeData,
          },
        });
      }
    });
  } catch (error) {
    console.log(error);
  }

  return {
    ...userResult,
    overrides,
  };
};

export const getAdminUser = async (overrides = {}) => {
  const admin = getAdmin(overrides);
  const adminResult = {
    userData: {},
    password: admin.userData.contrasena,
  };
  try {
    const password = await encryptPassword(admin.userData.contrasena);
    const response = await prisma.usuario.create({
      data: {
        ...admin.userData,
        url_foto: 'https://placehold.it/300x300',
        estatus: 'Activo',
        contrasena: password,
      },
    });
    adminResult.userData = response;
  } catch (error) {
    console.log(error);
  }
  return {
    ...adminResult,
    overrides,
  };
};
