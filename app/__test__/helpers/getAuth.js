import { signToken } from '../../api/v1/auth';

export const getAuth = (user) => {
  const id = user.userData.id;
  const userType = user.userData.tipo_usuario;
  const idType = user.userTypeData?.id || null;
  const token = signToken({ id, userType, idType });

  return token;
};
