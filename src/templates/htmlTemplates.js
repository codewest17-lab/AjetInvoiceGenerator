import { computeTotals } from "../utils/invoiceCalculations";
import { formatCurrency } from "../utils/currency";

function itemsRows(invoice) {
  return (invoice.items || [])
    .map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return `<tr>
        <td class="desc">${escapeHtml(item.description || "")}</td>
        <td class="num">${qty}</td>
        <td class="num">${formatCurrency(price, invoice.currency)}</td>
        <td class="num">${formatCurrency(qty * price, invoice.currency)}</td>
      </tr>`;
    })
    .join("");
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------- CLASSIC (free) ----------
function classic(invoice) {
  const { subtotal, discountAmount, taxAmount, total } = computeTotals(invoice);
  return baseDoc(`
    <style>
      body{font-family:Helvetica,Arial,sans-serif;color:#1A1D29;padding:40px;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2F6FED;padding-bottom:16px;}
      h1{color:#2F6FED;font-size:28px;margin:0;}
      .meta{text-align:right;font-size:12px;color:#555;}
      .parties{display:flex;justify-content:space-between;margin-top:24px;}
      .party h3{font-size:11px;text-transform:uppercase;color:#888;margin-bottom:4px;}
      table{width:100%;border-collapse:collapse;margin-top:28px;}
      th{background:#2F6FED;color:#fff;text-align:left;padding:8px;font-size:12px;}
      td{padding:8px;border-bottom:1px solid #eee;font-size:13px;}
      .num{text-align:right;}
      .totals{margin-top:16px;margin-left:auto;width:260px;}
      .totals div{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;}
      .grand{font-weight:bold;font-size:16px;border-top:2px solid #2F6FED;margin-top:6px;padding-top:8px;color:#2F6FED;}
      .notes{margin-top:32px;font-size:12px;color:#666;}
    </style>
    <div class="header">
      <h1>INVOICE</h1>
      <div class="meta">
        <div><b>#${escapeHtml(invoice.invoiceNumber)}</b></div>
        <div>Date: ${invoice.date}</div>
        <div>Due: ${invoice.dueDate}</div>
      </div>
    </div>
    <div class="parties">
      <div class="party"><h3>From</h3><div>${escapeHtml(invoice.from.name)}</div><div>${escapeHtml(invoice.from.email)}</div><div>${escapeHtml(invoice.from.address)}</div></div>
      <div class="party"><h3>Bill To</h3><div>${escapeHtml(invoice.to.name)}</div><div>${escapeHtml(invoice.to.email)}</div><div>${escapeHtml(invoice.to.address)}</div></div>
    </div>
    <table>
      <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
      <tbody>${itemsRows(invoice)}</tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${formatCurrency(subtotal, invoice.currency)}</span></div>
      <div><span>Discount</span><span>-${formatCurrency(discountAmount, invoice.currency)}</span></div>
      <div><span>Tax</span><span>${formatCurrency(taxAmount, invoice.currency)}</span></div>
      <div class="grand"><span>Total</span><span>${formatCurrency(total, invoice.currency)}</span></div>
    </div>
    <div class="notes">${escapeHtml(invoice.notes)}</div>
  `);
}

// ---------- MINIMAL (free) ----------
function minimal(invoice) {
  const { subtotal, discountAmount, taxAmount, total } = computeTotals(invoice);
  return baseDoc(`
    <style>
      body{font-family:'Courier New',monospace;color:#222;padding:44px;}
      h1{font-size:20px;letter-spacing:4px;margin:0 0 24px 0;}
      .row{display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px;}
      hr{border:none;border-top:1px dashed #999;margin:18px 0;}
      table{width:100%;border-collapse:collapse;}
      th{text-align:left;font-size:11px;text-transform:uppercase;padding:4px 0;border-bottom:1px solid #222;}
      td{padding:6px 0;font-size:12px;border-bottom:1px dotted #ccc;}
      .num{text-align:right;}
      .totals{margin-top:14px;width:240px;margin-left:auto;font-size:12px;}
      .totals div{display:flex;justify-content:space-between;padding:2px 0;}
      .grand{font-weight:bold;border-top:1px solid #222;padding-top:6px;margin-top:4px;}
      .notes{margin-top:28px;font-size:11px;color:#555;}
    </style>
    <h1>INVOICE</h1>
    <div class="row"><span>${escapeHtml(invoice.from.name)}</span><span>#${escapeHtml(invoice.invoiceNumber)}</span></div>
    <div class="row"><span>${escapeHtml(invoice.to.name)}</span><span>${invoice.date}</span></div>
    <hr/>
    <table>
      <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amt</th></tr></thead>
      <tbody>${itemsRows(invoice)}</tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${formatCurrency(subtotal, invoice.currency)}</span></div>
      <div><span>Discount</span><span>-${formatCurrency(discountAmount, invoice.currency)}</span></div>
      <div><span>Tax</span><span>${formatCurrency(taxAmount, invoice.currency)}</span></div>
      <div class="grand"><span>Total</span><span>${formatCurrency(total, invoice.currency)}</span></div>
    </div>
    <div class="notes">${escapeHtml(invoice.notes)}</div>
  `);
}

// ---------- MODERN (free) ----------
function modern(invoice) {
  const { subtotal, discountAmount, taxAmount, total } = computeTotals(invoice);
  return baseDoc(`
    <style>
      body{font-family:Helvetica,Arial,sans-serif;color:#1A1D29;padding:0;}
      .band{background:#00C2A8;color:#fff;padding:36px 40px;}
      .band h1{margin:0;font-size:26px;}
      .content{padding:32px 40px;}
      .parties{display:flex;justify-content:space-between;margin-bottom:24px;}
      .party h3{font-size:10px;text-transform:uppercase;color:#00C2A8;margin-bottom:4px;}
      table{width:100%;border-collapse:collapse;margin-top:8px;}
      th{text-align:left;padding:8px;font-size:11px;text-transform:uppercase;color:#00A38C;border-bottom:2px solid #00C2A8;}
      td{padding:9px 8px;font-size:13px;border-bottom:1px solid #eee;}
      .num{text-align:right;}
      .totals{margin-top:16px;margin-left:auto;width:260px;background:#F2FBFA;border-radius:8px;padding:14px;}
      .totals div{display:flex;justify-content:space-between;padding:3px 0;font-size:13px;}
      .grand{font-weight:bold;font-size:16px;color:#00A38C;border-top:1px solid #cdeee9;margin-top:6px;padding-top:8px;}
      .notes{margin-top:28px;font-size:12px;color:#666;}
    </style>
    <div class="band">
      <h1>Invoice ${escapeHtml(invoice.invoiceNumber)}</h1>
      <div style="font-size:12px;opacity:.9;">Issued ${invoice.date} &nbsp;·&nbsp; Due ${invoice.dueDate}</div>
    </div>
    <div class="content">
      <div class="parties">
        <div class="party"><h3>From</h3><div>${escapeHtml(invoice.from.name)}</div><div>${escapeHtml(invoice.from.email)}</div></div>
        <div class="party"><h3>To</h3><div>${escapeHtml(invoice.to.name)}</div><div>${escapeHtml(invoice.to.email)}</div></div>
      </div>
      <table>
        <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
        <tbody>${itemsRows(invoice)}</tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><span>${formatCurrency(subtotal, invoice.currency)}</span></div>
        <div><span>Discount</span><span>-${formatCurrency(discountAmount, invoice.currency)}</span></div>
        <div><span>Tax</span><span>${formatCurrency(taxAmount, invoice.currency)}</span></div>
        <div class="grand"><span>Total</span><span>${formatCurrency(total, invoice.currency)}</span></div>
      </div>
      <div class="notes">${escapeHtml(invoice.notes)}</div>
    </div>
  `);
}

// ---------- ELEGANT (premium) ----------
function elegant(invoice) {
  const { subtotal, discountAmount, taxAmount, total } = computeTotals(invoice);
  return baseDoc(`
    <style>
      body{font-family:Georgia,'Times New Roman',serif;color:#2A2A2A;padding:44px;}
      .header{text-align:center;border-bottom:1px solid #D8A537;padding-bottom:18px;margin-bottom:24px;}
      .header h1{letter-spacing:6px;font-size:22px;color:#B8912E;margin:0 0 6px 0;}
      .parties{display:flex;justify-content:space-between;font-size:12px;margin-bottom:24px;}
      .party h3{font-size:10px;letter-spacing:2px;color:#B8912E;margin-bottom:4px;}
      table{width:100%;border-collapse:collapse;}
      th{text-align:left;padding:10px 6px;font-size:11px;letter-spacing:1px;border-bottom:1px solid #D8A537;color:#8a6b1f;}
      td{padding:10px 6px;font-size:13px;border-bottom:1px solid #eee0bf;}
      .num{text-align:right;}
      .totals{margin-top:18px;width:260px;margin-left:auto;font-size:13px;}
      .totals div{display:flex;justify-content:space-between;padding:4px 0;}
      .grand{font-weight:bold;font-size:17px;color:#B8912E;border-top:1px solid #D8A537;margin-top:8px;padding-top:10px;}
      .notes{margin-top:30px;font-size:12px;color:#777;text-align:center;font-style:italic;}
      .badge{display:inline-block;font-size:10px;letter-spacing:2px;color:#B8912E;border:1px solid #D8A537;padding:4px 10px;border-radius:20px;margin-top:8px;}
    </style>
    <div class="header">
      <h1>INVOICE</h1>
      <div class="badge">#${escapeHtml(invoice.invoiceNumber)}</div>
    </div>
    <div class="parties">
      <div class="party"><h3>FROM</h3><div>${escapeHtml(invoice.from.name)}</div><div>${escapeHtml(invoice.from.address)}</div></div>
      <div class="party" style="text-align:right;"><h3>BILL TO</h3><div>${escapeHtml(invoice.to.name)}</div><div>${escapeHtml(invoice.to.address)}</div></div>
    </div>
    <table>
      <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
      <tbody>${itemsRows(invoice)}</tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${formatCurrency(subtotal, invoice.currency)}</span></div>
      <div><span>Discount</span><span>-${formatCurrency(discountAmount, invoice.currency)}</span></div>
      <div><span>Tax</span><span>${formatCurrency(taxAmount, invoice.currency)}</span></div>
      <div class="grand"><span>Total</span><span>${formatCurrency(total, invoice.currency)}</span></div>
    </div>
    <div class="notes">${escapeHtml(invoice.notes)}</div>
  `);
}

// ---------- BOLD (premium) ----------
function bold(invoice) {
  const { subtotal, discountAmount, taxAmount, total } = computeTotals(invoice);
  return baseDoc(`
    <style>
      body{font-family:Helvetica,Arial,sans-serif;color:#fff;background:#12141C;padding:0;}
      .header{background:#1E4FBB;padding:40px;}
      .header h1{font-size:32px;margin:0;letter-spacing:1px;}
      .content{padding:32px 40px;background:#fff;color:#1A1D29;}
      .parties{display:flex;justify-content:space-between;margin-bottom:24px;font-size:12px;}
      .party h3{font-size:10px;text-transform:uppercase;color:#1E4FBB;margin-bottom:4px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#12141C;color:#fff;text-align:left;padding:10px 8px;font-size:11px;text-transform:uppercase;}
      td{padding:10px 8px;font-size:13px;border-bottom:1px solid #eee;}
      .num{text-align:right;}
      .totals{margin-top:18px;width:260px;margin-left:auto;background:#12141C;color:#fff;border-radius:8px;padding:14px;}
      .totals div{display:flex;justify-content:space-between;padding:3px 0;font-size:13px;}
      .grand{font-weight:bold;font-size:17px;border-top:1px solid #444;margin-top:6px;padding-top:8px;color:#5C8AFF;}
      .notes{margin-top:28px;font-size:12px;color:#666;}
    </style>
    <div class="header"><h1>INVOICE</h1><div style="opacity:.85;font-size:13px;">#${escapeHtml(invoice.invoiceNumber)} &nbsp;·&nbsp; Due ${invoice.dueDate}</div></div>
    <div class="content">
      <div class="parties">
        <div class="party"><h3>From</h3><div>${escapeHtml(invoice.from.name)}</div></div>
        <div class="party"><h3>To</h3><div>${escapeHtml(invoice.to.name)}</div></div>
      </div>
      <table>
        <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
        <tbody>${itemsRows(invoice)}</tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><span>${formatCurrency(subtotal, invoice.currency)}</span></div>
        <div><span>Discount</span><span>-${formatCurrency(discountAmount, invoice.currency)}</span></div>
        <div><span>Tax</span><span>${formatCurrency(taxAmount, invoice.currency)}</span></div>
        <div class="grand"><span>Total</span><span>${formatCurrency(total, invoice.currency)}</span></div>
      </div>
      <div class="notes">${escapeHtml(invoice.notes)}</div>
    </div>
  `);
}

// ---------- CORPORATE (premium) ----------
function corporate(invoice) {
  const { subtotal, discountAmount, taxAmount, total } = computeTotals(invoice);
  return baseDoc(`
    <style>
      body{font-family:Helvetica,Arial,sans-serif;color:#1A1D29;padding:40px;}
      .header{display:flex;justify-content:space-between;border-left:6px solid #2F6FED;padding-left:16px;}
      h1{margin:0;font-size:24px;}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px;background:#F5F7FB;padding:16px;border-radius:6px;}
      .grid h3{font-size:10px;text-transform:uppercase;color:#888;margin-bottom:4px;}
      table{width:100%;border-collapse:collapse;margin-top:24px;}
      th{border-bottom:2px solid #1A1D29;text-align:left;padding:8px;font-size:11px;text-transform:uppercase;}
      td{padding:9px 8px;font-size:13px;border-bottom:1px solid #eee;}
      .num{text-align:right;}
      .totals{margin-top:16px;width:280px;margin-left:auto;}
      .totals div{display:flex;justify-content:space-between;padding:4px 8px;font-size:13px;}
      .grand{font-weight:bold;font-size:16px;background:#1A1D29;color:#fff;border-radius:4px;padding:10px 8px !important;margin-top:6px;}
      .notes{margin-top:30px;font-size:12px;color:#666;border-top:1px solid #eee;padding-top:12px;}
    </style>
    <div class="header"><div><h1>INVOICE</h1><div style="font-size:12px;color:#888;">#${escapeHtml(invoice.invoiceNumber)}</div></div>
      <div style="text-align:right;font-size:12px;color:#888;">Date: ${invoice.date}<br/>Due: ${invoice.dueDate}</div>
    </div>
    <div class="grid">
      <div><h3>From</h3><div>${escapeHtml(invoice.from.name)}</div><div>${escapeHtml(invoice.from.address)}</div><div>${escapeHtml(invoice.from.phone)}</div></div>
      <div><h3>Bill To</h3><div>${escapeHtml(invoice.to.name)}</div><div>${escapeHtml(invoice.to.address)}</div><div>${escapeHtml(invoice.to.phone)}</div></div>
    </div>
    <table>
      <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
      <tbody>${itemsRows(invoice)}</tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${formatCurrency(subtotal, invoice.currency)}</span></div>
      <div><span>Discount</span><span>-${formatCurrency(discountAmount, invoice.currency)}</span></div>
      <div><span>Tax</span><span>${formatCurrency(taxAmount, invoice.currency)}</span></div>
      <div class="grand"><span>Total Due</span><span>${formatCurrency(total, invoice.currency)}</span></div>
    </div>
    <div class="notes">${escapeHtml(invoice.notes)}</div>
  `);
}

function baseDoc(bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>${bodyHtml}</body></html>`;
}

export const TEMPLATE_RENDERERS = {
  classic,
  minimal,
  modern,
  elegant,
  bold,
  corporate,
};

export function renderInvoiceHtml(invoice) {
  const renderer = TEMPLATE_RENDERERS[invoice.templateId] || classic;
  return renderer(invoice);
}
