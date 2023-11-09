# Manual de Instalación y Usuario - The Garage Back-end

## Descripción
Este proyecto es el back-end de la aplicación The Garage, proporcionando una API para la gestión eficiente de productos y transacciones en el mercado automotriz.

## Requisitos Previos
Antes de comenzar con la instalación, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/) (se instala con Node.js)
- [Prisma CLI](https://www.prisma.io/docs/getting-started/installation-types/prisma-client)
- Definir el lugar de donde se hará la persistencia de datos, es decir, Instalar postgresss como Administrador de Bases de datos en local, o usar un contenedor de docker.
  Si se opta por esta opción solo debe levantar el docker-compose agregado en el proyecto.

## Instalación

1. **Clonar el Repositorio:**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd thegarageback
   ```

2. **Instalar Dependencias:**
   ```bash
   npm install
   ```
### Dependencias de Producción:
- **@prisma/client**: ^5.3.1
- **bcrypt**: ^5.1.1
- **cloudinary**: ^1.40.0
- **cors**: ^2.8.5
- **cross-env**: ^7.0.3
- **dotenv**: ^16.3.1
- **express**: ^4.18.2
- **form-data**: ^4.0.0
- **jsonwebtoken**: ^9.0.1
- **lodash**: ^4.17.21
- **mercadopago**: ^1.5.17
- **multer**: ^1.4.5-lts.1
- **nodemailer**: ^6.9.5
- **socket.io**: ^4.7.2
- **swagger-ui-express**: ^5.0.0
- **uuid**: ^9.0.0
- **validator**: ^13.11.0
- **zod**: ^3.22.2

### Dependencias de Desarrollo:
- **@faker-js/faker**: ^8.1.0
- **@vitest/coverage-istanbul**: ^0.34.6
- **@vitest/coverage-v8**: ^0.34.6
- **dotenv-cli**: ^7.3.0
- **eslint**: ^8.50.0
- **eslint-config-google**: ^0.14.0
- **eslint-config-prettier**: ^8.9.0
- **eslint-plugin-json**: ^3.1.0
- **prisma**: ^5.3.1
- **supertest**: ^6.3.3
- **vitest**: ^0.34.6

Estas son las dependencias del proyecto The Garage Back-end. Puedes instalarlas utilizando el comando:

```bash
npm install
```

3. **Configurar Variables de Entorno:**
   - Crea un archivo `.env` en la raíz del proyecto.
   - Configura las variables de entorno según tus necesidades. 


```env
PORT=3000
# Puerto en el que se ejecutará el servidor

DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/ejemploBD"
# Para un DBMS local

DATABASE_URL="postgresql://usuario:contraseña@nombre_del_contenedor:5432/ejemploBD"
## Para un DBMS en Docker


TOKEN_SECRET="secreto_jwt_ejemplo"
# Secreto utilizado para firmar los tokens JWT

TOKEN_EXPIRES="1h"
# Duración de validez de los tokens JWT (ejemplo: 1 hora)

API_URL="http://localhost:3000/api"
# URL base de la API

CLOUD_NAME="cloudinary_ejemplo"
API_KEY="123456789012345"
API_SECRET="secreto_cloudinary_ejemplo"
# Configuración de Cloudinary para el almacenamiento de archivos multimedia

EMAIL_SENDER="correo_ejemplo@example.com"
PASSWORD_SENDER="contraseña_ejemplo"
# Credenciales del correo electrónico para enviar mensajes

MERCADO_PAGO_KEY="MERCADO_PAGO_KEY_ejemplo"
MERCADO_PAGO_TOKEN="MERCADO_PAGO_TOKEN_ejemplo"
# Credenciales de Mercado Pago para pagos en línea

WEB_URL="http://localhost:5173"
# URL de la aplicación web
```
Estos son valores de ejemplo y debes reemplazarlos con tus propias credenciales y configuraciones específicas. 






4. **Ejecutar Migraciones de la Base de Datos:**
   ```bash
   npx prisma db push
   ```

## Uso

### Modo de Desarrollo
```bash
npm run dev
```
Esto iniciará el servidor en modo de desarrollo.

### Modo de Producción
```bash
npm start
```
Inicia el servidor en modo de producción.

### Ejecutar Pruebas
```bash
npm test
```
Ejecuta las pruebas unitarias.

### Ejecutar Pruebas de Cobertura
```bash
npm run coverage
```
Genera y muestra el informe de cobertura.

### Ejecutar Pruebas End-to-End
```bash
npm run e2e
```
Inicia las pruebas end-to-end.
