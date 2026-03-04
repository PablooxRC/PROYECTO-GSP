# 🧪 GUÍA DE TESTING E INTEGRACIÓN

## 1. TESTING BACKEND CON JEST Y SUPERTEST

### Instalación:

```bash
npm install --save-dev jest @types/jest supertest @types/supertest
```

### Configurar Jest (package.json):

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": ["src/**/*.js"],
    "coveragePathIgnorePatterns": ["/node_modules/", "/dist/"],
    "testMatch": ["**/__tests__/**/*.test.js", "**/*.test.js"]
  }
}
```

### Ejemplo: test/api/auth.test.js

```javascript
import request from "supertest";
import app from "../../src/app.js";

describe("Auth API", () => {
  describe("POST /api/auth/signup", () => {
    it("debe crear un nuevo dirigente", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        ci: 12345678,
        nombre: "Juan",
        apellido: "Pérez",
        email: "juan@example.com",
        unidad: "Castores",
        password: "SecurePass123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("ci");
    });

    it("debe rechazar email duplicado", async () => {
      // Primero crea uno
      await request(app).post("/api/auth/signup").send({
        ci: 12345679,
        nombre: "Juan",
        apellido: "Pérez",
        email: "duplicate@example.com",
        unidad: "Castores",
        password: "SecurePass123",
      });

      // Intenta crear otro con mismo email
      const response = await request(app).post("/api/auth/signup").send({
        ci: 12345680,
        nombre: "Pedro",
        apellido: "González",
        email: "duplicate@example.com",
        unidad: "Scouts",
        password: "SecurePass456",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/signin", () => {
    it("debe iniciar sesión correctamente", async () => {
      const response = await request(app).post("/api/auth/signin").send({
        email: "juan@example.com",
        password: "SecurePass123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("debe rechazar contraseña incorrecta", async () => {
      const response = await request(app).post("/api/auth/signin").send({
        email: "juan@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

### Ejecutar tests:

```bash
npm test
npm run test:ci  # Para CI/CD
```

---

## 2. TESTING FRONTEND CON VITEST Y REACT TESTING LIBRARY

### Instalación:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Configurar vite.config.js:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
```

### src/test/setup.js:

```javascript
import "@testing-library/jest-dom";
```

### Ejemplo: src/components/ui/Button.test.jsx

```javascript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button Component", () => {
  it("debe renderizar el botón", () => {
    render(<Button>Haz click</Button>);
    expect(screen.getByText("Haz click")).toBeInTheDocument();
  });

  it("debe llamar onClick cuando se hace click", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Haz click</Button>);

    await userEvent.click(screen.getByText("Haz click"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("debe deshabilitarse cuando loading es true", () => {
    render(<Button loading>Cargando...</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Ejecutar tests:

```bash
npm run test      # watch mode
npm run test:ui   # UI dashboard
npm run test:cov  # coverage
```

---

## 3. TESTING DE INTEGRACIÓN END-TO-END

### Instalación Playwright:

```bash
npm install -D playwright @playwright/test
```

### Crear tests/auth.e2e.js:

```javascript
import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("Usuario puede registrarse e iniciar sesión", async ({ page }) => {
    // Navega a registro
    await page.goto("http://localhost:5173/register");

    // Rellena formulario
    await page.fill('input[name="nombre"]', "Juan");
    await page.fill('input[name="apellido"]', "Pérez");
    await page.fill('input[name="email"]', "juan@example.com");
    await page.fill('input[name="password"]', "SecurePass123");
    await page.fill('input[name="unidad"]', "Castores");

    // Envía formulario
    await page.click('button[type="submit"]');

    // Espera a ser redirigido
    await page.waitForURL("http://localhost:5173/scouts");

    // Verifica que estamos en la página de scouts
    expect(page.url()).toContain("/scouts");
  });

  test("Logout desconecta al usuario", async ({ page }) => {
    // Primero login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "juan@example.com");
    await page.fill('input[name="password"]', "SecurePass123");
    await page.click('button[type="submit"]');

    await page.waitForURL("http://localhost:5173/scouts");

    // Hace logout
    await page.click('button:has-text("Logout")');

    // Redirecciona a home
    await page.waitForURL("http://localhost:5173/");
    expect(page.url()).toBe("http://localhost:5173/");
  });
});
```

### Ejecutar E2E tests:

```bash
npx playwright test         # run all
npx playwright test --ui    # ui mode
npx playwright test --debug # debug mode
```

---

## 4. COVERAGE Y CALIDAD DE CÓDIGO

### ESLint:

```bash
npm install --save-dev eslint prettier eslint-config-prettier
```

### .eslintrc.json:

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### package.json scripts:

```json
{
  "scripts": {
    "lint": "eslint src --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "test": "jest --watch",
    "test:ci": "jest --coverage",
    "e2e": "playwright test"
  }
}
```

---

## 5. GITHUB ACTIONS CI/CD

### .github/workflows/test.yml:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:ci
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: test_db
          DB_USER: postgres
          DB_PASSWORD: postgres

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 6. MONITOREO EN PRODUCCIÓN

### Usar PM2:

```bash
npm install -g pm2
pm2 start src/index.js --name "scouts-api"
pm2 monit
pm2 logs
```

### Configurar PM2 (ecosystem.config.js):

```javascript
module.exports = {
  apps: [
    {
      name: "scouts-api",
      script: "./src/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
```

---

## 7. CHECKLIST DE TESTING

- [ ] Tests unitarios para utilidades
- [ ] Tests de controladores con mocks
- [ ] Tests de middlewares
- [ ] Tests de componentes React
- [ ] Tests E2E de flujos principales
- [ ] Coverage mínimo del 80%
- [ ] ESLint pass
- [ ] Prettier formatting
- [ ] CI/CD pipeline funcionando
- [ ] Monitoreo en producción configurado

---

## 🚀 PRÓXIMAS MEJORAS

1. Agregar Sentry para error tracking en producción
2. Implementar logs centralizados (ELK Stack)
3. Agregar performance monitoring
4. Configurar alertas automáticas
5. Automatizar releases con semantic versioning
