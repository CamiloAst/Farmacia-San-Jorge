# SGT San Jorge (Sistema de Gestión de Abastecimiento)

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-blue)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)
![Nodejs](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Base_de_Datos-MongoDB-47A248?logo=mongodb)

## Descripción del Proyecto

SGT (Sistema de Gestión de Trabajo) San Jorge es una plataforma web integral diseñada a medida para la administración del abastecimiento, inventario y métricas comerciales de la **Farmacia San Jorge**. El sistema centraliza las operaciones clave de la empresa brindando a los usuarios interfaces dinámicas y seguras, controles de acceso específicos según su perfil laboral, y un panel analítico para la toma de decisiones informadas.

##  Características Principales

- **Sistema de Autenticación y Autorización (RBAC):** Acceso protegido mediante JSON Web Tokens (JWT) con control de roles estrictos jerárquicos:
  -  **Administrador:** Acceso total al panel de control, configuración, eliminación de registros (protegido por MFA/Verificación de contraseña) y reportería global.
  -  **Regente:** Supervisión del abastecimiento, gestión de inventario y acceso a informes de métricas gerenciales.
  -  **Vendedor:** Operaciones del día a día, visualización de productos y uso del sistema en punto de venta.
- **Panel de Métricas (Analytics Dashboard):** Visualizaciones interactivas de datos comerciales utilizando gráficos dinámicos con `Recharts` para medir el rendimiento, ingresos y flujo de caja en tiempo real.
- **Gestión Continua y Segura:** Auditoría y confirmación obligatoria mediante modales interactivos para acciones críticas que modifiquen o borren datos esenciales.
- **Notificaciones / Comunicación:** Soporte para transacciones por correo electrónico y alertas operativas a través de la integración de `NodeMailer`.

##  Arquitectura y Tecnologías

El proyecto fue construido bajo un modelo de arquitectura **Cliente-Servidor (Client-Server)** fuertemente desacoplado:

###  Frontend (`/client`)
- **React.js 18** gestionado a través de **Vite** para HMR y empaquetado ultra rápido.
- **Tailwind CSS** + **PostCSS** para diseño moderno, responsivo y adaptativo.
- **React Router DOM v6** para el manejo de rutas de la *"Single Page Application"*.
- **Recharts** para renderizado de estadísticas e indicadores de negocio.
- **Lucide React** para la implementación de un sistema iconográfico sobrio.
- **Axios** como cliente HTTP para la conexión y solicitud a respaldos y APIs.

###  Backend (`/server`)
- **Node.js** operando sobre el framework **Express.js** para la lógica comercial y enrutamiento (API RESTful).
- **MongoDB** a través del ODM **Mongoose**, para la persistencia flexible y escalable orientada a documentos.
- **JWT (jsonwebtoken)** y **Bcrypt.js** para la creación de credenciales cifradas y robustez en la delegación de las sesiones.
- **Nodemailer** para correos de recuperación y mensajería sistémica.
- Middleware integrado base (**CORS**, **Dotenv**) para la seguridad perimetral de la API.

---

##  Requisitos Previos

Asegúrate de poseer instalada en tu estación de trabajo la siguiente suite de herramientas:
- [Node.js](https://nodejs.org/) (versión v18+ altamente recomendada).
- [Git](https://git-scm.com/) para gestión de versiones.
- Base de datos [MongoDB](https://www.mongodb.com/) (Local) o conexión remota mediante **MongoDB Atlas**.

---

##  Instalación y Despliegue Local

Sigue el paso a paso para ejecutar el entorno en tu máquina:

### 1. Clonar el repositorio

```bash
git clone https://github.com/CamiloAst/Farmacia-San-Jorge.git
cd Farmacia-San-Jorge
```

### 2. Configurar e Iniciar el Backend (Servidor Node)

Desplázate al directorio de la API y descarga sus correspondientes módulos:

```bash
cd server
npm install
```

**Variables de Entorno:** Genera un archivo `.env` en el directorio `./server` empleando las siguientes llaves (solicita de ser necesario las credenciales a los responsables del proyecto):

```env
PORT=5000
MONGODB_URI=tu_cadena_de_conexion_mongodb_aqui
JWT_SECRET=una_llave_secreta_super_segura
```

Para arrancar el servicio en la terminal actual:
```bash
npm start
# O si prefieres usar node directamente: node index.js
```

### 3. Configurar e Iniciar el Frontend (Cliente React)

Abre **una nueva ventana de terminal** en la raíz general de tu repositorio, y ejecuta secuencialmente:

```bash
cd client
npm install
npm run dev
```

Una vez procesado, el cliente de usuario quedará público en tu *localhost*: [http://localhost:5173](http://localhost:5173).

---

##  Generar Acceso Inicial (Demo - Opcional)

Si el ecosistema cuenta con bases de datos en blanco y por políticas no dispone de una interfaz pública de suscripción, debes inyectar la credencial administradora inicial mediante consumo API externo (por ej. **Postman**, **cURL** o inyectándola directo a MongoDB).

**Ejemplo mediante terminal (cURL):**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ 
    "nombre": "Admin San Jorge", 
    "email": "admin@sanjorge.com", 
    "password": "123456", 
    "rol": "Administrador" 
  }'
```

Inmediatamente prosigue al inicio de sesión ([http://localhost:5173](http://localhost:5173)) e introduce `admin@sanjorge.com` con la contraseña configurada.

---

##  Licencia

Todos los derechos de código, arquitectura intelectual y diseño pertenecen a **Farmacia San Jorge**. El uso de este producto no está autorizado para difusión, copia o distribución comercial de terceros no avalados.