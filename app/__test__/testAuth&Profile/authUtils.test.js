import {
  encryptPassword,
  ifType,
  isActive,
  urlDocument,
  urlFoto,
  verifyPassword,
} from '../../api/v1/auth/utils';

describe('Utils', () => {
  test('ifType', () => {
    expect(ifType('cliente')).toBe(false);
    expect(ifType('empresa')).toBe(false);
    expect(ifType('administrador')).toBe(false);
    expect(ifType('admin')).toBe(true);
  });

  test('isActive', () => {
    expect(isActive('Empresa')).toBe('Verificando');
    expect(isActive('Cliente')).toBe('Activo');
  });

  test('urlFoto', async () => {
    expect(await urlFoto([])).toBe('https://placehold.co/400x400');
  });

  test('urlDocument', async () => {
    expect(await urlDocument([])).toBe('https://placehold.co/400x400');
  });

  test('encryptPassword', async () => {
    expect(await encryptPassword('123456')).not.toBe('123456');
  });

  test('verifyPassword', async () => {
    const encrypted = await encryptPassword('123456');
    const verify = await verifyPassword('123456', encrypted);
    expect(verify).toBe(true);

    const verify2 = await verifyPassword('1234567', encrypted);
    expect(verify2).toBe(false);
  });
});
