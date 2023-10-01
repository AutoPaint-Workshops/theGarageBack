import { z } from 'zod';

const UserSchema = z.object({
  userData: z.object({
    correo: z.string().trim().max(100).email().toLowerCase(),
    contrasena: z
      .string()
      .min(8)
      .max(16)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/),
    tipo_usuario: z.string(),
    url_foto: z.string().optional(),
    departamento: z.string(),
    ciudad: z.string(),
    direccion: z.string().trim().max(255),
  }),
});

const ClientSchema = z.object({
  userTypeData: z.object({
    nombre_completo: z.string().trim().max(100),
    tipo_documento: z.string(),
    numero_documento: z.string().max(100).trim(),
    telefono: z.string().max(20).trim(),
  }),
});

const CompanySchema = z.object({
  userTypeData: z.object({
    razon_social: z.string().trim().max(100),
    tipo_documento_empresa: z.string(),
    numero_documento_empresa: z.string().max(100).trim(),
    telefono: z.string().max(20).trim(),
    sitio_web: z.nullable(z.string().trim().max(100)),
    camara_comercio: z.string().optional(),
    representante_legal: z.string().max(100).trim(),
    tipo_documento_representante: z.string(),
    numero_documento_representante: z.string().max(20).trim(),
    correo_representante: z.string().trim().max(100).email().toLowerCase(),
    descripcion: z.string(),
  }),
});

const SignInSchema = z.object({
  correo: z.string().trim().email().toLowerCase(),
  contrasena: z.string().min(8).max(16),
});

const RecoverySchema = z.object({
  correo: z.string().trim().email().toLowerCase(),
});

const UpdateSchema = z.object({
  contrasena: z.string().min(8).max(16),
});

const SignUpClientSchema = UserSchema.merge(ClientSchema);
const SignUpCompanySchema = UserSchema.merge(CompanySchema);
const PasswordUpdateSchema = RecoverySchema.merge(UpdateSchema);

export const validateCreate = async (data, tipoUsuario) => {
  if (tipoUsuario === 'cliente') {
    return SignUpClientSchema.safeParseAsync(data);
  }
  if (tipoUsuario === 'empresa') {
    return SignUpCompanySchema.safeParseAsync(data);
  }
  return UserSchema.safeParseAsync(data);
};

export const validateSignIn = async (data) => {
  return SignInSchema.safeParseAsync(data);
};

export const validatePasswordRecovery = async (data) => {
  return RecoverySchema.safeParseAsync(data);
};

export const validatePasswordUpdate = async (data) => {
  return UpdateSchema.safeParseAsync(data);
};

export const clientFields = [...Object.keys(SignUpClientSchema.shape)];
export const companyFields = [...Object.keys(SignUpCompanySchema.shape)];
export const userAdmin = [...Object.keys(UserSchema.shape)];
export const signInFields = [...Object.keys(SignInSchema.shape)];
