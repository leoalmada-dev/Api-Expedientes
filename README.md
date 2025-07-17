# 📁 Sistema de Gestión de Expedientes - Backend

Este proyecto backend (Node.js, Express, Sequelize) administra expedientes, movimientos, unidades y usuarios, con autenticación y roles diferenciados. Utiliza validaciones robustas con `express-validator`, asegurando integridad y seguridad de datos.

---

## 🛠️ Tecnologías y Herramientas

* **Node.js + Express**
* **Sequelize ORM (MySQL)**
* **JWT** (Autenticación)
* **bcryptjs** (Encriptado de contraseñas)
* **express-validator** (Validación de datos)
* **Morgan** (Logs en consola)
* **CORS** (Cross-Origin Resource Sharing)

---

## 🔄 Estructura del Proyecto

```
src/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── expedienteController.js
│   ├── movimientoController.js
│   ├── unidadController.js
│   └── usuarioController.js
├── middleware/
│   └── verifyToken.js
├── models/
│   ├── Expediente.js
│   ├── Movimiento.js
│   ├── Unidad.js
│   ├── Usuario.js
│   ├── Rol.js
│   ├── LogEliminacion.js
│   └── index.js
├── routes/
│   ├── auth.js
│   ├── expediente.js
│   ├── movimiento.js
│   ├── unidad.js
│   └── usuario.js
├── validations/
│   ├── authValidator.js
│   ├── expedienteValidator.js
│   ├── movimientoValidator.js
│   ├── unidadValidator.js
│   └── usuarioValidator.js
└── app.js
```

---

## 🔐 Usuarios Predefinidos

| Usuario (CI) | Contraseña    | Rol          |
| ------------ | ------------- | ------------ |
| 12345678     | admin123      | Admin        |
| 23456789     | supervisor123 | Supervisor   |
| 34567890     | operador123   | Operador     |
| 45678901     | visual123     | Visualizador |

---

## 🚩 Endpoints Principales

### **Autenticación (`/auth`)**

* **POST** `/auth/login`

```json
{
  "usuario": "12345678",
  "contraseña": "admin123"
}
```

### **Usuarios (`/usuarios`)**

* GET `/usuarios`
* POST `/usuarios`

```json
{
  "nombre": "Nuevo Usuario",
  "ci": "11223344",
  "correo": "nuevo@usuario.com",
  "contraseña": "usuario123",
  "rolId": 3,
  "unidadId": 1
}
```

### **Expedientes (`/expedientes`)**

* GET `/expedientes`
* POST `/expedientes`

```json
{
  "tipo_documento": "oficio",
  "numero_documento": "OFICIO N.º 100/2025",
  "forma_ingreso": "correo",
  "fecha_ingreso": "2025-07-16",
  "referencia": "Solicitud",
  "detalle": "Detalles adicionales",
  "primer_movimiento": {
    "tipo": "entrada",
    "fecha_movimiento": "2025-07-16",
    "unidadDestinoId": 1,
    "observaciones": "Ingreso inicial"
  }
}
```

### **Movimientos (`/expedientes/:expedienteId/movimientos`)**

* POST

```json
{
  "tipo": "salida",
  "fecha_movimiento": "2025-07-17",
  "unidadDestinoId": 2,
  "unidadOrigenId": 1,
  "observaciones": "Envío a Jurídica"
}
```

---

## ✅ Validaciones

Se utilizan validaciones robustas mediante **express-validator**. Se validan campos obligatorios, formatos correctos, y datos anidados como `primer_movimiento` en la creación de expedientes.

---

## 🚦 Respuestas uniformes

Todas las respuestas siguen el formato:

```json
{
  "ok": true|false,
  "mensaje": "Mensaje claro en español",
  "datos": {}
}
```

---

## 🖥️ Configuración del servidor

Crear archivo `.env` en raíz del proyecto:

```
PORT=3000
JWT_SECRET=tu_jwt_secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=expedientes_db
```

### Instalación y ejecución:

```bash
npm install
npm start | node src/app.js
```

---

## ⚙️ Próximos Pasos

* Implementar **tests automáticos** con Jest/Supertest.
* Agregar auditoría/logs de acciones.
* Mejoras de seguridad avanzadas.

---

### 🚀 Estado Actual

El backend está funcional, seguro y validado. Listo para integración completa con el frontend.

¡Buen trabajo hasta aquí!
