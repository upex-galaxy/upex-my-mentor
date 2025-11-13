# Prompt: Smoke Test en Staging

## Contexto
Lee la story actual en `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md`

## Tu tarea

Generar checklist de smoke test para validar que el deployment es funcional:

1. **Acceso básico:**
   - [ ] La aplicación carga sin errores 500
   - [ ] No hay errores en consola del navegador
   - [ ] Assets cargan correctamente (CSS, JS, imágenes)

2. **Autenticación (si aplica):**
   - [ ] Login funciona
   - [ ] Logout funciona
   - [ ] Sesión persiste al refrescar

3. **Funcionalidad crítica:**
   - [ ] Happy path de la story funciona end-to-end
   - [ ] Formularios envían datos correctamente
   - [ ] Navegación entre páginas funciona

4. **Integración con backend:**
   - [ ] APIs responden correctamente
   - [ ] Datos se guardan en la base de datos
   - [ ] Datos se recuperan correctamente

## Output
Checklist markdown que el QA ejecuta manualmente en 5-10 minutos.
