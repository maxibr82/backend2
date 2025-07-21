# Proyecto Ecommerce 

## Descripción

Este proyecto es una plataforma completa de ecommerce desarrollada en Node.js, Express y MongoDB. Implementa un sistema robusto de gestión de usuarios, productos y carritos de compra con autenticación y autorización utilizando Passport y JWT. El proyecto utiliza un patrón de arquitectura por capas con DAO (Data Access Object), servicios, DTOs y rutas.

---

## Características principales

### **Sistema de Usuarios**
- **Modelo de Usuario** con los siguientes campos:
  - `first_name`: String
  - `last_name`: String
  - `email`: String (único)
  - `age`: Number
  - `password`: String (hash con bcrypt)
  - `cart`: Referencia a Carts
  - `role`: String ('user', 'admin', 'premium')

### **Sistema de Productos**
- **Gestión completa de productos** con CRUD
- **Panel de administración** para gestión de productos
- **Categorización y filtrado** de productos
- **Stock y disponibilidad** en tiempo real

### **Sistema de Carritos**
- **Carrito de compras** personalizado por usuario
- **Gestión de cantidades** y productos
- **Proceso de checkout** y generación de tickets
- **Persistencia** del carrito entre sesiones

### **Autenticación y Autorización**
- **Encriptación de contraseñas** con bcrypt
- **Estrategias de Passport** para registro y login
- **JWT tokens** para autenticación
- **Roles de usuario** (user, admin, premium)
- **Sistema de recuperación de contraseñas**

### **Arquitectura y Patrones**
- **Patrón DAO** con Factory para abstracción de datos
- **Servicios** para lógica de negocio
- **DTOs** para transferencia de datos
- **Middleware** para validación y autenticación
- **WebSockets** para actualizaciones en tiempo real


## Uso

### **Para Usuarios**
- Accede a `http://localhost:8080/` para ver la página principal con productos
- Accede a `http://localhost:8080/login` para iniciar sesión
- Accede a `http://localhost:8080/register` para crear una cuenta nueva
- Navega por los productos y agrégalos al carrito
- Gestiona tu carrito en `http://localhost:8080/cart`
- Completa el proceso de compra y genera tickets

### **Para Administradores**
- Accede al panel de administración para gestionar productos
- Gestiona usuarios y sus roles
- Visualiza productos en tiempo real
- Administra el inventario y stock

### **Endpoints de API**
- `GET /api/sessions/current` - Validar usuario autenticado (requiere JWT)
- `GET/POST/PUT/DELETE /api/products` - CRUD de productos
- `GET/POST/PUT/DELETE /api/carts` - Gestión de carritos
- `POST /api/tickets` - Generación de tickets de compra
- `POST/PUT /api/users` - Gestión de usuarios

---

## Estructura de carpetas

```
📦 Proyecto Ecommerce
├── 📄 package.json
├── 📄 README.md
├── 📁 public/                          # Archivos estáticos
│   ├── 📁 css/
│   │   └── 📄 index.css               # Estilos principales
│   └── 📁 js/
│       ├── 📄 cart.js                 # JavaScript del carrito
│       ├── 📄 ecommerce.js            # JavaScript general del ecommerce
│       └── 📄 index.js                # JavaScript de la página principal
└── 📁 src/                            # Código fuente principal
    ├── 📄 app.js                      # Punto de entrada de la aplicación
    ├── 📄 websocket.js                # Configuración de WebSockets
    │
    ├── 📁 config/                     # Configuraciones
    │   └── 📄 passport.js             # Estrategias de autenticación
    │
    ├── 📁 dao/                        # Data Access Objects
    │   ├── 📄 cartDBManager.js        # DAO carritos (MongoDB)
    │   ├── 📄 cartFSManager.js        # DAO carritos (FileSystem)
    │   ├── 📄 productDBManager.js     # DAO productos (MongoDB)
    │   ├── 📄 productFSManager.js     # DAO productos (FileSystem)
    │   ├── 📄 userDBManager.js        # DAO usuarios (MongoDB)
    │   ├── 📄 userFSManager.js        # DAO usuarios (FileSystem)
    │   │
    │   ├── 📁 factory/                # Factory Pattern para DAOs
    │   │   ├── 📄 CartDAOFactory.js
    │   │   ├── 📄 DAOFactory.js
    │   │   ├── 📄 PersistenceConfig.js
    │   │   ├── 📄 ProductDAOFactory.js
    │   │   └── 📄 UserDAOFactory.js
    │   │
    │   ├── 📁 interfaces/             # Interfaces para DAOs
    │   │   ├── 📄 BaseDAO.js
    │   │   ├── 📄 CartDAO.js
    │   │   ├── 📄 ProductDAO.js
    │   │   └── 📄 UserDAO.js
    │   │
    │   └── 📁 models/                 # Modelos de Mongoose
    │       ├── 📄 cartModel.js
    │       ├── 📄 productModel.js
    │       ├── 📄 userModel.js
    │       ├── 📄 ticketModel.js
    │       ├── 📄 passwordResetModel.js
    │       └── 📄 index.js
    │
    ├── 📁 dto/                        # Data Transfer Objects
    │   ├── 📄 CartDTO.js
    │   ├── 📄 ProductDTO.js
    │   ├── 📄 ResponseDTO.js
    │   ├── 📄 TicketDTO.js
    │   └── 📄 UserDTO.js
    │
    ├── 📁 middleware/                 # Middleware personalizado
    │   ├── 📄 authMiddleware.js       # Autenticación y autorización
    │   └── 📄 validationMiddleware.js # Validación de datos
    │
    ├── 📁 routes/                     # Rutas de la aplicación
    │   ├── 📄 adminProductRouter.js   # Admin - productos
    │   ├── 📄 adminRouter.js          # Admin - general
    │   ├── 📄 adminUserRouter.js      # Admin - usuarios
    │   ├── 📄 cartRouter.js           # Gestión de carritos
    │   ├── 📄 cartRouter_new.js       # Nueva versión carritos
    │   ├── 📄 cartRouter_old.js       # Versión anterior carritos
    │   ├── 📄 passwordResetRouter.js  # Reset de contraseñas
    │   ├── 📄 productRouter.js        # Gestión de productos
    │   ├── 📄 sessions.router.js      # Sesiones de usuario
    │   ├── 📄 ticketRouter.js         # Tickets de compra
    │   ├── 📄 user.router.js          # Gestión de usuarios
    │   └── 📄 viewsRouter.js          # Rutas para vistas
    │
    ├── 📁 services/                   # Lógica de negocio
    │   ├── 📄 CartService.js
    │   ├── 📄 EmailService.js
    │   ├── 📄 PasswordResetService.js
    │   ├── 📄 ProductService.js
    │   ├── 📄 TicketService.js
    │   └── 📄 UserService.js
    │
    ├── 📁 utils/                      # Utilidades
    │   ├── 📄 constantsUtil.js        # Constantes del sistema
    │   ├── 📄 createFirstAdmin.js     # Creación de admin inicial
    │   ├── 📄 DataMigration.js        # Migración de datos
    │   ├── 📄 hashUtil.js             # Utilidades de hash
    │   ├── 📄 multerUtil.js           # Configuración de multer
    │   └── 📄 passwordResetScheduler.js # Programador de reset
    │
    └── 📁 views/                      # Vistas Handlebars
        ├── 📄 index.handlebars        # Página principal
        ├── 📄 login.handlebars        # Vista de login
        ├── 📄 register.handlebars     # Vista de registro
        ├── 📄 cart.handlebars         # Vista del carrito
        ├── 📄 adminProducts.handlebars # Panel admin productos
        ├── 📄 realTimeProducts.handlebars # Productos tiempo real
        ├── 📄 forgotPassword.handlebars # Recuperar contraseña
        ├── 📄 resetPassword.handlebars # Reset contraseña
        ├── 📄 notFound.handlebars     # Página 404
        └── 📁 layouts/
            └── 📄 main.handlebars     # Layout principal
```

---

## Tecnologías utilizadas

- **Backend**: Node.js, Express.js
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: Passport.js, JWT
- **Template engine**: Handlebars
- **Comunicación en tiempo real**: Socket.io
- **Encriptación**: bcrypt
- **Subida de archivos**: Multer
- **Validación**: Middleware personalizado

## Patrones de diseño implementados

- **DAO (Data Access Object)**: Abstracción de la capa de datos
- **Factory Pattern**: Creación de instancias de DAO según configuración
- **DTO (Data Transfer Object)**: Transferencia controlada de datos
- **Service Layer**: Separación de lógica de negocio
- **Middleware Pattern**: Validación y autenticación
- **Repository Pattern**: Gestión de persistencia de datos

## Instalación y configuración

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno
4. Ejecuta la aplicación: `npm start`
5. Accede a `http://localhost:8080`

## Notas

- El proyecto utiliza un patrón de arquitectura por capas para mejor mantenibilidad
- Implementa tanto persistencia en MongoDB como en FileSystem
- El sistema de roles permite diferentes niveles de acceso
- Las contraseñas se almacenan hasheadas con bcrypt
- Los carritos persisten entre sesiones de usuario
- El sistema de tickets genera comprobantes de compra
- No incluyas la carpeta `node_modules` en el repositorio
- El frontend utiliza Handlebars para renderizado del lado del servidor
- WebSockets permiten actualizaciones en tiempo real de productos

---

