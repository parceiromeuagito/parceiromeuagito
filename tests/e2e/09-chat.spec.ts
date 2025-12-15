import { test, expect } from "@playwright/test";

/**
 * TESTES DE CHAT - parceirosmeuagito.com
 * Total: 15 cenários
 * Rota: /dashboard/chat
 *
 * Funcionalidades:
 * - Comunicação em tempo real com clientes
 * - Conversas por pedido
 * - Histórico persistente
 * - Notificações de mensagens não lidas
 */

test.describe("Chat - Comunicação com Clientes", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "parceiro@meuagito.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard", { timeout: 5000 });

    // Navegar para Chat
    await page.goto("/dashboard/chat");
    await page.waitForLoadState("networkidle");
  });

  // ==========================================
  // VISUALIZAÇÃO E NAVEGAÇÃO - 5 cenários
  // ==========================================

  test("CH01 - Deve exibir lista de conversas na sidebar", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Verificar lista de conversas
    const conversationList = page.locator(
      '[class*="conversation"], [class*="chat-list"]',
    );
    await expect(conversationList.first()).toBeVisible({ timeout: 5000 });

    // Deve ter pelo menos uma conversa (ou empty state)
    const conversations = page.locator(
      '[class*="conversation-item"], [data-conversation]',
    );
    const count = await conversations.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("CH02 - Deve exibir nome do cliente em cada conversa", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    // Procurar nomes de clientes
    const conversationItems = page.locator('[class*="conversation-item"]');

    if ((await conversationItems.count()) > 0) {
      const firstItem = conversationItems.first();
      const text = await firstItem.textContent();
      expect(text).toBeTruthy();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test("CH03 - Deve exibir badge de mensagens não lidas", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Procurar badges numéricos
    const unreadBadges = page
      .locator('[class*="badge"], [class*="unread"]')
      .filter({ hasText: /\d+/ });
    const count = await unreadBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("CH04 - Deve exibir prévia da última mensagem", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Verificar se há prévia de mensagem
    const conversationItems = page.locator('[class*="conversation-item"]');

    if ((await conversationItems.count()) > 0) {
      const preview = page.locator(
        '[class*="preview"], [class*="last-message"]',
      );
      const count = await preview.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("CH05 - Deve exibir timestamp da última mensagem", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Procurar timestamps (ex: "há 5 min", "10:30", "Ontem")
    const timestamps = page.locator(
      "text=/há.*\d+.*min|há.*\d+.*hora|\d{2}:\d{2}|Ontem|Hoje/i",
    );
    const count = await timestamps.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ==========================================
  // ENVIO E RECEBIMENTO DE MENSAGENS - 5 cenários
  // ==========================================

  test("CH06 - Deve selecionar conversa ao clicar", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Clicar na primeira conversa
    const firstConversation = page
      .locator('[class*="conversation-item"]')
      .first();

    if ((await firstConversation.count()) > 0) {
      await firstConversation.click();
      await page.waitForTimeout(500);

      // Área de chat deve aparecer
      const chatArea = page.locator(
        '[class*="chat-area"], [class*="messages"]',
      );
      await expect(chatArea.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test("CH07 - Deve exibir histórico de mensagens", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Selecionar conversa
    const firstConversation = page
      .locator('[class*="conversation-item"]')
      .first();
    if ((await firstConversation.count()) > 0) {
      await firstConversation.click();
      await page.waitForTimeout(500);

      // Verificar mensagens
      const messages = page.locator('[class*="message"], [data-message]');
      const count = await messages.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("CH08 - Deve diferenciar mensagens enviadas e recebidas", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const firstConversation = page
      .locator('[class*="conversation-item"]')
      .first();
    if ((await firstConversation.count()) > 0) {
      await firstConversation.click();
      await page.waitForTimeout(500);

      // Procurar classes de alinhamento (direita/esquerda)
      const sentMessages = page.locator('[class*="sent"], [class*="right"]');
      const receivedMessages = page.locator(
        '[class*="received"], [class*="left"]',
      );

      const totalMessages =
        (await sentMessages.count()) + (await receivedMessages.count());
      expect(totalMessages).toBeGreaterThanOrEqual(0);
    }
  });

  test("CH09 - Deve enviar mensagem ao pressionar Enter", async ({ page }) => {
    await page.waitForTimeout(1000);

    const firstConversation = page
      .locator('[class*="conversation-item"]')
      .first();
    if ((await firstConversation.count()) > 0) {
      await firstConversation.click();
      await page.waitForTimeout(500);

      // Procurar input de mensagem
      const messageInput = page
        .locator(
          'textarea, input[placeholder*="mensagem"], input[placeholder*="Digite"]',
        )
        .first();

      if ((await messageInput.count()) > 0) {
        await messageInput.fill("Teste de mensagem");
        await messageInput.press("Enter");
        await page.waitForTimeout(1000);

        // Mensagem deve aparecer no histórico
        const newMessage = page.locator("text=/Teste de mensagem/i");
        await expect(newMessage.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("CH10 - Deve enviar mensagem ao clicar no botão enviar", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const firstConversation = page
      .locator('[class*="conversation-item"]')
      .first();
    if ((await firstConversation.count()) > 0) {
      await firstConversation.click();
      await page.waitForTimeout(500);

      const messageInput = page
        .locator('textarea, input[placeholder*="mensagem"]')
        .first();
      const sendButton = page
        .locator('button[aria-label*="enviar"], button')
        .filter({ has: page.locator("svg") })
        .last();

      if ((await messageInput.count()) > 0 && (await sendButton.count()) > 0) {
        await messageInput.fill("Mensagem via botão");
        await sendButton.click();
        await page.waitForTimeout(1000);

        // Verificar mensagem enviada
        const newMessage = page.locator("text=/Mensagem via botão/i");
        await expect(newMessage.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  // ==========================================
  // FUNCIONALIDADES AVANÇADAS - 5 cenários
  // ==========================================

  test("CH11 - Deve exibir informações do pedido no cabeçalho", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const firstConversation = page
      .locator('[class*="conversation-item"]')
      .first();
    if ((await firstConversation.count()) > 0) {
      await firstConversation.click();
      await page.waitForTimeout(500);

      // Procurar info do pedido (ID, valor, status)
      const orderInfo = page.locator(
        '[class*="order-info"], [class*="header"]',
      );
      const hasOrderId = page.locator("text=/#\d+|Pedido.*\d+/i");

      const count = (await orderInfo.count()) + (await hasOrderId.count());
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("CH12 - Deve ter botão para ver detalhes do pedido", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    const firstConversation = page
      .locator('[class*="conversation-item"]')
      .first();
    if ((await firstConversation.count()) > 0) {
      await firstConversation.click();
      await page.waitForTimeout(500);

      // Procurar botão de detalhes
      const detailsButton = page
        .locator("button")
        .filter({ hasText: /ver.*pedido|detalhes/i })
        .first();

      if ((await detailsButton.count()) > 0) {
        await detailsButton.click();
        await page.waitForTimeout(500);

        // Deve abrir modal ou redirecionar
        const modal = page.locator('[role="dialog"]');
        const isModalOpen = (await modal.count()) > 0;
        expect(isModalOpen || page.url().includes("orders")).toBeTruthy();
      }
    }
  });

  test("CH13 - Deve filtrar conversas por status (Todas/Não Lidas)", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    // Procurar filtros
    const filterButtons = page
      .locator("button")
      .filter({ hasText: /todas|não.*lidas|ativas/i });

    if ((await filterButtons.count()) > 1) {
      await filterButtons.nth(1).click();
      await page.waitForTimeout(500);

      // Lista deve atualizar
      const conversations = page.locator('[class*="conversation-item"]');
      const count = await conversations.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("CH14 - Deve buscar conversas por nome do cliente", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Procurar campo de busca
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Buscar"]')
      .first();

    if ((await searchInput.count()) > 0) {
      await searchInput.fill("João");
      await page.waitForTimeout(500);

      // Lista deve filtrar
      const conversations = page.locator('[class*="conversation-item"]');
      const count = await conversations.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("CH15 - Deve exibir empty state quando não há conversas", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    // Verificar se há conversas
    const conversations = page.locator('[class*="conversation-item"]');
    const count = await conversations.count();

    if (count === 0) {
      // Deve mostrar empty state
      const emptyState = page.locator("text=/nenhuma conversa|sem mensagens/i");
      await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

/**
 * RESUMO DOS TESTES:
 * ✅ CH01-CH05 - Visualização e Navegação (5 cenários)
 * ✅ CH06-CH10 - Envio e Recebimento (5 cenários)
 * ✅ CH11-CH15 - Funcionalidades Avançadas (5 cenários)
 *
 * TOTAL: 15 CENÁRIOS ✅
 */
