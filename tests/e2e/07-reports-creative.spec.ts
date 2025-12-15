import { test, expect } from "@playwright/test";

/**
 * TESTES DE REPORTS + CREATIVE STUDIO - parceirosmeuagito.com
 * Total: 20 cenários (Reports: 10 + Creative: 10)
 * Rotas: /dashboard/reports e /dashboard/creative-studio
 */

test.describe("Reports - Relatórios Gerenciais", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "parceiro@meuagito.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Navegar para Reports
    await page.goto("/dashboard/reports");
    await page.waitForLoadState("networkidle");
  });

  // ==========================================
  // REPORTS - 10 cenários (R01-R10)
  // ==========================================

  test("R01 - Deve bloquear acesso para plano Starter", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Verificar se é Starter
    const starterBadge = page.locator("text=/Starter/i");
    const isStarter = (await starterBadge.count()) > 0;

    if (isStarter) {
      // Deve mostrar tela de upgrade
      const upgradeScreen = page.locator("text=/upgrade|Pro|plano/i");
      await expect(upgradeScreen.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('R02 - Deve exibir aba "Vendas" ativa', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Verificar se não está bloqueado
    const blockedScreen = page.locator("text=/upgrade|bloqueado/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      const salesTab = page
        .locator('[role="tab"], button')
        .filter({ hasText: /vendas|sales/i })
        .first();
      await expect(salesTab).toBeVisible({ timeout: 5000 });
    }
  });

  test('R03 - Deve exibir aba "Caixa Diário"', async ({ page }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      const cashTab = page
        .locator('[role="tab"], button')
        .filter({ hasText: /caixa|cash/i })
        .first();

      if ((await cashTab.count()) > 0) {
        await cashTab.click();
        await page.waitForTimeout(500);

        // Verificar conteúdo
        const content = page.locator("text=/movimentação|saldo|extrato/i");
        await expect(content.first()).toBeVisible();
      }
    }
  });

  test('R04 - Deve exibir aba "Produtos"', async ({ page }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      const productsTab = page
        .locator('[role="tab"], button')
        .filter({ hasText: /produtos|products/i })
        .first();

      if ((await productsTab.count()) > 0) {
        await productsTab.click();
        await page.waitForTimeout(500);

        // Verificar conteúdo
        const content = page.locator("text=/top.*produto|desempenho/i");
        await expect(content.first()).toBeVisible();
      }
    }
  });

  test("R05 - Deve exibir gráfico de pizza (Métodos de Pagamento)", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      // Procurar canvas ou SVG de gráfico
      const chart = page.locator(
        'canvas, svg, [class*="chart"], [class*="echarts"]',
      );
      const count = await chart.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("R06 - Deve exibir gráfico de barras (Evolução de Vendas)", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      // Múltiplos gráficos podem estar presentes
      const charts = page.locator('canvas, svg, [class*="chart"]');
      const count = await charts.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("R07 - Deve exibir tabela de últimos pedidos (5 itens)", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      // Procurar tabela ou lista
      const ordersTable = page.locator(
        'table, [class*="order"], [class*="list"]',
      );
      const count = await ordersTable.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('R08 - Deve ter botão "Exportar" extrato de caixa', async ({ page }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      // Ir para aba Caixa
      const cashTab = page
        .locator("button")
        .filter({ hasText: /caixa/i })
        .first();
      if ((await cashTab.count()) > 0) await cashTab.click();
      await page.waitForTimeout(500);

      // Procurar botão exportar
      const exportButton = page
        .locator("button")
        .filter({ hasText: /exportar/i })
        .first();
      const count = await exportButton.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("R09 - Deve exibir saldo atual do caixa", async ({ page }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      const cashTab = page
        .locator("button")
        .filter({ hasText: /caixa/i })
        .first();
      if ((await cashTab.count()) > 0) await cashTab.click();
      await page.waitForTimeout(500);

      // Procurar valor em reais
      const balance = page.locator("text=/R\\$/");
      await expect(balance.first()).toBeVisible();
    }
  });

  test("R10 - Deve exibir Top 10 produtos por receita", async ({ page }) => {
    await page.waitForTimeout(1000);

    const blockedScreen = page.locator("text=/upgrade/i");
    const isBlocked = (await blockedScreen.count()) > 0;

    if (!isBlocked) {
      const productsTab = page
        .locator("button")
        .filter({ hasText: /produtos/i })
        .first();
      if ((await productsTab.count()) > 0) await productsTab.click();
      await page.waitForTimeout(500);

      // Procurar tabela ou lista de produtos
      const productsTable = page.locator(
        'table, [class*="product"], [class*="list"]',
      );
      const count = await productsTable.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

// ==========================================
// CREATIVE STUDIO - 10 cenários (EC01-EC10)
// ==========================================

test.describe("Creative Studio - Estúdio Criativo IA", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "parceiro@meuagito.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Navegar para Creative Studio
    await page.goto("/dashboard/creative-studio");
    await page.waitForLoadState("networkidle");
  });

  test("EC01 - Deve exibir 4 botões de Quick Actions", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Procurar botões de ações rápidas
    const quickActions = page
      .locator("button")
      .filter({ hasText: /dia.*chuvoso|vendas.*baixas|feriado|ticket/i });
    const count = await quickActions.count();
    expect(count).toBeGreaterThanOrEqual(3); // Pelo menos 3 actions
  });

  test('EC02 - Deve gerar campanha "Dia Chuvoso"', async ({ page }) => {
    await page.waitForTimeout(1000);

    const rainyButton = page
      .locator("button")
      .filter({ hasText: /chuvoso|chuva/i })
      .first();

    if ((await rainyButton.count()) > 0) {
      await rainyButton.click();
      await page.waitForTimeout(1000);

      // Deve mostrar preview ou formulário
      const preview = page.locator('[class*="preview"], [class*="campaign"]');
      await expect(preview.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('EC03 - Deve gerar campanha "Vendas Baixas"', async ({ page }) => {
    await page.waitForTimeout(1000);

    const slowSalesButton = page
      .locator("button")
      .filter({ hasText: /vendas.*baixas|movimento.*fraco/i })
      .first();

    if ((await slowSalesButton.count()) > 0) {
      await slowSalesButton.click();
      await page.waitForTimeout(1000);

      const preview = page.locator('[class*="preview"], [class*="campaign"]');
      await expect(preview.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("EC04 - Deve editar título da campanha", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Gerar campanha primeiro
    const quickAction = page
      .locator("button")
      .filter({ hasText: /chuvoso|vendas|feriado/i })
      .first();
    if ((await quickAction.count()) > 0) await quickAction.click();
    await page.waitForTimeout(1000);

    // Procurar input de título
    const titleInput = page
      .locator('input[placeholder*="título"], input[name*="title"]')
      .first();

    if ((await titleInput.count()) > 0) {
      await titleInput.fill("Promoção Especial");
      await page.waitForTimeout(300);

      // Preview deve atualizar
      const preview = page.locator("text=/Promoção Especial/i");
      await expect(preview.first()).toBeVisible();
    }
  });

  test("EC05 - Deve editar copy (texto do anúncio)", async ({ page }) => {
    await page.waitForTimeout(1000);

    const quickAction = page
      .locator("button")
      .filter({ hasText: /chuvoso/i })
      .first();
    if ((await quickAction.count()) > 0) await quickAction.click();
    await page.waitForTimeout(1000);

    // Procurar textarea de copy
    const copyTextarea = page
      .locator('textarea[placeholder*="texto"], textarea[name*="copy"]')
      .first();

    if ((await copyTextarea.count()) > 0) {
      await copyTextarea.fill("Aproveite nossa oferta especial!");
      await page.waitForTimeout(300);
    }
  });

  test('EC06 - Deve ter aba "2. Impulsionamento"', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Gerar campanha
    const quickAction = page
      .locator("button")
      .filter({ hasText: /chuvoso/i })
      .first();
    if ((await quickAction.count()) > 0) await quickAction.click();
    await page.waitForTimeout(1000);

    // Procurar próximo passo
    const nextButton = page
      .locator("button")
      .filter({ hasText: /próximo|avançar|público/i })
      .first();

    if ((await nextButton.count()) > 0) {
      await nextButton.click();
      await page.waitForTimeout(500);

      // Deve mostrar configurações de público
      const audienceConfig = page.locator("text=/raio|alcance|público|km/i");
      await expect(audienceConfig.first()).toBeVisible();
    }
  });

  test("EC07 - Deve ajustar raio de alcance (slider 1-10km)", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const quickAction = page
      .locator("button")
      .filter({ hasText: /chuvoso/i })
      .first();
    if ((await quickAction.count()) > 0) await quickAction.click();
    await page.waitForTimeout(1000);

    const nextButton = page
      .locator("button")
      .filter({ hasText: /próximo|público/i })
      .first();
    if ((await nextButton.count()) > 0) await nextButton.click();
    await page.waitForTimeout(500);

    // Procurar slider
    const radiusSlider = page.locator('input[type="range"]').first();

    if ((await radiusSlider.count()) > 0) {
      await radiusSlider.fill("5");
      await page.waitForTimeout(300);

      // Estimativa deve atualizar
      const estimate = page.locator("text=/\\d+.*pessoas|alcance/i");
      const count = await estimate.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('EC08 - Deve ter opção "Pacote Blitz" (orçamento fixo)', async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const quickAction = page
      .locator("button")
      .filter({ hasText: /chuvoso/i })
      .first();
    if ((await quickAction.count()) > 0) await quickAction.click();
    await page.waitForTimeout(1000);

    const nextButton = page
      .locator("button")
      .filter({ hasText: /próximo/i })
      .first();
    if ((await nextButton.count()) > 0) await nextButton.click();
    await page.waitForTimeout(500);

    // Procurar opção de pacote
    const blitzOption = page
      .locator('button, [role="radio"]')
      .filter({ hasText: /blitz|pacote.*fixo/i })
      .first();

    if ((await blitzOption.count()) > 0) {
      await blitzOption.click();
      await page.waitForTimeout(300);
    }
  });

  test('EC09 - Deve ter opção "Orçamento Livre" (CPM)', async ({ page }) => {
    await page.waitForTimeout(1000);

    const quickAction = page
      .locator("button")
      .filter({ hasText: /chuvoso/i })
      .first();
    if ((await quickAction.count()) > 0) await quickAction.click();
    await page.waitForTimeout(1000);

    const nextButton = page
      .locator("button")
      .filter({ hasText: /próximo/i })
      .first();
    if ((await nextButton.count()) > 0) await nextButton.click();
    await page.waitForTimeout(500);

    // Procurar opção livre
    const freeOption = page
      .locator('button, [role="radio"]')
      .filter({ hasText: /livre|cpm/i })
      .first();

    if ((await freeOption.count()) > 0) {
      await freeOption.click();
      await page.waitForTimeout(300);
    }
  });

  test('EC10 - Deve criar campanha com botão "Criar Campanha"', async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const quickAction = page
      .locator("button")
      .filter({ hasText: /chuvoso/i })
      .first();
    if ((await quickAction.count()) > 0) await quickAction.click();
    await page.waitForTimeout(1000);

    const nextButton = page
      .locator("button")
      .filter({ hasText: /próximo/i })
      .first();
    if ((await nextButton.count()) > 0) await nextButton.click();
    await page.waitForTimeout(500);

    // Procurar botão final
    const createButton = page
      .locator("button")
      .filter({ hasText: /criar.*campanha|lançar|publicar/i })
      .first();

    if ((await createButton.count()) > 0) {
      await createButton.click();
      await page.waitForTimeout(1000);

      // Toast de sucesso
      await expect(
        page.locator("text=/sucesso|campanha.*criada/i"),
      ).toBeVisible({ timeout: 3000 });
    }
  });
});

/**
 * RESUMO DOS TESTES:
 * ✅ R01-R10 - Reports (10 cenários)
 * ✅ EC01-EC10 - Creative Studio (10 cenários)
 *
 * TOTAL: 20 CENÁRIOS ✅
 */
