import jwt from "jsonwebtoken";
import { configuration } from "../../config.js";

const { token } = configuration;
const { secret, expires } = token;

export const signToken = (payload, expiresIn = expires) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const auth = (req, res, next) => {
  let token = req.headers.authorization || "";
  if (token.startsWith("Bearer")) {
    token = token.substring(7);
  }
  if (!token) {
    return next({
      message: "Prohibido",
      status: 403,
    });
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      return next({
        message: "Prohibido",
        status: 403,
      });
    }
    req.decoded = decoded;
    next();
  });
};

export const verifyToken = (payload) => {
  return jwt.verify(payload, secret, function (err, decoded) {
    if (err) {
      return false;
    }
    return decoded;
  });
};

export const owner = (req, res, next) => {
  const { decoded = {}, data = {} } = req;
  const { idType: ownerId, userType } = decoded;
  const { id_empresa: idEmpresa } = data;

  if (userType === "Administrador") {
    return next();
  }

  if (ownerId !== idEmpresa) {
    return next({
      message: "Prohibido",
      status: 403,
    });
  }

  next();
};
