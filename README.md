# 🛠️ Backend Base con Autenticación y Roles (Node + Express + Sequelize)

Esta plantilla está pensada para comenzar cualquier proyecto Node.js con autenticación por JWT y control de roles desde cero. Ideal para reutilizar en múltiples desarrollos.

---

## 📦 Requisitos

- Node.js y npm
- MySQL (ej: XAMPP)
- Postman o Thunder Client para pruebas

---

## ⚙️ Instalación

1. Cloná o copiá este proyecto
2. Instalá dependencias:

```bash
npm install
```

3. Creá la base de datos en MySQL (desde consola o phpMyAdmin):

```sql
CREATE DATABASE expedientes_db;
```

4. Copiá el archivo `.env.example` y renombralo como `.env`:

```bash
cp .env.example .env
```

5. Completá los datos en `.env` con tu entorno local:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=expedientes_db
JWT_SECRET=una_clave_segura
```

---

## 🚀 Ejecutar y poblar la base de datos

```bash
node src/seed.js
```

Esto crea:

- Tabla `roles`
- Tabla `usuarios`
- Usuario: `admin@example.com`
- Contraseña: `admin123`

---

## 🔐 Autenticación

### Endpoint de login

```
POST /auth/login
```

### Body

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Respuesta esperada

```json
{
  "token": "JWT..."
}
```

---

## 🔒 Ruta protegida de ejemplo

### Endpoint

```
GET /protected
```

### Header

```
Authorization: Bearer <token>
```

---

## 🧱 Estructura de carpetas

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── app.js
```

---

## 📌 Lista para clonar y usar en tus proyectos futuros
