# Proyecto Ecommerce 

## Descripción

Este proyecto es una plataforma de ecommerce desarrollada en Node.js, Express y MongoDB, que implementa un CRUD de usuarios junto con un sistema de autenticación y autorización robusto utilizando Passport y JWT.

---

## Características principales

- **Modelo de Usuario** con los siguientes campos:
  - `first_name`: String
  - `last_name`: String
  - `email`: String (único)
  - `age`: Number
  - `password`: String (hash con bcrypt)
  - `cart`: Referencia a Carts
  - `role`: String (por defecto: 'user')

- **Encriptación de Contraseña**  
  Las contraseñas de los usuarios se almacenan de forma segura utilizando `bcrypt.hashSync`.

- **Autenticación y Autorización**  
  Implementación de estrategias de Passport para registro, login y autenticación mediante JWT.

- **Sistema de Login**  
  El usuario puede iniciar sesión y recibe un token JWT válido para acceder a rutas protegidas.

- **Ruta de Validación**  
  Endpoint `/api/sessions/current` que valida el usuario autenticado y devuelve sus datos asociados al JWT.


## Uso

- Accede a `http://localhost:8080/login` para iniciar sesión.
- Accede a `http://localhost:8080/register` para crear un usuario.
- Usa el endpoint `/api/sessions/current` para validar el usuario autenticado (requiere JWT en el header).

---

## Estructura de carpetas relevante

```
src/
  models/
    user.model.js
  routes/
    sessions.router.js
    users.router.js
  config/
    passport.js
  utils/
    hashUtil.js
  views/
    login.handlebars
    register.handlebars
```

---

## Notas

- No incluyas la carpeta `node_modules` en el repositorio.
- El frontend utiliza Handlebars para las vistas de login y registro.
- El almacenamiento local (`localStorage`) se limpia al cerrar sesión.

---

