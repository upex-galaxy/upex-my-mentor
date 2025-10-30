# KATA: Komponent Action Test Architecture

**Komponent Action Test Architecture**

> *"Como un kata en artes marciales, donde cada movimiento se practica repetidamente hasta la perfección, KATA framework convierte las acciones del sistema en bloques reutilizables y precisos."*

---

## 1. Filosofía y Visión

### ¿Por qué existe KATA?

La automatización de pruebas tradicional enfrenta problemas recurrentes:

- **Duplicación de código**: Escribir el mismo flujo múltiples veces en diferentes tests
- **Mantenimiento costoso**: Cambios en el sistema rompen docenas de pruebas
- **Desconexión con el negocio**: Los tests no mapean directamente a casos de prueba documentados
- **Falta de visibilidad**: No sabes qué casos de prueba pasaron o fallaron independientemente de los tests
- **Arquitectura poco clara**: Mezcla de responsabilidades entre lógica de prueba, interacción con el sistema y utilidades

KATA resuelve estos problemas mediante dos estrategias complementarias:

1. **Komponent Strategy**: Organiza el código en capas claras con inyección de dependencias
2. **Action Strategy**: Convierte casos de prueba en acciones reutilizables con trazabilidad automática

### Qué problemas resuelve KATA

- **Reutilización a escala**: Las acciones (ATCs) se comparten entre múltiples tests
- **Trazabilidad directa**: Cada acción mapea 1:1 con un caso de prueba en tu Test Management Tool
- **Arquitectura limpia**: Separación clara entre contexto, componentes base, componentes específicos y tests
- **Visibilidad granular**: Reportes que muestran qué acciones pasaron o fallaron, no solo qué tests
- **Mantenimiento eficiente**: Cambios en funcionalidades afectan un solo componente
- **Flexibilidad**: Soporte nativo para UI y API con la misma filosofía

---

## 2. Conceptos Fundamentales

### 2.1 ATC (Acceptance Test Case)

Un **ATC** es un caso de prueba de aceptación automatizado que representa una **unidad funcional** del sistema.

**Características clave:**

- Mapea 1:1 con un caso de prueba en Jira, TestRail u otro Test Management Tool
- Contiene pasos, datos y resultados esperados
- Es reutilizable en múltiples tests
- Tiene validaciones fijas (fixed assertions) embebidas
- Se ejecuta como un bloque atómico que pasa o falla

**Ejemplo conceptual:**

```
ATC: Crear usuario exitosamente
├── Pasos: POST /users con datos válidos
├── Datos: nombre, email, contraseña
└── Resultados esperados: 
    ├── Status 201
    ├── Usuario retornado con ID
    └── Usuario existe en base de datos
```

### 2.2 Shared Action (Acción Compartida)

Una **Shared Action** es un ATC implementado como método reutilizable en el código.

**Criterios de granularidad:**

- Una acción debe representar una **unidad funcional cohesiva** del sistema
- Puede involucrar una o múltiples interacciones si son conceptualmente inseparables
- NO debe ser tan grande que parezca un test completo
- NO debe ser tan pequeña que pierda significado de negocio

**Ejemplos correctos:**

- ✅ `login_successfully(username, password)` - una funcionalidad completa
- ✅ `select_flight_dates(departure, arrival)` - dos campos que forman una unidad
- ✅ `refund_payment_successfully(payment_id, amount)` - operación de negocio completa

**Ejemplos incorrectos:**

- ❌ `open_menu_panel()` - demasiado pequeño, es una interacción técnica
- ❌ `complete_purchase_journey()` - demasiado grande, es un flujo E2E completo

### 2.3 Component (Komponent)

Un **Component** es una clase que encapsula funcionalidad relacionada del sistema bajo prueba.

**Tipos de componentes:**

- **API Components**: Agrupan endpoints relacionados (UsersApi, LoansApi, PaymentsApi)
- **UI Components**: Agrupan elementos de una página o widget (LoginPage, CheckoutPage, HeaderNav)

Los componentes siguen el **Component Object Model (COM)** y contienen los ATCs como métodos.

### 2.4 Fixture

Un **Fixture** es el punto de entrada unificado que agrupa todos los componentes mediante **Dependency Injection**.

**Propósito:**

- Instanciar todos los componentes una sola vez
- Proveer acceso a componentes desde un solo objeto
- Simplificar imports en los tests
- Inyectar dependencias comunes (TestContext, Base Classes)

**Ejemplo de uso:**

```python
def test_user_journey(fixture):
    user = fixture.api.users.create_user_successfully(data)
    fixture.ui.login.login_successfully(user.email, user.password)
    fixture.ui.dashboard.verify_welcome_message(user.name)
```

### 2.5 Fixed Assertions vs Test-Level Assertions

KATA define dos niveles de validaciones:

**Fixed Assertions (Assertions Fijas)**

- Viven **dentro** de los ATCs
- Validan que la acción funcionó correctamente por sí misma
- Se ejecutan siempre que se usa el ATC, sin importar en qué test
- Garantizan que el comportamiento de la acción es correcto

**Test-Level Assertions (Assertions de Prueba)**

- Viven **en el test** que orquesta múltiples ATCs
- Validan el resultado de combinar acciones
- Verifican el estado final del sistema después de un flujo completo
- Validan relaciones entre resultados de diferentes acciones

**Ejemplo:**

```python
def test_refund_reduces_balance(fixture):
    # Acción 1: Crear préstamo (con fixed assertions internas)
    loan = fixture.api.loans.create_loan_successfully(amount=1000)
    
    # Acción 2: Procesar reembolso (con fixed assertions internas)
    refund = fixture.api.payments.refund_payment_successfully(
        loan_id=loan.id, 
        amount=200
    )
    
    # Test-level assertion: valida el efecto combinado
    updated_loan = fixture.api.loans.get_loan(loan.id)
    assert updated_loan.balance == 800, "Balance should decrease after refund"
```

### 2.6 Soft Fail

**Soft Fail** permite que un ATC falle pero la prueba continúe ejecutándose.

**Casos de uso:**

- Campos opcionales en formularios largos
- Validaciones no críticas en flujos E2E
- Pruebas exploratorias donde quieres ver todos los fallos, no solo el primero

**Implementación:**

```python
@atc(test_id="JIRA-123", soft_fail=True)
def fill_optional_section(self, data):
    # Si falla, se captura el error pero el test continúa
    pass
```

---

## 3. Arquitectura de Capas (Komponent Strategy)

KATA organiza el código en capas jerárquicas con responsabilidades claras.

### 3.1 Diagrama de Capas

```
┌─────────────────────────────────────────────────────┐
│                  Test Files Layer                   │
│         (test_user_journey.py, test_loans.py)       │
└────────────────────┬────────────────────────────────┘
                     │ importa fixture único
                     ▼
┌─────────────────────────────────────────────────────┐
│            Fixture Layer (Recommended)              │
│   TestFixture (Unified) - DI Entry Point            │
│   ├── api: ApiFixture                               │
│   └── ui: UiFixture (if page available)             │
└────────┬────────────────────────────────────────────┘
         │ instancia componentes
         ▼
┌─────────────────────────────────────────────────────┐
│            Specific Components Layer                │
│    (UsersApi, LoansApi, LoginPage, CheckoutPage)    │
│              ← Aquí viven los ATCs                  │
└────────┬────────────────────────────────────────────┘
         │ hereda de
         ▼
┌─────────────────────────────────────────────────────┐
│               Base Components Layer                 │
│             (ApiBase, UiBase) - Helpers             │
└────────┬────────────────────────────────────────────┘
         │ hereda de
         ▼
┌─────────────────────────────────────────────────────┐
│              Test Context Layer                     │
│   (TestContext) - Config, Logger, HTTP, Faker       │
└─────────────────────────────────────────────────────┘
```

### 3.2 Layer 1: Test Context

**Propósito**: Proveer configuración global y utilidades compartidas para cualquier tipo de prueba.

**Contenido:**

- Variables de entorno
- Configuración de ambiente (dev, staging, prod)
- Logger compartido
- Cliente HTTP (requests.Session)
- Generadores de datos (Faker)
- Utilidades cross-cutting

**Implementación:**

```python
# components/testcontext.py
class TestContext:
    """Utilidades y estado compartido para toda la suite."""
    
    def __init__(self, env: str):
        self.env = env
        self.config = self._load_config(env)
        self.faker = Faker()
        self.session = requests.Session()
        self.logger = self._setup_logger()
    
    def _load_config(self, env: str) -> dict:
        # Cargar configuración según ambiente
        return load_yaml(f"config/{env}.yaml")
    
    def _setup_logger(self):
        # Configurar logger estructurado
        return logging.getLogger("KATA")
```

**Cuándo agregar código aquí:**

- Necesitas algo disponible para **todos** los tipos de prueba (UI y API)
- Es configuración global o estado compartido
- No es específico de API ni de UI

### 3.3 Layer 2: Base Components

**Propósito**: Proveer helpers y funcionalidad común para un tipo específico de interacción (API o UI).

#### ApiBase - Helpers REST

```python
# components/api/api_base.py
from components.testcontext import TestContext

class ApiBase(TestContext):
    """Helpers HTTP reutilizados por todos los componentes API."""
    
    def __init__(self, env: str):
        super().__init__(env)
        self.base_url = self.config["api"]["base_url"]
    
    def _get(self, endpoint: str, **kwargs):
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, **kwargs)
        self.logger.info(f"GET {url} → {response.status_code}")
        return response
    
    def _post(self, endpoint: str, **kwargs):
        url = f"{self.base_url}{endpoint}"
        response = self.session.post(url, **kwargs)
        self.logger.info(f"POST {url} → {response.status_code}")
        return response
    
    def _full_url(self, endpoint: str) -> str:
        return f"{self.base_url}{endpoint}"
```

#### UiBase - Helpers UI

```python
# components/ui/ui_base.py
from playwright.sync_api import Page
from components.testcontext import TestContext

class UiBase(TestContext):
    """Helpers UI reutilizados por todos los componentes UI."""
    
    def __init__(self, page: Page, env: str):
        super().__init__(env)
        self.page = page
        self.page.set_default_timeout(8000)
        self.base_url = self.config["ui"]["base_url"]
    
    def navigate_to(self, path: str):
        url = f"{self.base_url}{path}"
        self.page.goto(url)
        self.logger.info(f"Navigated to {url}")
    
    def wait_for_element(self, selector: str, timeout: int = 5000):
        self.page.wait_for_selector(selector, timeout=timeout)
```

**Cuándo agregar código aquí:**

- Funcionalidad común a **todos** los componentes API o UI
- Wrappers de librerías (requests, Playwright)
- Métodos de utilidad técnica (logging, timeouts, retries)

### 3.4 Layer 3: Specific Components (Komponents)

**Propósito**: Encapsular funcionalidad de un área específica del sistema. **Aquí viven los ATCs.**

#### API Components

```python
# components/api/users_api.py
from components.api.api_base import ApiBase

class UsersApi(ApiBase):
    """Componente API para gestión de usuarios."""
    
    @atc(test_id="USER-001")
    def create_user_successfully(self, name: str, email: str, password: str):
        """
        ATC: Crear usuario con datos válidos.
        
        Args:
            name: Nombre del usuario
            email: Email único del usuario
            password: Contraseña (mín 8 caracteres)
        
        Returns:
            dict: Usuario creado con ID asignado
        
        Fixed Validations:
            - Response status 201
            - Usuario retornado contiene ID
            - Email coincide con el enviado
        """
        # ARRANGE
        payload = {
            "name": name,
            "email": email,
            "password": password
        }
        
        # ACT
        response = self._post("/users", json=payload)
        
        # ASSERT (Fixed Assertions)
        assert response.status_code == 201, \
            f"Expected 201, got {response.status_code}"
        
        user = response.json()
        assert "id" in user, "User ID not returned"
        assert user["email"] == email, \
            f"Email mismatch: expected {email}, got {user['email']}"
        
        self.logger.info(f"✅ User created: {user['id']}")
        return user
    
    @atc(test_id="USER-002")
    def get_user_successfully(self, user_id: int):
        """ATC: Obtener usuario por ID."""
        response = self._get(f"/users/{user_id}")
        
        assert response.status_code == 200, \
            f"Expected 200, got {response.status_code}"
        
        user = response.json()
        assert user["id"] == user_id, "User ID mismatch"
        
        return user
```

#### UI Components

```python
# components/ui/login_page.py
from playwright.sync_api import Page
from components.ui.ui_base import UiBase

class LoginPage(UiBase):
    """Componente UI para página de login."""
    
    # Locators
    USERNAME_INPUT = "#username"
    PASSWORD_INPUT = "#password"
    LOGIN_BUTTON = "button[type='submit']"
    ERROR_MESSAGE = ".error-message"
    
    @atc(test_id="AUTH-001")
    def login_successfully(self, username: str, password: str):
        """
        ATC: Login con credenciales válidas.
        
        Fixed Validations:
            - Botón de login clickeable
            - Redirección a dashboard
            - No hay mensajes de error
        """
        # ARRANGE
        self.navigate_to("/login")
        
        # ACT
        self.page.fill(self.USERNAME_INPUT, username)
        self.page.fill(self.PASSWORD_INPUT, password)
        self.page.click(self.LOGIN_BUTTON)
        
        # ASSERT (Fixed Assertions)
        self.page.wait_for_url("**/dashboard", timeout=5000)
        
        error_visible = self.page.is_visible(self.ERROR_MESSAGE)
        assert not error_visible, "Error message shown after login"
        
        self.logger.info(f"✅ Login successful for {username}")
```

**Cuándo crear un componente nuevo:**

- Agrupa endpoints relacionados (UsersApi, PaymentsApi)
- Agrupa elementos de una página o widget (CheckoutPage, HeaderNav)
- Representa un área funcional del sistema
- Contiene múltiples ATCs relacionados

**Estructura interna de un componente:**

- **Locators/Endpoints**: Constantes al inicio (solo para UI)
- **ATCs**: Métodos públicos con decorador `@atc`
- **Helpers privados**: Métodos internos sin decorador (si son necesarios)

### 3.5 Layer 4: Fixture (Dependency Injection)

**Propósito**: Punto de entrada unificado que instancia todos los componentes y los hace accesibles desde un solo objeto.

#### ApiFixture

```python
# components/api_fixture.py
from components.api.api_base import ApiBase
from components.api.users_api import UsersApi
from components.api.loans_api import LoansApi
from components.api.payments_api import PaymentsApi

class ApiFixture(ApiBase):
    """Fixture que agrupa todos los componentes API."""
    
    def __init__(self, env: str = "dev"):
        super().__init__(env)
        
        # Inyección de dependencias: cada componente recibe 'self'
        # que contiene TestContext + ApiBase
        self.users = UsersApi(env)
        self.loans = LoansApi(env)
        self.payments = PaymentsApi(env)
```

#### PageFixture

```python
# components/page_fixture.py
from playwright.sync_api import Page
from components.pages.page_base import PageBase
from components.pages.login_page import LoginPage
from components.pages.checkout_page import CheckoutPage
from components.pages.dashboard_page import DashboardPage

class PageFixture(PageBase):
    """Fixture que agrupa todos los componentes UI."""
    
    def __init__(self, page: Page, env: str = "dev"):
        super().__init__(page, env)
        
        # Inyección de dependencias: cada componente recibe page + env
        self.login = LoginPage(page, env)
        self.checkout = CheckoutPage(page, env)
        self.dashboard = DashboardPage(page, env)
```

**Principio de Dependency Injection:**

El Fixture implementa DI al:

1. Recibir dependencias en su constructor (env, page)
2. Instanciar componentes pasándoles esas dependencias
3. Los componentes NO crean sus propias dependencias
4. Resultado: desacoplamiento y testabilidad

### 3.6 Layer 5: Test Files

**Propósito**: Orquestar ATCs para validar flujos completos de negocio.

#### Configuración en conftest.py

```python
# conftest.py
import pytest
from components.api_fixture import ApiFixture
from components.page_fixture import PageFixture

@pytest.fixture(scope="session")
def env():
    return os.getenv("TEST_ENV", "dev")

@pytest.fixture(scope="function")
def api(env):
    """Fixture para pruebas de integración API."""
    return ApiFixture(env)

@pytest.fixture(scope="function")
def ui(page, env):
    """Fixture para pruebas E2E con UI."""
    return PageFixture(page, env)
```

#### Test de Integración (API)

```python
# tests/integration/test_loans.py

def test_refund_updates_balance(fixture):
    """
    Test de integración: Verificar que un reembolso actualiza el balance.
    
    Flow:
        1. Crear préstamo
        2. Realizar reembolso
        3. Verificar balance actualizado
    """
    # Acción 1: Crear préstamo (con fixed assertions)
    loan = fixture.api.loans.create_loan_successfully(
        user_id=123,
        amount=1000,
        term_months=12
    )
    
    # Acción 2: Procesar reembolso (con fixed assertions)
    refund = fixture.api.payments.refund_payment_successfully(
        loan_id=loan["id"],
        amount=200
    )
    
    # Test-level assertion: Validar efecto combinado
    updated_loan = fixture.api.loans.get_loan_successfully(loan["id"])
    assert updated_loan["balance"] == 800, \
        f"Expected balance 800, got {updated_loan['balance']}"
```

#### Test E2E (UI + API)

```python
# tests/e2e/test_purchase_journey.py

def test_complete_purchase_journey(fixture):
    """
    Test E2E: Journey completo de compra.
    
    Flow:
        1. Crear usuario via API (setup rápido)
        2. Login via UI
        3. Agregar producto al carrito via UI
        4. Completar compra via UI
        5. Verificar orden via API
    """
    # Setup: Crear usuario via API (más rápido que UI)
    user = fixture.api.users.create_user_successfully(
        name="Test User",
        email=f"test_{uuid4()}@example.com",
        password="SecurePass123"
    )
    
    # Login via UI
    fixture.ui.login.login_successfully(user["email"], "SecurePass123")
    
    # Agregar producto
    fixture.ui.checkout.add_product_to_cart("Laptop Pro", quantity=1)
    
    # Completar compra
    order = fixture.ui.checkout.complete_purchase_successfully(
        payment_method="credit_card"
    )
    
    # Verificar via API (más confiable que UI)
    order_details = fixture.api.orders.get_order_successfully(order["id"])
    assert order_details["status"] == "completed"
    assert order_details["total_amount"] == 1500
```

---

## 4. Estructura de Directorios

```
project/
├── components/                      # Todos los componentes KATA
│   ├── testcontext.py              # Layer 1: Core plumbing
│   │
│   ├── api_fixture.py              # Layer 4: API Fixture (DI)
│   ├── ui_fixture.py               # Layer 4: UI Fixture (DI)
│   ├── test_fixture.py             # Layer 4: Fixture unificado (RECOMENDADO)
│   │
│   ├── api/                        # Layer 2 & 3: API Components
│   │   ├── api_base.py            # Layer 2: Helpers REST
│   │   ├── users_api.py           # Layer 3: Component con ATCs
│   │   ├── loans_api.py           # Layer 3: Component con ATCs
│   │   ├── payments_api.py        # Layer 3: Component con ATCs
│   │   └── ...
│   │
│   └── ui/                         # Layer 2 & 3: UI Components
│       ├── ui_base.py             # Layer 2: Helpers UI
│       ├── login_page.py          # Layer 3: Component con ATCs
│       ├── checkout_page.py       # Layer 3: Component con ATCs
│       ├── dashboard_page.py      # Layer 3: Component con ATCs
│       └── ...
│
├── tests/                          # Layer 5: Test Files
│   ├── integration/               # Pruebas de integración (solo API)
│   │   ├── test_loans.py
│   │   ├── test_payments.py
│   │   └── ...
│   │
│   └── e2e/                       # Pruebas end-to-end (UI + API)
│       ├── test_purchase_journey.py
│       ├── test_user_onboarding.py
│       └── ...
│
├── utils/                         # Funciones auxiliares sin trazabilidad
│   ├── data_generators.py        # Helpers para generar datos
│   ├── validators.py             # Validadores custom
│   ├── decorators.py             # Decorador @atc y generación de reportes
│   └── tms_sync.py               # Sincronización con TMS
│
├── config/                        # Configuración por ambiente
│   ├── dev.yaml
│   ├── staging.yaml
│   └── prod.yaml
│
├── reports/                       # Reportes generados
│   └── atc_results.json
│
├── .env                          # Variables de entorno
├── conftest.py                    # Fixtures de pytest
├── pytest.ini                     # Configuración de pytest
└── requirements.txt               # Dependencias
```

---

## 5. Sistema de Trazabilidad (Action Strategy)

### 5.1 Decorador @atc

El decorador `@atc` es el mecanismo que conecta el código con el Test Management Tool.

**Propósito:**

- Mapear cada método ATC con su caso de prueba en Jira/TestRail/Xray
- Capturar resultados de ejecución (pass/fail)
- Generar reporte granular independiente de los tests
- Habilitar soft-fail cuando sea necesario

**Implementación:**

```python
# utils/decorators.py
import functools
import json
from typing import Callable, Optional

# Variable global para almacenar resultados (thread-safe con locks)
from threading import Lock
ATC_RESULTS = {}
ATC_LOCK = Lock()

def atc(test_id: str, soft_fail: bool = False):
    """
    Decorador para marcar un método como ATC trazable.
    
    Args:
        test_id: ID del caso de prueba en Test Management Tool
        soft_fail: Si True, captura errores pero permite continuar
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = {
                "test_id": test_id,
                "method": func.__name__,
                "status": None,
                "error": None,
                "executed_at": None
            }
            
            try:
                # Ejecutar el ATC
                from datetime import datetime
                result["executed_at"] = datetime.now().isoformat()
                
                return_value = func(*args, **kwargs)
                
                # ATC pasó exitosamente
                result["status"] = "PASS"
                _store_result(test_id, result)
                
                return return_value
                
            except Exception as e:
                # ATC falló
                result["status"] = "FAIL"
                result["error"] = str(e)
                _store_result(test_id, result)
                
                if soft_fail:
                    # Capturar error pero continuar
                    print(f"⚠️  SOFT FAIL - {test_id}: {str(e)}")
                    return None
                else:
                    # Re-lanzar la excepción
                    raise
        
        return wrapper
    return decorator

def _store_result(test_id: str, result: dict):
    """Almacena resultado de forma thread-safe."""
    with ATC_LOCK:
        if test_id not in ATC_RESULTS:
            ATC_RESULTS[test_id] = []
        ATC_RESULTS[test_id].append(result)

def generate_atc_report(output_path: str = "atc_results.json"):
    """Genera reporte JSON con resultados de todos los ATCs."""
    with ATC_LOCK:
        with open(output_path, "w") as f:
            json.dump(ATC_RESULTS, f, indent=2)
    
    print(f"📊 ATC Report generated: {output_path}")
```

**Hook de pytest para generar reporte:**

```python
# conftest.py
import pytest
from utils.decorators import generate_atc_report

def pytest_sessionfinish(session, exitstatus):
    """Generar reporte de ATCs al finalizar la sesión de pytest."""
    generate_atc_report("reports/atc_results.json")
```

### 5.2 Uso del decorador

```python
# components/api/loans_api.py
from utils.decorators import atc

class LoansApi(ApiBase):
    
    @atc(test_id="LOAN-001")
    def create_loan_successfully(self, user_id: int, amount: float):
        """ATC trazable que siempre reporta su resultado."""
        # ... implementación con fixed assertions
        pass
    
    @atc(test_id="LOAN-002", soft_fail=True)
    def verify_optional_field(self, loan_id: int):
        """ATC con soft-fail: falla pero permite continuar."""
        # Si falla, se registra pero no detiene el test
        pass
```

### 5.3 Formato del reporte JSON

```json
{
  "LOAN-001": [
    {
      "test_id": "LOAN-001",
      "method": "create_loan_successfully",
      "status": "PASS",
      "error": null,
      "executed_at": "2024-01-15T10:30:45.123456"
    },
    {
      "test_id": "LOAN-001",
      "method": "create_loan_successfully",
      "status": "FAIL",
      "error": "AssertionError: Expected 201, got 500",
      "executed_at": "2024-01-15T10:35:12.789012"
    }
  ],
  "USER-001": [
    {
      "test_id": "USER-001",
      "method": "create_user_successfully",
      "status": "PASS",
      "error": null,
      "executed_at": "2024-01-15T10:28:30.456789"
    }
  ]
}
```

**Interpretación:**

- `LOAN-001` se ejecutó 2 veces: 1 pass, 1 fail
- `USER-001` se ejecutó 1 vez: 1 pass
- Cada ejecución tiene timestamp y detalles del error si falló

### 5.4 Integración con Test Management Tools

KATA soporta múltiples Test Management Tools. El template viene configurado para **Xray** (el más usado), pero puedes cambiar fácilmente a TestRail, Jira directo con custom fields, o Jira con transiciones.

```python
# utils/tms_sync.py
"""
Sistema de sincronización con Test Management Tools.

CONFIGURACIÓN ACTIVA: Xray Cloud
Para usar otro TMS, comenta el código de Xray y descomenta el que necesites.
"""
import requests
import json
import os
from datetime import datetime

def sync_results(report_path: str = "reports/atc_results.json"):
    """
    Sincroniza resultados de ATCs con el Test Management Tool.
    
    Variables de entorno requeridas:
        AUTO_SYNC: "true" para habilitar sincronización automática
        
        Para Xray Cloud (ACTIVO):
            XRAY_CLIENT_ID: Client ID de Xray
            XRAY_CLIENT_SECRET: Client Secret de Xray
            XRAY_PROJECT_KEY: Clave del proyecto (ej: "DEMO")
    """
    if not os.getenv("AUTO_SYNC") == "true":
        print("⏭️  Auto-sync disabled. Set AUTO_SYNC=true to enable.")
        return
    
    with open(report_path, "r") as f:
        results = json.load(f)
    
    # ==================== XRAY CLOUD (ACTIVO) ====================
    _sync_to_xray_cloud(results)
    
    # ==================== OTRAS OPCIONES (COMENTADAS) ====================
    # Descomenta el método que necesites y comenta Xray arriba
    
    # _sync_to_testrail(results)
    # _sync_to_jira_customfield(results)
    # _sync_to_jira_transition(results)


# ============================================================
#                    XRAY CLOUD SYNC (ACTIVO)
# ============================================================

def _sync_to_xray_cloud(results: dict):
    """
    Sincroniza con Xray Cloud usando formato JSON nativo.
    
    Documentación: https://docs.getxray.app/display/XRAYCLOUD/Import+Execution+Results
    """
    client_id = os.getenv("XRAY_CLIENT_ID")
    client_secret = os.getenv("XRAY_CLIENT_SECRET")
    project_key = os.getenv("XRAY_PROJECT_KEY")
    
    # 1. Autenticar y obtener token
    auth_url = "https://xray.cloud.getxray.app/api/v2/authenticate"
    auth_payload = {
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    auth_response = requests.post(auth_url, json=auth_payload)
    if auth_response.status_code != 200:
        print(f"❌ Xray authentication failed: {auth_response.text}")
        return
    
    token = auth_response.json()
    
    # 2. Preparar payload en formato Xray JSON
    xray_payload = {
        "info": {
            "project": project_key,
            "summary": f"KATA Execution - {os.getenv('BUILD_ID', datetime.now().strftime('%Y%m%d-%H%M%S'))}",
            "description": "Automated test execution via KATA Framework"
        },
        "tests": []
    }
    
    # 3. Convertir resultados KATA a formato Xray
    for test_id, executions in results.items():
        final_status = "PASS"
        last_error = None
        
        for execution in executions:
            if execution["status"] == "FAIL":
                final_status = "FAIL"
                last_error = execution.get("error", "Test failed")
                break
        
        xray_status = "PASSED" if final_status == "PASS" else "FAILED"
        
        test_entry = {
            "testKey": test_id,
            "status": xray_status,
            "comment": f"🤖 KATA ATC: {executions[0]['method']}\n"
                      f"📊 Executions: {len(executions)}\n"
                      f"⏱️  Last execution: {executions[-1]['executed_at']}"
        }
        
        if last_error:
            test_entry["comment"] += f"\n\n❌ Error:\n{last_error}"
        
        xray_payload["tests"].append(test_entry)
    
    # 4. Importar resultados
    import_url = "https://xray.cloud.getxray.app/api/v2/import/execution"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(import_url, headers=headers, json=xray_payload)
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✅ Results synced to Xray Cloud successfully")
        print(f"   Test Execution: {result.get('key', 'N/A')}")
    else:
        print(f"❌ Xray sync failed: {response.status_code}")
        print(f"   {response.text}")


# ============================================================
#              TESTRAIL SYNC (COMENTADO - DISPONIBLE)
# ============================================================

# def _sync_to_testrail(results: dict):
#     """
#     Sincroniza con TestRail usando add_results_for_cases API.
#     
#     Variables de entorno:
#         TESTRAIL_URL: URL de tu instancia (ej: https://company.testrail.io)
#         TESTRAIL_USER: Email del usuario
#         TESTRAIL_API_KEY: API Key de TestRail
#         TESTRAIL_PROJECT_ID: ID del proyecto
#         TESTRAIL_RUN_ID: (opcional) ID del test run, crea uno nuevo si no existe
#     
#     Documentación: https://support.testrail.com/hc/en-us/articles/7077819312404
#     """
#     url = os.getenv("TESTRAIL_URL")
#     user = os.getenv("TESTRAIL_USER")
#     api_key = os.getenv("TESTRAIL_API_KEY")
#     project_id = os.getenv("TESTRAIL_PROJECT_ID")
#     run_id = os.getenv("TESTRAIL_RUN_ID")
#     
#     # Si no hay run_id, crear un nuevo test run
#     if not run_id:
#         run_payload = {
#             "name": f"KATA Execution - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
#             "description": "Automated execution via KATA Framework",
#             "include_all": True
#         }
#         
#         create_url = f"{url}/index.php?/api/v2/add_run/{project_id}"
#         response = requests.post(
#             create_url,
#             auth=(user, api_key),
#             headers={"Content-Type": "application/json"},
#             json=run_payload
#         )
#         
#         if response.status_code == 200:
#             run_id = response.json()["id"]
#             print(f"📊 Created TestRail run: {run_id}")
#         else:
#             print(f"❌ Failed to create run: {response.text}")
#             return
#     
#     # Preparar resultados
#     testrail_results = []
#     
#     for test_id, executions in results.items():
#         final_status = "pass"
#         error_msg = None
#         
#         for execution in executions:
#             if execution["status"] == "FAIL":
#                 final_status = "fail"
#                 error_msg = execution.get("error", "Test failed")
#                 break
#         
#         # TestRail status_id: 1=Passed, 5=Failed
#         status_id = 1 if final_status == "pass" else 5
#         
#         # Extraer case_id numérico del test_id (ej: "TC-123" → 123)
#         case_id = int(test_id.split("-")[-1])
#         
#         comment = (
#             f"🤖 KATA ATC: {executions[0]['method']}\n"
#             f"📊 Executions: {len(executions)}\n"
#             f"⏱️  Duration: {executions[-1]['executed_at']}"
#         )
#         
#         if error_msg:
#             comment += f"\n\n❌ Error:\n{error_msg}"
#         
#         testrail_results.append({
#             "case_id": case_id,
#             "status_id": status_id,
#             "comment": comment
#         })
#     
#     # Enviar resultados
#     results_url = f"{url}/index.php?/api/v2/add_results_for_cases/{run_id}"
#     response = requests.post(
#         results_url,
#         auth=(user, api_key),
#         headers={"Content-Type": "application/json"},
#         json={"results": testrail_results}
#     )
#     
#     if response.status_code == 200:
#         print(f"✅ Results synced to TestRail successfully")
#         print(f"   Test Run: {url}/index.php?/runs/view/{run_id}")
#     else:
#         print(f"❌ TestRail sync failed: {response.text}")


# ============================================================
#         JIRA CUSTOM FIELD SYNC (COMENTADO - DISPONIBLE)
# ============================================================

# def _sync_to_jira_customfield(results: dict):
#     """
#     Sincroniza con Jira actualizando custom field + agregando comentarios.
#     
#     Configuración en Jira:
#         1. Crear custom field tipo "Select List (single choice)"
#         2. Nombre: "Test Status" (o similar)
#         3. Opciones: PASS, FAIL, BLOCKED, NOT_RUN
#         4. Obtener el custom field ID (ej: customfield_10100)
#     
#     Variables de entorno:
#         JIRA_URL: URL de tu instancia (ej: https://company.atlassian.net)
#         JIRA_USER: Email del usuario
#         JIRA_API_TOKEN: API Token de Jira
#         JIRA_TEST_STATUS_FIELD: ID del custom field (ej: customfield_10100)
#     
#     Documentación: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
#     """
#     jira_url = os.getenv("JIRA_URL")
#     jira_user = os.getenv("JIRA_USER")
#     jira_token = os.getenv("JIRA_API_TOKEN")
#     custom_field_id = os.getenv("JIRA_TEST_STATUS_FIELD", "customfield_10100")
#     
#     auth = (jira_user, jira_token)
#     headers = {"Content-Type": "application/json"}
#     
#     for test_id, executions in results.items():
#         final_status = "PASS"
#         error_msg = None
#         
#         for execution in executions:
#             if execution["status"] == "FAIL":
#                 final_status = "FAIL"
#                 error_msg = execution.get("error", "Test failed")
#                 break
#         
#         # 1. Actualizar custom field
#         update_url = f"{jira_url}/rest/api/3/issue/{test_id}"
#         update_payload = {
#             "fields": {
#                 custom_field_id: {"value": final_status}
#             }
#         }
#         
#         response = requests.put(update_url, auth=auth, headers=headers, json=update_payload)
#         
#         if response.status_code != 204:
#             print(f"❌ Failed to update {test_id}: {response.text}")
#             continue
#         
#         # 2. Agregar comentario con historial de ejecución
#         comment_url = f"{jira_url}/rest/api/3/issue/{test_id}/comment"
#         
#         comment_body = {
#             "body": {
#                 "type": "doc",
#                 "version": 1,
#                 "content": [
#                     {
#                         "type": "paragraph",
#                         "content": [
#                             {
#                                 "type": "text",
#                                 "text": f"🤖 KATA Execution Result\n",
#                                 "marks": [{"type": "strong"}]
#                             }
#                         ]
#                     },
#                     {
#                         "type": "paragraph",
#                         "content": [
#                             {"type": "text", "text": f"Status: {final_status}\n"},
#                             {"type": "text", "text": f"ATC Method: {executions[0]['method']}\n"},
#                             {"type": "text", "text": f"Executions: {len(executions)}\n"},
#                             {"type": "text", "text": f"Timestamp: {executions[-1]['executed_at']}"}
#                         ]
#                     }
#                 ]
#             }
#         }
#         
#         if error_msg:
#             comment_body["body"]["content"].append({
#                 "type": "paragraph",
#                 "content": [
#                     {"type": "text", "text": "\n❌ Error Details:\n", "marks": [{"type": "strong"}]},
#                     {"type": "text", "text": error_msg}
#                 ]
#             })
#         
#         comment_response = requests.post(comment_url, auth=auth, headers=headers, json=comment_body)
#         
#         if comment_response.status_code == 201:
#             print(f"✅ Updated {test_id} → {final_status} (with comment)")
#         else:
#             print(f"⚠️  Updated {test_id} but failed to add comment")


# ============================================================
#      JIRA TRANSITION SYNC (COMENTADO - DISPONIBLE)
# ============================================================

# def _sync_to_jira_transition(results: dict):
#     """
#     Sincroniza con Jira ejecutando transiciones de workflow + agregando comentarios.
#     
#     Configuración en Jira (Opción recomendada con subtasks):
#         1. Crear issue type "Test Suite"
#         2. Test cases son subtasks del suite
#         3. Subtasks tienen workflow con transiciones:
#            - "Mark as Pass" (id: 31)
#            - "Mark as Fail" (id: 41)
#         4. Estados finales: PASS, FAIL, BLOCKED
#     
#     Variables de entorno:
#         JIRA_URL: URL de tu instancia
#         JIRA_USER: Email del usuario
#         JIRA_API_TOKEN: API Token
#         JIRA_TRANSITION_PASS: ID de transición a PASS (default: 31)
#         JIRA_TRANSITION_FAIL: ID de transición a FAIL (default: 41)
#     
#     Nota: Los IDs de transición varían según el workflow configurado.
#     Para obtenerlos: GET /rest/api/3/issue/{test_id}/transitions
#     
#     Documentación: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-transitions-post
#     """
#     jira_url = os.getenv("JIRA_URL")
#     jira_user = os.getenv("JIRA_USER")
#     jira_token = os.getenv("JIRA_API_TOKEN")
#     
#     transition_ids = {
#         "PASS": os.getenv("JIRA_TRANSITION_PASS", "31"),
#         "FAIL": os.getenv("JIRA_TRANSITION_FAIL", "41")
#     }
#     
#     auth = (jira_user, jira_token)
#     headers = {"Content-Type": "application/json"}
#     
#     for test_id, executions in results.items():
#         final_status = "PASS"
#         error_msg = None
#         
#         for execution in executions:
#             if execution["status"] == "FAIL":
#                 final_status = "FAIL"
#                 error_msg = execution.get("error", "Test failed")
#                 break
#         
#         target_transition_id = transition_ids[final_status]
#         
#         # 1. Verificar transiciones disponibles
#         transitions_url = f"{jira_url}/rest/api/3/issue/{test_id}/transitions"
#         response = requests.get(transitions_url, auth=auth)
#         
#         if response.status_code != 200:
#             print(f"❌ Failed to get transitions for {test_id}")
#             continue
#         
#         available = response.json()["transitions"]
#         transition_exists = any(t["id"] == target_transition_id for t in available)
#         
#         if not transition_exists:
#             print(f"⚠️  Transition {target_transition_id} not available for {test_id}")
#             continue
#         
#         # 2. Ejecutar transición
#         transition_payload = {
#             "transition": {"id": target_transition_id}
#         }
#         
#         response = requests.post(transitions_url, auth=auth, headers=headers, json=transition_payload)
#         
#         if response.status_code != 204:
#             print(f"❌ Failed to transition {test_id}: {response.text}")
#             continue
#         
#         # 3. Agregar comentario con detalles de ejecución
#         comment_url = f"{jira_url}/rest/api/3/issue/{test_id}/comment"
#         
#         comment_body = {
#             "body": {
#                 "type": "doc",
#                 "version": 1,
#                 "content": [
#                     {
#                         "type": "paragraph",
#                         "content": [
#                             {
#                                 "type": "text",
#                                 "text": f"🤖 KATA Execution - {final_status}\n",
#                                 "marks": [{"type": "strong"}]
#                             }
#                         ]
#                     },
#                     {
#                         "type": "paragraph",
#                         "content": [
#                             {"type": "text", "text": f"ATC: {executions[0]['method']}\n"},
#                             {"type": "text", "text": f"Executions: {len(executions)}\n"},
#                             {"type": "text", "text": f"Last run: {executions[-1]['executed_at']}\n"},
#                             {"type": "text", "text": f"Build: {os.getenv('BUILD_ID', 'Local')}"}
#                         ]
#                     }
#                 ]
#             }
#         }
#         
#         if error_msg:
#             comment_body["body"]["content"].append({
#                 "type": "codeBlock",
#                 "attrs": {"language": "text"},
#                 "content": [
#                     {"type": "text", "text": f"Error:\n{error_msg}"}
#                 ]
#             })
#         
#         comment_response = requests.post(comment_url, auth=auth, headers=headers, json=comment_body)
#         
#         if comment_response.status_code == 201:
#             print(f"✅ Transitioned {test_id} → {final_status} (with comment)")
#         else:
#             print(f"⚠️  Transitioned {test_id} but failed to add comment")


# ============================================================
#                    HOOK PARA PYTEST
# ============================================================

# Hook en conftest.py para ejecutar automáticamente
def pytest_sessionfinish(session, exitstatus):
    """
    Hook de pytest que se ejecuta al finalizar todas las pruebas.
    Genera reporte y sincroniza con TMS.
    """
    from utils.decorators import generate_atc_report
    
    # Generar reporte JSON de ATCs
    generate_atc_report("reports/atc_results.json")
    
    # Sincronizar con TMS
    sync_results("reports/atc_results.json")
```

#### Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env

# ===== Habilitar sincronización automática =====
AUTO_SYNC=true

# ===== XRAY CLOUD (ACTIVO) =====
XRAY_CLIENT_ID=your_client_id_here
XRAY_CLIENT_SECRET=your_client_secret_here
XRAY_PROJECT_KEY=DEMO

# ===== TESTRAIL (DESHABILITADO) =====
# TESTRAIL_URL=https://company.testrail.io
# TESTRAIL_USER=user@company.com
# TESTRAIL_API_KEY=your_api_key_here
# TESTRAIL_PROJECT_ID=1
# TESTRAIL_RUN_ID=  # Opcional, crea uno nuevo si está vacío

# ===== JIRA DIRECTO (DESHABILITADO) =====
# JIRA_URL=https://company.atlassian.net
# JIRA_USER=user@company.com
# JIRA_API_TOKEN=your_api_token_here
# 
# Para Custom Field:
# JIRA_TEST_STATUS_FIELD=customfield_10100
#
# Para Transitions:
# JIRA_TRANSITION_PASS=31
# JIRA_TRANSITION_FAIL=41

# ===== CI/CD =====
BUILD_ID=${CI_BUILD_ID}  # Variable del CI/CD
```

#### Cambiar de TMS

Para cambiar de Xray a otro TMS:

1. **Comenta la línea activa**:

```python
# _sync_to_xray_cloud(results)  # Comentar Xray
```

2. **Descomenta el TMS que necesites**:

```python
_sync_to_testrail(results)  # Activar TestRail
```

3. **Configura las variables de entorno** correspondientes en tu archivo `.env`

4. **Listo**: El framework ahora usará el nuevo TMS

---

## 6. Convenciones de Implementación

### 6.1 Nombres de ATCs

**Patrón:**

```
{verbo}_{recurso}_{escenario}_{condición}
```

**Ejemplos:**

- `create_user_successfully`
- `delete_loan_with_invalid_id`
- `login_with_expired_credentials`
- `refund_payment_partially`

**Reglas:**

- Siempre en inglés (o español, según convención del equipo)
- Verbos en infinitivo
- Ser descriptivo pero conciso
- Indicar si es escenario positivo (`successfully`) o negativo (`with_invalid_X`)

### 6.2 Nombres de componentes

**API Components:**

- Plural: `UsersApi`, `LoansApi`, `PaymentsApi`
- Sufijo `Api`

**UI Components:**

- Singular o descriptivo: `LoginPage`, `CheckoutPage`, `DashboardPage`
- Sufijo `Page` para páginas completas
- Sin sufijo para widgets/componentes parciales: `HeaderNav`, `SidebarMenu`

### 6.3 Guía de nombres de archivos

| Propósito            | Archivo               | Clase         |
| -------------------- | --------------------- | ------------- |
| Shared plumbing      | `testcontext.py`      | `TestContext` |
| Generic REST helpers | `api/api_base.py`     | `ApiBase`     |
| API fixture          | `api_fixture.py`      | `ApiFixture`  |
| Generic UI helpers   | `ui/ui_base.py`       | `UiBase`      |
| UI fixture           | `ui_fixture.py`       | `UiFixture`   |
| Unified fixture      | `test_fixture.py`     | `TestFixture` |
| API Component        | `api/users_api.py`    | `UsersApi`    |
| UI Component         | `ui/login_page.py`    | `LoginPage`   |

### 6.3 Estructura de un ATC

Todo ATC debe seguir el patrón **Arrange-Act-Assert**:

```python
@atc(test_id="RESOURCE-XXX")
def action_name(self, params):
    """
    Docstring descriptivo.
    
    Args:
        param: descripción
    
    Returns:
        tipo: descripción
    
    Fixed Validations:
        - Validación 1
        - Validación 2
    """
    # ARRANGE: Preparar datos y estado inicial
    payload = {...}
    initial_state = self.get_current_state()
    
    # ACT: Ejecutar la acción principal
    response = self._post("/endpoint", json=payload)
    
    # ASSERT: Fixed assertions (validaciones obligatorias)
    assert response.status_code == 201
    assert "id" in response.json()
    
    # Logging
    self.logger.info(f"✅ Action completed successfully")
    
    # Retornar resultado para encadenar
    return response.json()
```

### 6.4 Qué retornar de un ATC

**Regla general:** Retorna lo que la siguiente acción podría necesitar.

- Si creas un recurso → retorna el objeto completo
- Si obtienes un recurso → retorna el objeto completo
- Si modificas un recurso → retorna el objeto actualizado
- Si eliminas un recurso → retorna True o el status

**Ejemplo:**

```python
@atc(test_id="USER-001")
def create_user_successfully(self, name, email, password):
    # ... lógica ...
    return user  # Objeto completo para usar en siguiente acción

@atc(test_id="AUTH-001")
def login_successfully(self, email, password):
    # ... lógica ...
    return auth_token  # Token para autenticar requests siguientes
```

### 6.5 Parametrización de ATCs

Los ATCs pueden ser parametrizables para cubrir múltiples escenarios con un solo método:

```python
@atc(test_id="FLIGHT-001")
def select_flight_dates(
    self, 
    departure_date: Optional[str] = None,
    arrival_date: Optional[str] = None
):
    """
    ATC: Seleccionar fechas de vuelo.
    
    Args:
        departure_date: Fecha de salida (opcional)
        arrival_date: Fecha de llegada (opcional)
    
    Permite simular:
        - Solo fecha de salida
        - Solo fecha de llegada
        - Ambas fechas
        - Ninguna fecha (validación de error)
    """
    if departure_date:
        self.page.fill("#departure", departure_date)
    
    if arrival_date:
        self.page.fill("#arrival", arrival_date)
    
    # Fixed assertions según parámetros
    if departure_date:
        assert self.page.input_value("#departure") == departure_date
```

---

## 7. Mejores Prácticas

### 7.1 Cuándo usar Fixed Assertions vs Test-Level Assertions

**Usa Fixed Assertions para:**

- Validar que la acción funcionó correctamente (status code, response válido)
- Verificar efectos directos de la acción (recurso creado, estado cambiado)
- Garantizar precondiciones de negocio (campos obligatorios presentes)

**Usa Test-Level Assertions para:**

- Validar resultados que dependen de combinar múltiples acciones
- Verificar estado final del sistema después de un flujo completo
- Comprobar relaciones entre datos de diferentes acciones

### 7.2 Cuándo usar Soft Fail

**Usa soft_fail=True cuando:**

- Validas campos opcionales en formularios largos
- Ejecutas pruebas exploratorias donde quieres ver todos los fallos
- Implementas validaciones no críticas que no deben detener el flujo
- Generas screenshots de múltiples páginas aunque una falle

**NO uses soft_fail cuando:**

- El fallo implica que acciones siguientes no tienen sentido
- Estás validando funcionalidad crítica
- En ambientes de producción o staging críticos

### 7.3 Organización de componentes

**Un componente debe:**

- Agrupar ATCs relacionados conceptualmente
- No tener más de 15-20 ATCs (si crece, divide)
- Tener un propósito claro reflejado en su nombre
- Ser independiente de otros componentes

**Señales de que necesitas dividir un componente:**

- El archivo tiene más de 500 líneas
- Mezcla responsabilidades no relacionadas
- Es difícil encontrar un ATC específico
- El nombre del componente no describe claramente su contenido

### 7.4 Separación API vs UI

**Principio:** API y UI permanecen **totalmente aislados**.

**Por qué:**

- Las pruebas de integración (API) corren sin navegador (más rápidas)
- Las pruebas E2E pueden combinar ambas estratégicamente
- Autocompletado preciso: `api.` muestra endpoints, `ui.` muestra páginas
- Escalabilidad: agregar mobile no afecta API ni UI web

**En tests E2E:**

- Usa API para setup rápido (crear datos de prueba)
- Usa UI para el journey que quieres validar
- Usa API para verificaciones precisas (estado final)

```python
def test_purchase_journey(api, ui):
    # Setup via API (rápido)
    user = api.users.create_user_successfully(...)
    product = api.products.create_product_successfully(...)
    
    # Journey via UI (lo que queremos validar)
    ui.login.login_successfully(user["email"], password)
    ui.shop.add_to_cart(product["id"])
    order = ui.checkout.complete_purchase()
    
    # Verificación via API (confiable)
    order_data = api.orders.get_order_successfully(order["id"])
    assert order_data["status"] == "completed"
```

### 7.5 Logging y debugging

```python
@atc(test_id="LOAN-001")
def create_loan_successfully(self, user_id, amount):
    self.logger.info(f"🚀 Creating loan: user={user_id}, amount={amount}")
    
    response = self._post("/loans", json={...})
    
    if response.status_code != 201:
        self.logger.error(f"❌ Loan creation failed: {response.text}")
    
    assert response.status_code == 201
    
    loan = response.json()
    self.logger.info(f"✅ Loan created: id={loan['id']}")
    
    return loan
```

**Convención de emojis:**

- 🚀 Inicio de acción
- ✅ Acción exitosa
- ❌ Fallo o error
- ⚠️ Warning o soft fail
- 📊 Reporte o estadística

---

## 8. Migración a KATA

Si tienes una suite existente y quieres migrar a KATA:

### Fase 1: Identificar ATCs candidatos

- Revisa tus tests actuales
- Identifica bloques de código que se repiten
- Mapea esos bloques a casos de prueba en Jira
- Prioriza los más reutilizados

### Fase 2: Crear estructura de componentes

- Crea la estructura de directorios KATA
- Implementa TestContext con configuración actual
- Crea ApiBase o PageBase según necesites

### Fase 3: Extraer primer componente

- Elige un área funcional (ej: usuarios)
- Crea el componente (UsersApi o LoginPage)
- Migra los métodos como ATCs
- Agrega decoradores @atc

### Fase 4: Implementar Fixture

- Crea ApiFixture o PageFixture
- Instancia el primer componente
- Actualiza un test para usar el fixture

### Fase 5: Migrar progresivamente

- Migra un componente a la vez
- Mantén tests viejos funcionando en paralelo
- Valida que nuevos ATCs funcionan igual
- Elimina código legacy gradualmente

### Fase 6: Habilitar trazabilidad

- Implementa el decorador @atc
- Configura integración con Test Management Tool
- Genera primer reporte
- Valida sincronización automática

---

## 9. Herramientas y Tecnologías

### Lenguajes soportados

KATA es agnóstico al lenguaje. Implementaciones existentes:

- **Python** (pytest + requests + Playwright)
- **JavaScript/TypeScript** (Jest + axios + Playwright)
- **Java** (JUnit + RestAssured + Selenium)

### Frameworks de testing

- **Python**: pytest
- **JavaScript**: Jest, Mocha, Vitest
- **Java**: JUnit, TestNG

### Clientes HTTP

- **Python**: requests, httpx
- **JavaScript**: axios, fetch
- **Java**: RestAssured, OkHttp

### Automatización UI

- **Multi-lenguaje**: Playwright, Selenium
- **Python**: Playwright, Selenium
- **JavaScript**: Playwright, Puppeteer, Cypress

### Test Management Tools

- Jira + Xray
- Jira + Zephyr
- TestRail
- qTest
- PractiTest

### Reporting

- Allure
- ReportPortal
- HTML Reports personalizados
- JSON Reports para integración

---

## 10. Casos de Uso Reales

### Caso 1: Sistema de préstamos

```python
def test_loan_refund_flow(fixture):
    """
    Flow: Crear préstamo → Realizar pago → Procesar reembolso
    Validar: Balance correcto en cada etapa
    """
    # Crear préstamo
    loan = fixture.api.loans.create_loan_successfully(
        user_id=123,
        amount=1000,
        term_months=12
    )
    assert loan["balance"] == 1000
    
    # Realizar pago
    payment = fixture.api.payments.process_payment_successfully(
        loan_id=loan["id"],
        amount=300
    )
    
    # Validar balance después del pago
    loan = fixture.api.loans.get_loan_successfully(loan["id"])
    assert loan["balance"] == 700
    
    # Procesar reembolso
    refund = fixture.api.payments.refund_payment_successfully(
        payment_id=payment["id"],
        amount=100
    )
    
    # Validar balance final
    loan = fixture.api.loans.get_loan_successfully(loan["id"])
    assert loan["balance"] == 800
```

### Caso 2: E-commerce checkout

```python
def test_complete_purchase(fixture):
    """Journey completo de compra con pago exitoso."""
    # Setup via API
    user = fixture.api.users.create_user_successfully(
        name="John Doe",
        email="john@example.com"
    )
    
    # Login
    fixture.ui.login.login_successfully(user["email"], "password123")
    
    # Agregar productos
    fixture.ui.catalog.search_product("Laptop")
    fixture.ui.catalog.add_to_cart_successfully("Laptop Pro 15")
    
    # Checkout
    fixture.ui.cart.proceed_to_checkout()
    fixture.ui.checkout.fill_shipping_info({
        "address": "123 Main St",
        "city": "New York",
        "zip": "10001"
    })
    
    order = fixture.ui.checkout.complete_purchase_successfully(
        payment_method="credit_card"
    )
    
    # Verificación via API
    order_data = fixture.api.orders.get_order_successfully(order["id"])
    assert order_data["status"] == "completed"
    assert order_data["user_id"] == user["id"]
    assert len(order_data["items"]) == 1
```

### Caso 3: Soft fail en formulario largo

```python
def test_multi_section_form(fixture):
    """Formulario con múltiples secciones opcionales."""
    fixture.ui.forms.navigate_to_application_form()
    
    # Sección obligatoria (sin soft fail)
    fixture.ui.forms.fill_personal_info_successfully({
        "name": "Jane",
        "email": "jane@example.com"
    })
    
    # Sección opcional (con soft fail)
    fixture.ui.forms.fill_optional_employment_info(
        employer="Acme Corp",
        position="Engineer"
    )  # Si falla, continúa
    
    # Otra sección opcional (con soft fail)
    fixture.ui.forms.fill_optional_education_info(
        university="MIT",
        degree="Computer Science"
    )  # Si falla, continúa
    
    # Submit final (debe funcionar incluso si secciones opcionales fallaron)
    result = fixture.ui.forms.submit_application_successfully()
    assert result["status"] == "submitted"
```

---

## 11. Glosario

| Término | Definición |
|---------|-----------|
| **ATC** | Acceptance Test Case - Caso de prueba de aceptación automatizado |
| **Shared Action** | Un ATC implementado como método reutilizable |
| **Komponent** | Clase que encapsula funcionalidad relacionada del sistema |
| **Fixture** | Punto de entrada que agrupa componentes via Dependency Injection |
| **Fixed Assertions** | Validaciones embebidas en ATCs que siempre se ejecutan |
| **Test-Level Assertions** | Validaciones en el test que verifican flujo completo |
| **Soft Fail** | Permitir que un ATC falle sin detener la ejecución del test |
| **COM** | Component Object Model - Patrón de organización modular |
| **DI** | Dependency Injection - Patrón de inyección de dependencias |
| **Base Component** | Clase padre con helpers compartidos (ApiBase, PageBase) |
| **Specific Component** | Clase concreta con ATCs (UsersApi, LoginPage) |
| **Test Context** | Capa base con configuración y utilidades globales |
| **Trazabilidad** | Mapeo 1:1 entre ATCs en código y casos de prueba en TMS |

---

## 12. Recursos Adicionales

### Repositorios de ejemplo

- [KATA Python Template](https://github.com/example/kata-python) *(placeholder)*
- [KATA JavaScript Template](https://github.com/example/kata-js) *(placeholder)*

### Artículos y presentaciones

- "Introducción a KATA Framework" *(pendiente)*
- "Migrando de Page Object Model a KATA" *(pendiente)*
- "Trazabilidad automatizada con KATA" *(pendiente)*

### Comunidad

- Discord: [KATA Community](https://discord.gg/kata) *(placeholder)*
- GitHub Discussions: Comparte experiencias y mejores prácticas

---

## 13. Conclusión

KATA Framework es más que un patrón de diseño: es una filosofía completa para automatización de pruebas que:

✅ **Estructura tu código** en capas claras con responsabilidades definidas
✅ **Reutiliza acciones** mediante ATCs compartidos entre múltiples tests
✅ **Conecta código con negocio** mediante trazabilidad 1:1 con casos de prueba
✅ **Escala con tu proyecto** gracias a Component Object Model y Dependency Injection
✅ **Visibilidad granular** de qué funcionalidades pasaron o fallaron
✅ **Flexibilidad** para manejar escenarios complejos con soft-fail
✅ **Mantiene tu suite limpia** al evitar duplicación y promover composición

Como un kata en artes marciales, KATA Framework te invita a practicar buenos hábitos repetidamente hasta que construir pruebas mantenibles y trazables sea natural.

---

**Autor**: Elyer Maldonado  
**Versión**: 1.0  
**Fecha**: Octubre 2025  
**Licencia**: MIT

---

*"El código bien estructurado es como un kata perfecto: cada movimiento tiene propósito, y la práctica constante lleva a la maestría."*
