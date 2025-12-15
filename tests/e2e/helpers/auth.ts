import { Page, expect } from "@playwright/test";

/**
 * HELPERS DE TESTE - parceirosmeuagito.com
 * Funções reutilizáveis para login e navegação
 */

export const TEST_CREDENTIALS = {
  email: "parceiro@meuagito.com",
  password: "123456",
  pin: "0000",
};

export type TestRole = "admin" | "manager" | "cashier";

/**
 * Faz login completo (email + seleção de perfil + PIN)
 * @param page - Página do Playwright
 * @param role - Role a selecionar (admin, manager, cashier)
 */
export async function loginWithRole(
  page: Page,
  role: TestRole = "admin",
): Promise<void> {
  // Navegar para login se não estiver lá
  if (!page.url().includes("/login")) {
    await page.goto("/login");
  }
  await page.waitForLoadState("networkidle");

  // Preencher email e senha
  await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.password);

  // Clicar no botão de login
  await page.click('button[type="submit"]');

  // Aguardar página de seleção de perfil
  await page.waitForURL("**/select-profile", { timeout: 10000 });

  // Clicar no perfil desejado
  const roleLabels: Record<TestRole, string> = {
    admin: "Administrador",
    manager: "Gerente",
    cashier: "Caixa",
  };

  await page.click(`text=${roleLabels[role]}`);

  // Digitar PIN (0000)
  for (const digit of TEST_CREDENTIALS.pin) {
    await page.click(`button:has-text("${digit}")`);
  }

  // Clicar no botão de confirmar (seta)
  await page.click('button[type="submit"]');

  // Aguardar redirecionamento para dashboard
  await page.waitForURL("**/dashboard", { timeout: 10000 });

  // Verificar que está autenticado
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Faz login simples (apenas email/senha, vai até select-profile)
 * Útil para testes que querem testar o fluxo de seleção
 */
export async function loginToSelectProfile(page: Page): Promise<void> {
  if (!page.url().includes("/login")) {
    await page.goto("/login");
  }
  await page.waitForLoadState("networkidle");

  await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
  await page.click('button[type="submit"]');

  await page.waitForURL("**/select-profile", { timeout: 10000 });
}

/**
 * Limpa sessão completamente
 */
export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();

  // Limpar storage sem tentar navegar (que pode dar timeout)
  try {
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // localStorage pode não estar disponível em alguns contextos
      }
    });
  } catch (e) {
    // Se houver erro, apenas continuar (cookies já foram limpos)
  }
}

/**
 * Verifica se usuário está logado como determinado role
 */
export async function expectRole(page: Page, role: TestRole): Promise<void> {
  const roleLabels: Record<TestRole, string> = {
    admin: "Administrador",
    manager: "Gerente",
    cashier: "Caixa",
  };

  // Verificar na sidebar
  await expect(page.locator(`text=${roleLabels[role]}`)).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Navega para uma página do dashboard
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  const fullPath = path.startsWith("/") ? path : `/dashboard/${path}`;
  await page.goto(fullPath);
  await page.waitForLoadState("networkidle");
}
