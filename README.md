# SGT San Jorge

Sistema de Gestión de Abastecimiento para Farmacia San Jorge.

## Tecnologías Utilizadas

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Autenticación:** JWT con roles (Administrador, Regente, Vendedor)

## Pasos para Ejecutar Localmente

### 1. Variables de Entorno

Asegúrate de que estás en la raíz del proyecto. El archivo `.env` en la carpeta `server` ya contiene la conexión a la base de datos y la clave secreta JWT, por lo que no necesitas configuración adicional inicial por el momento.

### 2. Iniciar el Backend (Servidor Node)

Abre una nueva terminal en tu editor de código o PowerShell y ejecuta:

```bash
cd server
npm start
# O si prefieres usar node directamente: node index.js
```

### 3. Iniciar el Frontend (Cliente React Vite)

Abre **otra ventana de terminal** (para que el backend y frontend corran al mismo tiempo) y ejecuta:

```bash
cd client
npm run dev
```

El frontend estará disponible en tu navegador en la URL: [http://localhost:5173](http://localhost:5173).

---

## 4. Crear el Primer Usuario Administrador o Regente (Opcional - Demo)

Dado que no hay interfaz de registro público integrada, puedes crear un usuario enviando un request POST usando Thunder Client, Postman o cURL mientras ambas aplicaciones están corriendo.

**Ejemplo usando cURL:**

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{ \"nombre\": \"Admin San Jorge\", \"email\": \"admin@sanjorge.com\", \"password\": \"123456\", \"rol\": \"Administrador\" }"
```

Luego ve a [http://localhost:5173](http://localhost:5173) e ingresa con el email `admin@sanjorge.com` y clave `123456`.