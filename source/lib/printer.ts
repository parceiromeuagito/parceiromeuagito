import { Order, PrinterConfig, CashRegisterState } from "../types";
import { formatCurrency, formatDate } from "./utils";

// Re-exportar para facilitar importação
export type { PrinterConfig };

export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  printerName: "default",
  paperWidth: "80mm",
  fontSize: "medium",
  autoPrintOnAccept: false,
  copies: 1,
  showCustomerAddress: true,
  customHeader: "Meu Agito Parceiros",
  customFooter: "Obrigado pela preferência!",
};

// ... (manter printOrderReceipt existente) ...

export const printOrderReceipt = (order: Order, config: PrinterConfig) => {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Por favor, permita pop-ups para imprimir.");
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) => `
    <div class="item">
      <span class="qty">${item.quantity}x</span>
      <span class="name">${item.name}</span>
      <span class="price">${formatCurrency(item.price * item.quantity)}</span>
    </div>
    ${item.details ? `<div class="details">Obs: ${item.details}</div>` : ""}
  `,
    )
    .join("");

  const fontSize =
    config.fontSize === "small"
      ? "10px"
      : config.fontSize === "large"
        ? "14px"
        : "12px";

  const receiptContent = `
    <div class="receipt">
      <div class="header">
        <h1>${config.customHeader || "UniManager Store"}</h1>
        <p>CNPJ: 00.000.000/0000-00</p>
        <p>${formatDate(new Date())}</p>
        <div class="source-tag">
          ORIGEM: ${order.source === "counter" ? "BALCÃO" : order.source.toUpperCase()}
        </div>
      </div>

      <div class="info">
        <p><strong>Pedido: ${order.id}</strong></p>
        <p>Cliente: ${order.customerName}</p>
        ${config.showCustomerAddress ? `<p>Tel: ${order.customerContact}</p>` : ""}
        ${order.type === "hotel" ? `<p>Check-in: ${formatDate(new Date(order.checkIn!))}</p>` : ""}
        ${order.type === "reservation" ? `<p>Mesa/Pessoas: ${order.guests}</p>` : ""}
      </div>

      <div class="items">
        ${itemsHtml}
      </div>

      <div class="totals">
        <div class="total-row">TOTAL: ${formatCurrency(order.total)}</div>
        <p>Pagamento: ${order.paymentMethod === "credit_card" ? "Cartão Crédito" : order.paymentMethod}</p>
      </div>

      <div class="footer">
        <p>${config.customFooter || "Obrigado pela preferência!"}</p>
        <p>Sistema UniManager</p>
      </div>
    </div>
  `;

  const fullContent = Array(config.copies)
    .fill(receiptContent)
    .join('<div class="page-break"></div>');
  writeAndPrint(printWindow, fullContent, config.paperWidth, fontSize);
};

// --- NOVA FUNÇÃO: IMPRESSÃO DE FECHAMENTO DE CAIXA ---
export const printCashReport = (
  register: CashRegisterState,
  config: PrinterConfig,
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permita pop-ups para imprimir.");
    return;
  }

  const salesTotal = register.transactions
    .filter((t) => t.type === "sale")
    .reduce((acc, t) => acc + t.amount, 0);

  const supplyTotal = register.transactions
    .filter((t) => t.type === "supply")
    .reduce((acc, t) => acc + t.amount, 0);

  const bleedTotal = register.transactions
    .filter((t) => t.type === "bleed")
    .reduce((acc, t) => acc + t.amount, 0);

  const fontSize =
    config.fontSize === "small"
      ? "10px"
      : config.fontSize === "large"
        ? "14px"
        : "12px";

  const receiptContent = `
    <div class="receipt">
      <div class="header">
        <h1>FECHAMENTO DE CAIXA</h1>
        <p>${config.customHeader || "UniManager Store"}</p>
        <p>Data: ${formatDate(new Date())}</p>
      </div>

      <div class="info">
        <p>Operador: ${register.transactions[0]?.user || "Admin"}</p>
        <p>Abertura: ${register.openedAt ? formatDate(new Date(register.openedAt)) : "N/A"}</p>
        <p>Fechamento: ${register.closedAt ? formatDate(new Date(register.closedAt)) : "Em Aberto"}</p>
      </div>

      <div class="items">
        <div class="item">
          <span class="name">Fundo de Troco (+)</span>
          <span class="price">${formatCurrency(register.startAmount)}</span>
        </div>
        <div class="item">
          <span class="name">Vendas Dinheiro (+)</span>
          <span class="price">${formatCurrency(salesTotal)}</span>
        </div>
        <div class="item">
          <span class="name">Suprimentos (+)</span>
          <span class="price">${formatCurrency(supplyTotal)}</span>
        </div>
        <div class="item">
          <span class="name">Sangrias (-)</span>
          <span class="price text-red">-${formatCurrency(bleedTotal)}</span>
        </div>
      </div>

      <div class="totals">
        <div class="total-row">SALDO FINAL: ${formatCurrency(register.currentBalance)}</div>
      </div>

      <div class="footer">
        <p>Conferência do Gerente</p>
        <br/>
        <p>__________________________</p>
        <p>Assinatura</p>
      </div>
    </div>
  `;

  writeAndPrint(printWindow, receiptContent, config.paperWidth, fontSize);
};

// Helper interno para evitar duplicação de código HTML
const writeAndPrint = (
  win: Window,
  content: string,
  width: string,
  fontSize: string,
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Impressão Térmica</title>
      <style>
        @page { margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: ${width};
          margin: 0;
          padding: 5px;
          font-size: ${fontSize};
          color: #000;
        }
        .receipt { padding-bottom: 20px; margin-bottom: 10px; border-bottom: 1px dashed #ccc; }
        .page-break { page-break-after: always; height: 20px; display: block; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .header h1 { font-size: 1.2em; margin: 0; font-weight: bold; }
        .header p { margin: 2px 0; font-size: 0.9em; }
        .info { margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; }
        .info p { margin: 2px 0; }
        .items { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
        .item { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .name { flex: 1; margin-right: 5px; }
        .price { text-align: right; white-space: nowrap; }
        .totals { text-align: right; margin-bottom: 15px; }
        .total-row { font-size: 1.2em; font-weight: bold; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px;}
        .footer { text-align: center; font-size: 0.9em; margin-top: 20px; }
      </style>
    </head>
    <body>
      ${content}
      <script>
        window.onload = function() { window.print(); window.close(); }
      </script>
    </body>
    </html>
  `;
  win.document.write(htmlContent);
  win.document.close();
};
