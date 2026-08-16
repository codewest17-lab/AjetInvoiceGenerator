import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { renderInvoiceHtml } from "../templates/htmlTemplates";

export async function generateInvoicePdf(invoice) {
  const html = renderInvoiceHtml(invoice);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

export async function shareInvoicePdf(invoice) {
  const uri = await generateInvoicePdf(invoice);
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Invoice ${invoice.invoiceNumber}`,
      UTI: "com.adobe.pdf",
    });
  }
  return uri;
}
