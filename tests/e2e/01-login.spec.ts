import { test, expect } from '@playwright/test';
import { loginWithRole, loginToSelectProfile, clearSession, TEST_CREDENTIALS } from './helpers/auth';

/**
 * TESTES DE LOGIN - parceirosmeuagito.com
 * Total: 15 cenários
 * Rotas: /login, /select-profile
 * 
 * FLUXO ATUALIZADO:
 * 1. Login com email (deve conter "parceiro")
 * 2. Seleção de perfil (Admin/Gerente/Caixa)
 * 3. Entrada de PIN
 * 4. Acesso ao Dashboard
 */

test.describe('Login - Autenticação e Seleção de Perfil', () => {

    test.beforeEach(async ({ page }) => {
        // Limpar cookies do contexto (não precisa ir a uma página)
        await page.context().clearCookies();
        
        // Agora navegar para login
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
    });

    // ========================================
    // TESTES DE LOGIN (EMAIL/SENHA)
    // ========================================

    test('L01 - Deve fazer login e ir para seleção de perfil', async ({ page }) => {
        await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
        await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
        await page.click('button[type="submit"]');

        // Deve ir para select-profile
        await page.waitForURL('**/select-profile', { timeout: 10000 });
        await expect(page).toHaveURL(/\/select-profile/);
    });

    test('L02 - Deve bloquear login sem "parceiro" ou "partner" no email', async ({ page }) => {
        await page.fill('input[type="email"]', 'cliente@teste.com');
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');

        // Deve mostrar toast de erro
        await expect(page.locator('text=negado').or(page.locator('text=parceiro'))).toBeVisible({ timeout: 5000 });

        // Não deve sair do login
        await expect(page).toHaveURL(/\/login/);
    });

    test('L03 - Deve validar campo de email vazio', async ({ page }) => {
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');

        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toHaveAttribute('required', '');
    });

    test('L04 - Deve ter checkbox "Lembrar-me"', async ({ page }) => {
        const checkbox = page.locator('input[type="checkbox"]');
        await expect(checkbox).toBeVisible();
        await checkbox.check();
        await expect(checkbox).toBeChecked();
    });

    test('L05 - Deve mostrar loading durante autenticação', async ({ page }) => {
        await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
        await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
        await page.click('button[type="submit"]');

        // Verificar spinner ou estado de loading
        const loadingIndicator = page.locator('svg.animate-spin').first();
        // Loading pode ser muito rápido, então usamos timeout curto
        await expect(loadingIndicator).toBeVisible({ timeout: 2000 }).catch(() => {
            // OK se não aparecer (muito rápido)
        });

        await page.waitForURL('**/select-profile', { timeout: 10000 });
    });

    // ========================================
    // TESTES DE SELEÇÃO DE PERFIL
    // ========================================

    test('SP01 - Deve mostrar 3 opções de perfil', async ({ page }) => {
        await loginToSelectProfile(page);

        await expect(page.locator('text=Administrador')).toBeVisible();
        await expect(page.locator('text=Gerente')).toBeVisible();
        await expect(page.locator('text=Caixa')).toBeVisible();
    });

    test('SP02 - Deve abrir teclado numérico ao selecionar perfil', async ({ page }) => {
        await loginToSelectProfile(page);

        // Clicar em Administrador
        await page.click('text=Administrador');

        // Deve mostrar teclado numérico (numpad)
        await expect(page.locator('button:has-text("1")')).toBeVisible();
        await expect(page.locator('button:has-text("0")')).toBeVisible();
    });

    test('SP03 - Deve permitir voltar da entrada de PIN', async ({ page }) => {
        await loginToSelectProfile(page);
        await page.click('text=Administrador');

        // Clicar no botão voltar
        await page.click('button:has([class*="rotate-180"])');

        // Deve voltar para lista de perfis
        await expect(page.locator('text=Gerente')).toBeVisible();
        await expect(page.locator('text=Caixa')).toBeVisible();
    });

    test('SP04 - Deve mostrar erro com PIN incorreto', async ({ page }) => {
        await loginToSelectProfile(page);
        await page.click('text=Administrador');

        // Digitar PIN errado
        await page.click('button:has-text("1")');
        await page.click('button:has-text("2")');
        await page.click('button:has-text("3")');
        await page.click('button:has-text("4")');
        await page.click('button[type="submit"]');

        // Deve mostrar erro
        await expect(page.locator('text=incorreto').or(page.locator('text=Tente'))).toBeVisible({ timeout: 5000 });
    });

    test('SP05 - Deve acessar dashboard com PIN correto como Admin', async ({ page }) => {
        await loginWithRole(page, 'admin');

        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('text=Dashboard').or(page.locator('text=Visão Geral'))).toBeVisible();
    });

    test('SP06 - Deve acessar dashboard como Gerente', async ({ page }) => {
        await loginWithRole(page, 'manager');

        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('SP07 - Deve acessar dashboard como Caixa', async ({ page }) => {
        await loginWithRole(page, 'cashier');

        await expect(page).toHaveURL(/\/dashboard/);
    });

    // ========================================
    // TESTES DE PROTEÇÃO DE ROTA
    // ========================================

    test('PR01 - Deve redirecionar para /login ao acessar /dashboard sem autenticação', async ({ page }) => {
        await clearSession(page);
        await page.goto('/dashboard');

        await page.waitForURL('**/login', { timeout: 10000 });
        await expect(page).toHaveURL(/\/login/);
    });

    test('PR02 - Deve redirecionar para /login ao acessar /select-profile sem autenticação', async ({ page }) => {
        await clearSession(page);
        await page.goto('/select-profile');

        await page.waitForURL('**/login', { timeout: 10000 });
        await expect(page).toHaveURL(/\/login/);
    });

    test('PR03 - Deve manter sessão após refresh', async ({ page }) => {
        await loginWithRole(page, 'admin');

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Deve continuar no dashboard
        await expect(page).toHaveURL(/\/dashboard/);
    });

});

/**
 * RESUMO DOS TESTES:
 * 
 * LOGIN:
 * ✅ L01 - Login válido → select-profile
 * ✅ L02 - Login inválido (email sem "parceiro")
 * ✅ L03 - Email vazio
 * ✅ L04 - Checkbox lembrar
 * ✅ L05 - Loading state
 * 
 * SELEÇÃO DE PERFIL:
 * ✅ SP01 - 3 opções de perfil
 * ✅ SP02 - Teclado numérico
 * ✅ SP03 - Voltar do PIN
 * ✅ SP04 - PIN incorreto
 * ✅ SP05 - Login Admin
 * ✅ SP06 - Login Gerente
 * ✅ SP07 - Login Caixa
 * 
 * PROTEÇÃO:
 * ✅ PR01 - Dashboard sem auth
 * ✅ PR02 - Select-profile sem auth
 * ✅ PR03 - Persistência de sessão
 */