# SGT San Jorge (Sistema de Gestión de Abastecimiento y Ventas)

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-blue)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)
![Nodejs](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Base_de_Datos-MongoDB-47A248?logo=mongodb)
![Jest](https://img.shields.io/badge/Testing-Jest-C21325?logo=jest)
![Jenkins](https://img.shields.io/badge/CI%2FCD-Jenkins-D24939?logo=jenkins)
![AWS](https://img.shields.io/badge/Despliegue-AWS_EC2-FF9900?logo=amazonaws)

## 📖 Descripción del Proyecto

SGT (Sistema de Gestión de Trabajo) San Jorge es una plataforma web integral diseñada a medida para la administración del abastecimiento, inventario, métricas comerciales y el nuevo **Módulo de Punto de Venta (POS)** de la **Farmacia San Jorge**. El sistema centraliza las operaciones clave de la empresa brindando a los usuarios interfaces dinámicas y seguras, controles de acceso específicos según su perfil laboral, y un panel analítico para la toma de decisiones informadas.

## 🚀 Estado Actual y Nuevas Características

El proyecto ha evolucionado significativamente, incorporando robustas funcionalidades operativas y metodologías DevOps:

### 1. Módulo de Ventas (Punto de Venta - POS)
- **Interfaz POS Dinámica:** Búsqueda rápida de productos, carrito de compras interactivo y resumen transaccional en tiempo real.
- **Gestión de Pagos:** Integración de pasarelas de pago simuladas para procesar distintas metodologías de pago.
- **Inventario Inteligente (FEFO):** Descuento de stock automatizado mediante el algoritmo FEFO (*First Expired, First Out*), priorizando la salida de los productos más próximos a vencer.
- **Transacciones Atómicas:** Operaciones de base de datos seguras para garantizar la integridad del inventario durante cada venta.
- **Facturación:** Generación e impresión de facturas en formato HTML directamente desde la plataforma y visualización de historial de ventas.
- **Protección de Interfaz:** Restricciones aplicadas para evitar que el navegador traduzca automáticamente elementos críticos del POS (como logos y cálculos totales).

### 2. Panel de Métricas (Analytics Dashboard)
- Visualizaciones interactivas de datos comerciales utilizando gráficos dinámicos con `Recharts` para medir el rendimiento, ingresos y flujo de caja en tiempo real, respaldado por un esquema dedicado de métricas en la base de datos.

### 3. Sistema de Autenticación, Autorización y Seguridad
- **RBAC (Role-Based Access Control):** Acceso protegido mediante JWT con control de roles estrictos jerárquicos (Administrador, Regente, Vendedor).
- **Seguridad en Acciones Críticas:** Confirmaciones obligatorias mediante modales interactivos y **Autenticación Multifactor (MFA)** o verificación de contraseña para eliminaciones o modificaciones sensibles de registros.

### 4. DevOps y Pruebas
- **Testing:** Implementación de pruebas unitarias robustas utilizando **Jest** para garantizar la estabilidad de los flujos principales (como las transacciones del POS).
- **Integración y Despliegue Continuo (CI/CD):** Pipeline completamente configurado en **Jenkins**. Automatiza las fases de construcción (build), ejecución de pruebas (testing) y despliegue continuo (deployment) del código hacia una instancia de **AWS EC2**.

### 5. Notificaciones
- Soporte para transacciones por correo electrónico y alertas operativas a través de la integración de `Nodemailer`.

---

## 🛠️ Arquitectura y Tecnologías

El proyecto fue construido bajo un modelo de arquitectura **Cliente-Servidor (Client-Server)** fuertemente desacoplado:

### 💻 Frontend (`/client`)
- **React.js 18** gestionado a través de **Vite** para HMR y empaquetado ultra rápido.
- **Tailwind CSS** + **PostCSS** para diseño moderno, responsivo y adaptativo.
- **React Router DOM v6** para el manejo de rutas de la *"Single Page Application"*.
- **Recharts** para renderizado de estadísticas e indicadores de negocio.
- **Lucide React** para la implementación de un sistema iconográfico sobrio.
- **Axios** como cliente HTTP para la conexión y solicitud a respaldos y APIs.

### ⚙️ Backend (`/server`)
- **Node.js** operando sobre el framework **Express.js** para la lógica comercial y enrutamiento (API RESTful).
- **MongoDB** a través del ODM **Mongoose**, para la persistencia flexible y escalable orientada a documentos.
- **JWT (jsonwebtoken)** y **Bcrypt.js** para la creación de credenciales cifradas y robustez en la delegación de las sesiones.
- **Jest** para pruebas unitarias.
- **Nodemailer** para correos de recuperación y mensajería sistémica.
- Middleware integrado base (**CORS**, **Dotenv**) para la seguridad perimetral de la API.

### 🔄 Infraestructura y CI/CD
- **Jenkins:** Orquestación del pipeline (definido en `Jenkinsfile`).
- **AWS EC2:** Entorno de producción para el alojamiento del sistema.

---

## 📋 Requisitos Previos

Asegúrate de poseer instalada en tu estación de trabajo la siguiente suite de herramientas:
- [Node.js](https://nodejs.org/) (versión v18+ altamente recomendada).
- [Git](https://git-scm.com/) para gestión de versiones.
- Base de datos [MongoDB](https://www.mongodb.com/) (Local) o conexión remota mediante **MongoDB Atlas**.
- (Opcional) Entorno local de **Jenkins** si se desean correr los pipelines localmente.

---

## 🚀 Instalación y Despliegue Local

Sigue el paso a paso para ejecutar el entorno en tu máquina:

### 1. Clonar el repositorio

```bash
git clone https://github.com/CamiloAst/Farmacia-San-Jorge.git
cd Farmacia-San-Jorge
```

### 2. Configurar e Iniciar el Backend (Servidor Node)

Desplázate al directorio de la API y descarga sus correspondientes dependencias:

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
# O si prefieres usar el entorno de desarrollo: npm run dev
```

*(Opcional)* Para ejecutar las pruebas unitarias:
```bash
npm test
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

## 🔑 Generar Acceso Inicial (Demo - Opcional)

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

## 📄 Licencia

Todos los derechos de código, arquitectura intelectual y diseño pertenecen a **Farmacia San Jorge**. El uso de este producto no está autorizado para difusión, copia o distribución comercial de terceros no avalados.