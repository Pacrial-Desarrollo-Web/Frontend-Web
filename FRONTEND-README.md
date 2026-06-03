# Frontend — Sistema de Gestión de Empresas y Empleados

Aplicación web desarrollada en **Angular 21** que consume una API REST en Spring Boot para gestionar empresas. Implementa el módulo de Empresa con formulario de inserción y tabla de consulta, conectado al backend mediante `HttpClient`.

---

## Tecnologías

| Tecnología | Versión |
|---|---|
| Angular | 21.2.x |
| TypeScript | 5.9.x |
| RxJS | 7.8.x |
| Angular SSR | 21.2.x |

---

## Estructura del proyecto

```
src/app/
├── components/
│   ├── empresa-form/        # Formulario de inserción de empresa
│   │   ├── empresa-form.component.ts
│   │   ├── empresa-form.component.html
│   │   └── empresa-form.component.css
│   └── empresa-list/        # Tabla de listado de empresas
│       ├── empresa-list.component.ts
│       ├── empresa-list.component.html
│       └── empresa-list.component.css
├── models/
│   └── empresa.model.ts     # Interfaz Empresa
├── services/
│   └── empresa.service.ts   # Servicio HTTP hacia el backend
├── app.config.ts            # Configuración global (HttpClient, Router)
├── app.routes.ts            # Rutas: /lista y /crear
├── app.ts                   # Componente raíz
└── app.html                 # Template raíz con router-outlet
```

---

## Modelo de datos — Empresa

| Campo | Tipo | Restricción |
|---|---|---|
| id | number | PK, autogenerado |
| nombre | string | Obligatorio |
| nit | string | Obligatorio |
| ciudad | string | Obligatorio |
| sector | string | Obligatorio |

---

## Lo que se implementó y corrigió

### Componentes creados

#### EmpresaFormComponent (`/crear`)
- Formulario reactivo con `ReactiveFormsModule` y `FormBuilder`
- Campos: nombre, nit, ciudad, sector con validaciones `required` y `minLength`
- Mensajes de error en tiempo real por campo
- Botón "Guardar Empresa" deshabilitado si el formulario es inválido
- Botón "Limpiar" para resetear el formulario
- Consume el endpoint `POST /api/empresas` del backend
- Redirige inmediatamente a `/lista` al recibir respuesta exitosa del backend

#### EmpresaListComponent (`/lista`)
- Carga automática de empresas al inicializar vía `ngOnInit`
- Tabla con columnas: ID, Nombre, NIT, Ciudad, Sector, Acciones
- Botón "+ Nueva Empresa" que navega al formulario
- Botón "Recargar" para refrescar la tabla manualmente
- Estado de carga visible ("Cargando empresas...")
- Mensaje cuando no hay empresas registradas
- Botón "Eliminar" con confirmación por empresa
- Contador de total de empresas al pie de la tabla
- Consume el endpoint `GET /api/empresas` del backend

#### EmpresaService
- `obtenerEmpresas()` → GET `/api/empresas`
- `obtenerEmpresaPorId(id)` → GET `/api/empresas/{id}`
- `crearEmpresa(empresa)` → POST `/api/empresas`
- `actualizarEmpresa(id, empresa)` → PUT `/api/empresas/{id}`
- `eliminarEmpresa(id)` → DELETE `/api/empresas/{id}`

---

### Correcciones aplicadas

#### 1. `app.html` — Template raíz roto
**Problema:** El archivo contenía todo el template por defecto de Angular (logo SVG, links, CSS suelto como texto plano) más dos `<router-outlet>` duplicados. La app renderizaba la página de bienvenida de Angular encima de todo el contenido.

**Solución:** Se reemplazó todo el contenido por únicamente:
```html
<router-outlet />
```

---

#### 2. `app.config.ts` — HttpClient no configurado para Angular 21
**Problema:** Angular 21 requiere `provideHttpClient()` en la configuración de la aplicación. El `HttpClientModule` importado en el componente raíz es una API deprecada/removida en versiones recientes, lo que hacía fallar todas las llamadas HTTP al backend.

**Solución:** Se agregó `provideHttpClient(withFetch())` al array de providers:
```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch())
  ]
};
```

> `withFetch()` es necesario porque el proyecto usa Angular SSR. Sin él, las peticiones HTTP hechas en el servidor Node.js no se transfieren correctamente al cliente durante la hidratación, dejando la lista atascada en "Cargando...".

---

#### 3. `app.ts` — Importación deprecada eliminada
**Problema:** El componente raíz importaba `HttpClientModule` en su array `imports`, que es la forma deprecada de proveer `HttpClient`.

**Solución:** Se eliminó la importación de `HttpClientModule`:
```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],   // HttpClientModule eliminado
  templateUrl: './app.html',
  styleUrl: './app.css'
})
```

---

#### 4. `angular.json` — Puerto fijo para el servidor de desarrollo
**Problema:** El frontend tomaba un puerto aleatorio en cada arranque, lo que obligaba a actualizar la configuración de CORS del backend constantemente.

**Solución:** Se fijó el puerto en `angular.json`:
```json
"serve": {
  "options": {
    "port": 60571
  }
}
```

---

#### 5. `empresa-form.component.ts` — Redirección inmediata tras crear empresa
**Problema:** Al crear una empresa, había un `setTimeout` de 1500ms antes de navegar a `/lista`, lo que generaba un delay innecesario y la empresa no aparecía de inmediato.

**Solución:** Se eliminó el timeout y la navegación es inmediata al recibir la respuesta del backend:
```typescript
next: (respuesta) => {
  this.formulario.reset();
  this.enviando = false;
  this.router.navigate(['/lista']);
}
```

---

## Conexión con el backend

El servicio apunta al endpoint del backend Spring Boot:

```typescript
// src/app/services/empresa.service.ts
private apiUrl = 'http://localhost:8080/api/empresas';
```

El backend debe tener CORS habilitado para el origen del frontend:

```java
@CrossOrigin(origins = "http://localhost:60571")
@RestController
@RequestMapping("/api/empresas")
public class EmpresaController { ... }
```

---

## Cómo ejecutar

**Requisito:** Backend Spring Boot corriendo en `http://localhost:8080`

```bash
npm install
npm start
```

La aplicación queda disponible en: `http://localhost:60571`

---

## Rutas disponibles

| Ruta | Componente | Descripción |
|---|---|---|
| `/lista` | EmpresaListComponent | Tabla con todas las empresas |
| `/crear` | EmpresaFormComponent | Formulario para registrar empresa |
| `/` | — | Redirige a `/lista` |

---

## Endpoints consumidos

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/api/empresas` | Listar todas las empresas |
| POST | `/api/empresas` | Crear una nueva empresa |

> Según el enunciado, no se implementa formulario ni tabla para la entidad hija **Empleado**.

---

## Evidencia de funcionamiento

### 1. Formulario de inserción vacío

Formulario con los 4 campos requeridos: Nombre, NIT, Ciudad y Sector. El botón "Guardar Empresa" permanece deshabilitado hasta que todos los campos sean válidos.

![Formulario vacío](screenshot_form_vacio.png)

---

### 2. Formulario con datos ingresados

Al completar todos los campos, el botón "Guardar Empresa" se habilita y consume el endpoint `POST /api/empresas` del backend.

![Formulario con datos](screenshot_form_relleno.png)

---

### 3. Tabla consultando datos desde el backend

La tabla consume el endpoint `GET /api/empresas` y muestra todas las empresas registradas en la base de datos con sus columnas ID, Nombre, NIT, Ciudad y Sector.

![Tabla con empresas](screenshot_lista.png)

---

## Flujo de inserción

```
Usuario llena el formulario
        ↓
Clic en "Guardar Empresa"
        ↓
POST http://localhost:8080/api/empresas
        ↓
Respuesta 200 OK del backend
        ↓
Redirección automática a /lista
        ↓
GET http://localhost:8080/api/empresas
        ↓
Tabla actualizada con la nueva empresa
```

---

## Validaciones del formulario

| Campo | Regla | Mensaje de error |
|---|---|---|
| Nombre | Requerido, mínimo 3 caracteres | "El nombre es requerido" / "Mínimo 3 caracteres" |
| NIT | Requerido, mínimo 5 caracteres | "El NIT es requerido" / "Mínimo 5 caracteres" |
| Ciudad | Requerido, mínimo 3 caracteres | "La ciudad es requerida" / "Mínimo 3 caracteres" |
| Sector | Requerido, mínimo 3 caracteres | "El sector es requerido" / "Mínimo 3 caracteres" |
