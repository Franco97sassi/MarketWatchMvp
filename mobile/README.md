# Nexus Market mobile

Aplicación actualizada a **Expo SDK 55**. Después de descargar el proyecto, instalá
las dependencias compatibles y limpiá la caché de Metro:

```bash
rm -rf node_modules
npm install
npx expo install --fix
npx expo start --clear
```

Iniciá el backend en el puerto `8000` antes de buscar acciones. Expo Go detecta
automáticamente la IP del equipo que sirve Metro. La URL también se puede definir
de forma explícita para un teléfono físico:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000 npx expo start --clear
```

## Descripción

Aplicación mobile full-stack para búsqueda y seguimiento de acciones bursátiles, desarrollada como proyecto portfolio utilizando **React Native + Expo** para el frontend y **FastAPI** para el backend.

La aplicación permite buscar acciones, visualizar cotizaciones en tiempo real, consultar historial de precios y administrar una lista de favoritos mediante una API REST propia integrada con **Alpha Vantage**.

---

# Demo del proyecto

## Funcionalidades principales

- Búsqueda de acciones por símbolo o nombre.
- Consulta de cotizaciones en tiempo real.
- Visualización de:
  - precio actual
  - apertura
  - máximo
  - mínimo
  - volumen
  - variación porcentual
- Historial reciente de precios mediante gráficos.
- Gestión de favoritos.
- Backend propio con FastAPI.
- Caché en memoria para optimizar llamadas externas.

---

# Stack tecnológico

## Frontend Mobile

- React Native
- Expo
- TypeScript
- React Navigation
- Axios
- react-native-chart-kit

## Backend

- Python
- FastAPI
- httpx
- Pydantic Settings
- Alpha Vantage API
- Caché en memoria

---

# Arquitectura

```text
backend/
│
├── app/
│   ├── main.py
│   ├── routes/
│   │   └── stocks.py
│   ├── services/
│   ├── cache/
│   └── core/
│       └── config.py
│
└── requirements.txt

mobile/
│
├── App.tsx
├── package.json
└── src/
    ├── api/
    │   └── stockApi.ts
    ├── screens/
    ├── components/
    ├── navigation/
    └── types/
        └── stock.ts
```

---

# Funcionalidades implementadas

## Búsqueda de acciones

La aplicación permite buscar acciones utilizando:

- símbolo bursátil
- nombre de empresa

Ejemplos:

- AAPL
- TSLA
- Microsoft
- Amazon

---

## Detalle de cotización

Cada acción muestra:

- Precio actual
- Variación diaria
- Apertura
- Máximo
- Mínimo
- Volumen

---

## Historial y gráficos

La aplicación consume datos históricos desde Alpha Vantage y renderiza gráficos utilizando:

```bash
react-native-chart-kit
```

---

## Favoritos

El usuario puede:

- agregar acciones favoritas
- eliminar favoritos
- consultar lista de favoritos

Actualmente los favoritos se almacenan en memoria.

---

## Caché en memoria

El backend implementa una capa de caché simple para:

- reducir llamadas repetidas a Alpha Vantage
- mejorar tiempos de respuesta
- evitar límites de rate limit de la API externa

---

# Instalación del proyecto

# 1. Clonar repositorio

```bash
git clone <repo-url>

cd marketwatch-mvp
```

---

# 2. Configurar backend

## Crear entorno virtual

```bash
cd backend

python -m venv .venv
```

## Activar entorno virtual

### Linux / Mac

```bash
source .venv/bin/activate
```

### Windows

```bash
.venv\Scripts\activate
```

---

## Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## Configurar variables de entorno

Crear archivo:

```text
backend/.env
```

Contenido:

```env
ALPHA_VANTAGE_API_KEY=tu_api_key
```

---

## Ejecutar backend

```bash
uvicorn app.main:app --reload
```

Servidor disponible en:

```text
http://localhost:8000
```

---

# 3. Configurar aplicación mobile

## Instalar dependencias

```bash
cd mobile

npm install
```

---

## Ejecutar aplicación

```bash
npm run start
```

También disponible:

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

### Web

```bash
npm run web
```

---

# Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Estado del backend |
| GET | `/stocks/search?query=AAPL` | Buscar acciones |
| GET | `/stocks/{symbol}/quote` | Obtener cotización |
| GET | `/stocks/{symbol}/history` | Obtener historial |
| GET | `/stocks/favorites/list` | Listar favoritos |
| POST | `/stocks/favorites` | Agregar favorito |
| DELETE | `/stocks/favorites/{symbol}` | Eliminar favorito |

---

# Ejemplo de flujo

## Buscar acción

```http
GET /stocks/search?query=AAPL
```

---

## Obtener cotización

```http
GET /stocks/AAPL/quote
```

---

## Obtener historial

```http
GET /stocks/AAPL/history
```

---

# Próximas mejoras

## Backend

- Persistencia con SQLite
- PostgreSQL
- Redis para caché
- Docker
- Tests automatizados
- Deploy cloud

## Frontend

- Persistencia local
- Mejoras visuales
- Dark mode
- Indicadores técnicos
- Alertas de precio
- Autenticación

---

# Consideraciones técnicas

## Limitaciones actuales

### Favoritos en memoria

Actualmente los favoritos:

- no persisten entre reinicios
- no están asociados a usuarios

---

### URL hardcodeada

La URL del backend actualmente está definida manualmente dentro de la aplicación mobile.

En futuras versiones se migrará a:

- variables de entorno
- configuración por ambiente

---

# Objetivo del proyecto

Este proyecto fue desarrollado como:

- MVP funcional
- práctica full-stack
- proyecto portfolio
- integración mobile + backend
- consumo de APIs externas
- arquitectura cliente-servidor

---

# Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React Native | Frontend mobile |
| Expo | Runtime mobile |
| TypeScript | Tipado frontend |
| FastAPI | Backend REST |
| Python | Lógica backend |
| Axios | Cliente HTTP |
| Alpha Vantage | Datos bursátiles |
| Chart Kit | Gráficos |
| httpx | Requests backend |

---

# Autor

Desarrollado por Franco Sassi.

---

# Descripción resumida para portfolio

> MarketWatch MVP es una aplicación mobile full-stack para seguimiento de acciones bursátiles desarrollada con React Native, Expo y FastAPI. Integra Alpha Vantage para obtener datos financieros en tiempo real e incluye búsqueda de acciones, detalle de cotización, gráficos históricos, favoritos y caché en memoria para optimizar llamadas externas.
