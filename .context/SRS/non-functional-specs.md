# Non-Functional Specifications: Upex My Mentor

## 1. Performance

*   **Page Load Time (LCP - Largest Contentful Paint):** < 2.5 segundos en conexiones 3G lentas para las páginas principales (Home, Búsqueda de Mentores, Perfil de Mentor).
*   **API Response Time:** < 500ms (p95 percentile) para endpoints críticos (ej. login, búsqueda de mentores, reserva de sesión).
*   **Time to Interactive (TTI):** < 3.5 segundos en dispositivos móviles para las páginas interactivas.
*   **Concurrent Users:**
    *   **MVP:** Soporte para 100 usuarios concurrentes activos sin degradación significativa del rendimiento.
    *   **v2:** Objetivo de 500+ usuarios concurrentes.
*   **Database Query Time:** < 150ms para queries simples y < 300ms para queries complejas (p95 percentile).

## 2. Security

*   **Authentication:** Implementación de JWT tokens a través de Supabase Auth para todas las operaciones que requieran identificación de usuario.
*   **Authorization:** Implementación de RBAC (Role-Based Access Control) con roles `student` y `mentor`. Se utilizará Row Level Security (RLS) en PostgreSQL (Supabase) y validaciones a nivel de API para asegurar que los usuarios solo accedan a los recursos permitidos.
*   **Data Encryption:**
    *   **At rest:** Supabase proporciona cifrado automático de datos en reposo para la base de datos PostgreSQL.
    *   **In transit:** Todas las comunicaciones (frontend-backend, backend-servicios externos) se realizarán exclusivamente a través de HTTPS/TLS 1.3.
*   **Input Validation:** Validación de datos exhaustiva tanto en el cliente (para UX) como en el servidor (para seguridad y consistencia) utilizando esquemas (ej. Zod).
*   **Password Policy:** Contraseñas con un mínimo de 8 caracteres, incluyendo al menos una mayúscula, un número y un carácter especial. Gestión de hasheo y salting por Supabase Auth.
*   **Session Management:** Tokens JWT con expiración definida (ej. 1 hora) y un mecanismo de refresh token para mantener la sesión sin requerir re-autenticación constante.
*   **Verificación de Email:** Se implementará un flujo de verificación de email para asegurar que los usuarios registran emails válidos.
*   **OWASP Top 10:** Mitigaciones activas contra vulnerabilidades comunes como inyección SQL (gracias a ORM/Supabase), XSS (sanitización de inputs), CSRF (tokens CSRF si aplica o SameSite cookies), y gestión segura de autenticación/autorización.

## 3. Scalability

*   **Database:** PostgreSQL gestionado por Supabase, configurado con Row Level Security (RLS) para una gestión granular de acceso a datos. Supabase ofrece opciones de escalado vertical y horizontal.
*   **CDN:** Vercel Edge Network para la entrega de activos estáticos y el cacheo de respuestas de API, reduciendo la latencia y la carga del servidor de origen.
*   **Caching Strategy:**
    *   **ISR (Incremental Static Regeneration):** Para páginas de contenido que no cambian frecuentemente (ej. perfiles de mentores públicos), permitiendo actualizaciones en segundo plano.
    *   **API Caching:** Uso de headers `Cache-Control` en respuestas de API para permitir el cacheo en el cliente y en CDNs.
*   **Horizontal Scaling:** Las API Routes de Next.js serán diseñadas para ser stateless, facilitando su despliegue en múltiples instancias y el escalado horizontal automático en Vercel.
*   **Database Connection Pooling:** Gestionado por Supabase, optimizando el uso de conexiones a la base de datos.

## 4. Accessibility

*   **WCAG Compliance:** Objetivo de cumplir con el nivel AA de WCAG 2.1 para asegurar que la plataforma sea usable por personas con diversas discapacidades.
*   **Keyboard Navigation:** Todas las funcionalidades interactivas (botones, enlaces, formularios) deben ser accesibles y operables mediante navegación por teclado.
*   **Screen Reader Support:** Uso adecuado de etiquetas ARIA, atributos `alt` para imágenes y estructura semántica HTML para garantizar la compatibilidad con lectores de pantalla.
*   **Color Contrast:** Mínimo de relación de contraste de 4.5:1 para texto normal y 3:1 para texto grande, según las directrices de WCAG.
*   **Focus Indicators:** Indicadores de foco visibles y claros en todos los elementos interactivos para usuarios que navegan con teclado.

## 5. Browser Support

*   **Desktop:**
    *   Chrome (últimas 2 versiones principales)
    *   Firefox (últimas 2 versiones principales)
    *   Safari (últimas 2 versiones principales)
    *   Edge (últimas 2 versiones principales)
*   **Mobile:**
    *   iOS Safari (últimas 2 versiones principales)
    *   Android Chrome (últimas 2 versiones principales)

## 6. Reliability

*   **Uptime:** Objetivo del 99.9% de disponibilidad de la plataforma (excluyendo ventanas de mantenimiento programado).
*   **Error Rate:** Menos del 1% de las solicitudes a la API deben resultar en errores del servidor (códigos 5xx).
*   **Recovery Time Objective (RTO):** Menos de 5 minutos para la recuperación de incidentes críticos que afecten la disponibilidad del servicio.
*   **Backup y Restauración:** Supabase gestiona backups automáticos de la base de datos con capacidad de restauración a puntos en el tiempo.

## 7. Maintainability

*   **Code Coverage:** Objetivo de >80% de cobertura de código para tests unitarios en la lógica de negocio crítica y componentes de UI.
*   **Documentation:** Mantener documentación actualizada para el README del proyecto, API (OpenAPI), diagramas de arquitectura y decisiones de diseño clave.
*   **Linting y Formateo:** Configuración de ESLint y Prettier para mantener un estilo de código consistente y legible en todo el proyecto.
*   **TypeScript:** Uso de TypeScript en modo estricto (`strict: true`) para mejorar la calidad del código, la detectabilidad de errores y la mantenibilidad.
*   **Modularidad:** Diseño de la aplicación en módulos y componentes reutilizables para facilitar el entendimiento y las futuras extensiones.
