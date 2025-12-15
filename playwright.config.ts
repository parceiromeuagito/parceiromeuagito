import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração Playwright - parceirosmeuagito.com
 * Este arquivo NÃO modifica nada do seu projeto original
 */
export default defineConfig({
  // Pasta onde ficam os testes
  testDir: "./tests/e2e",

  // Timeout por teste (30 segundos)
  timeout: 30000,

  // Roda testes em paralelo (mais rápido)
  fullyParallel: true,

  // Quantas vezes tentar novamente se falhar
  retries: 2,

  // Quantos testes rodar ao mesmo tempo
  workers: 4,

  // Onde salvar os relatórios
  reporter: [["html", { outputFolder: "test-results" }], ["list"]],

  // Configurações globais
  use: {
    // URL do seu projeto local
    baseURL: "http://localhost:5173",

    // Gravar vídeo apenas se falhar
    video: "retain-on-failure",

    // Screenshot apenas se falhar
    screenshot: "only-on-failure",

    // Tamanho da tela
    viewport: { width: 1280, height: 720 },

    // Idioma BR
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  },

  // Navegadores para testar
  projects: [
    {
      name: "Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  // Inicia seu servidor Vite automaticamente
  webServer: {
    command: '"C:\\Program Files\\nodejs\\npm.cmd" run dev',
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
