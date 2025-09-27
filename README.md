# 🐾 Pawsi

**Pawsi** es una aplicación web integral desarrollada individualmente por Hugo Diego Puzio para el evento "Hackathon del Milagro",
impulsado por la comunidad de SaltaDevs (10/09/2025), con el fin de brindar un amplio abanico de herramientas destinadas a la protección animal.  
Permite reportar animales avistados, publicar alertas de mascotas perdidas, difundir adopciones, buscar alertas y posts,
compartir información de veterinarias y productos para mascotas (alimento, ropa, accesorios, no permitido para la venta de animales).
Además, cuenta con un sistema avanzado de filtros, canal de chat interno, geolocalización, estadisticas de cuenta en tiempo real, 
términos y condiciones de uso, sistema antispam, formulario de soporte, perfil personalizado y sistema de guardado, entre otros.  

Su misión es **conectar personas, organizaciones y servicios** para ayudar a los animales de forma rápida, segura y responsable.

---

## 🚀 Demo
👉 [Enlace a la demo](https://paw-circle-connect.lovable.app)  

---

## 📲 Funcionalidades principales

### 🔑 Registro y cuentas
- Registro con email y contraseña.  
- Confirmación por correo electrónico antes de acceder a la app.  
- Perfil editable (nombre, país, provincia).  
- Panel de estadísticas personales: publicaciones activas, resueltas y eliminadas.

### 🐕 Formularios y secciones
- **Animal avistado**: reportar animales en la calle, heridos, enfermos y/o perdidos.  
- **Mascota perdida**: publicar alertas de extravío.  
- **Compra y venta**: solo informativa (no cuenta con sistema de pagos) para productos y servicios (prohibida la venta de animales).  
- **Veterinarias**: información sobre establecimientos y servicios.  
- **Adopciones**: difundir animales disponibles para adopción.  

🔸 Características:  
- Campos obligatorios y opcionales.  
- Subida de hasta 3 fotos.  
- Integración con **Mapbox** para ubicación exacta.  
- Teléfono/WhatsApp opcional con consentimiento expreso (se aclara que la información será pública en cada campo y se amplía en los
 Términos y Condiciones de Uso).  
- Imágenes sensibles (heridos/enfermos) se difuminan y deben abrirse manualmente bajo consentimiento del usuario.  
- En casos de reportar animales catalogados bajo el estado “sin vida”, la app desactiva automaticamente la opción de subir
 imágenes para proteger la sensibilidad del usuario y acoplarse a la política de seguridad de Google Playstore.

### 📢 Noticias
- Sección tipo “feed” con publicaciones en loop.  
- Flechas para navegar rápidamente.

### 💬 Contacto
- Opciones de contacto público: WhatsApp, email, teléfono (opcionales para amoldarse a la política de protección de datos de Google Playstore).  
- **Chat interno privado** (Canal disponible en "Mostrar métodos de contacto" de toda publicación bajo el nombre
“Contactar vía Pawsi”) para usuarios que no deseen compartir datos personales. En todos los chats, el asunto es por defecto el nombre del post
mediante el cual se contactó una de las partes, y los nombres de usuarios visibles son los registrados en el perfil.

### 🛡️ Sistema de moderación, soporte y seguridad
- Reporte de publicaciones y chats con causa + mensaje opcional (envío automático a `ecomervix@gmail.com`).  
- Captcha numérico en formularios.  
- Opción de bloquear y eliminar chats. 
- Sistema de seguridad para imágenes sensibles. 
- Sección de soporte con formulario de contacto.
- Opción de eliminar cuenta.

### 🔍 Filtros e idiomas
- Filtros avanzados por país y provincia (todos los países latinoamericanos con subdivisiones).  
- Filtros por color, raza, especie y ubicación en búsquedas de mascotas. 
- Los resultados se actualizan en tiempo real dependiendo de los filtros. Los posts de distintas provincias son visibles únicamente para usuarios
de la misma provincia (la cual se puede configurar en cualquier momento en el perfil). 

---

## 🏗️ Arquitectura del proyecto
├── public/ # Archivos públicos (svg, robots.txt)
├── src/
│ ├── components/ # Componentes de UI
│ ├── contexts/ # Contextos globales
│ ├── hooks/ # Custom hooks
│ ├── integrations/ # Integraciones externas (Mapbox, Supabase, etc.)
│ ├── lib/ # Librerías auxiliares
│ ├── pages/ # Páginas principales
│ ├── utils/ # Utilidades
│ ├── App.tsx # Punto de entrada principal
│ └── main.tsx # Bootstrap de React/Vite
├── supabase/ # Funciones y migraciones
├── package.json # Dependencias y scripts
└── tailwind.config.ts # Configuración de TailwindCSS


---

## 🛠️ Stack tecnológico

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)  
- **Lenguaje:** TypeScript  
- **Estilos:** [TailwindCSS](https://tailwindcss.com/)  
- **Backend & BaaS:** [Supabase](https://supabase.com/) (auth, storage, db, functions)  
- **Mapas:** [Mapbox](https://www.mapbox.com/)  
- **Infraestructura:** Despliegue con [Lovable](https://lovable.dev/)  

---

## 🤖 IA usada en el desarrollo e integraciones

El proyecto fue creado con la ayuda de **Lovable AI** para acelerar la construcción de la app, integraciones y despliegue.
Cuenta con integraciones de Supabase, Cloudfare Turnstile, Mapbox y Resend.

Variables de entorno:

VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_key
VITE_MAPBOX_TOKEN=tu_token
VITE_TURNSTILE_SITE_KEY=tu_site_key
TURNSTILE_SECRET_KEY=tu_secret_key
RESEND_API_KEY=tu_api_key

Lengugajes utilizados:
TypeScript
94.5%
 
PLpgSQL
4.3%
 
Other
1.2%


---

## ⚙️ Cómo correr el proyecto
Opción 1) Acceder al link del demo provisto.

Opción 2). Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/pawsi.git
cd pawsi
npm install
Correr en local host: npm run dev
Build de produccón: npm run build
npm run preview


Licencia:

Este proyecto está bajo la licencia Apache-2.0.
Consulta el archivo LICENSE
 para más detalles.

💡 Contribuciones

Las contribuciones son bienvenidas.
Puedes abrir un issue o enviar un pull request.

Agradecimientos

Comunidad de Lovable AI por la herramienta de desarrollo asistido.

Comunicad de SaltaDevs por impulsar el proyecto.

Supabase por el backend serverless.

Mapbox por la integración de mapas.

Resend y Cloudflare Turnstile por las integraciones de seguridad y reenvío.

Todas las personas comprometidas con el bienestar animal.


Cualquier duda, consulta, contribución o mensaje, comunicarse con ecomervix@gmail.com



























Lovable README


Welcome to your Lovable project
Project info
URL: https://lovable.dev/projects/4587b22d-9e29-4609-825a-a9243771d8ef

How can I edit this code?
There are several ways of editing your application.

Use Lovable

Simply visit the Lovable Project and start prompting.

Changes made via Lovable will be committed automatically to this repo.

Use your preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - install with nvm

Follow these steps:

# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
Edit a file directly in GitHub

Navigate to the desired file(s).
Click the "Edit" button (pencil icon) at the top right of the file view.
Make your changes and commit the changes.
Use GitHub Codespaces

Navigate to the main page of your repository.
Click on the "Code" button (green button) near the top right.
Select the "Codespaces" tab.
Click on "New codespace" to launch a new Codespace environment.
Edit files directly within the Codespace and commit and push your changes once you're done.
What technologies are used for this project?
This project is built with:

Vite
TypeScript
React
shadcn-ui
Tailwind CSS
How can I deploy this project?
Simply open Lovable and click on Share -> Publish.

Can I connect a custom domain to my Lovable project?
Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: Setting up a custom domain
