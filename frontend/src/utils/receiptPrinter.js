// Receipt Printer Utility
// This utility handles receipt generation and printing

export const generateReceipt = (saleData, settings) => {
  const { items, subtotal, gst_amount, total_amount, created_at, cashier_name } = saleData;
  const { business_name, business_address, gst_number } = settings;

  const receiptDate = new Date(created_at).toLocaleString();

  let receiptHTML = `
    <div id="receipt-print" style="width: 80mm; font-family: 'Courier New', monospace; font-size: 12px; padding: 10px;">
      <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold;">${business_name}</h2>
        ${business_address ? `<p style="margin: 5px 0; font-size: 11px; font-weight: bold;">${business_address}</p>` : ''}
        ${gst_number ? `<p style="margin: 5px 0; font-size: 11px; font-weight: bold;">GST: ${gst_number}</p>` : ''}
      </div>

      <div style="margin-bottom: 10px;">
        <p style="margin: 3px 0; font-weight: bold;"><strong>Date:</strong> ${receiptDate}</p>
        <p style="margin: 3px 0; font-weight: bold;"><strong>Cashier:</strong> ${cashier_name}</p>
      </div>

      <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 10px;">
        <table style="width: 100%; font-size: 11px; font-weight: bold;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 5px 0; font-weight: bold;">Item</th>
              <th style="text-align: center; font-weight: bold;">Qty</th>
              <th style="text-align: right; font-weight: bold;">Price</th>
              <th style="text-align: right; font-weight: bold;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">${item.product_name}</td>
                <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
                <td style="text-align: right; font-weight: bold;">₹${item.price.toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 10px;">
        <table style="width: 100%; font-size: 12px; font-weight: bold;">
          <tr>
            <td style="text-align: right; padding: 3px 0;"><strong>Subtotal:</strong></td>
            <td style="text-align: right; padding: 3px 0; padding-left: 20px; font-weight: bold;">₹${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right; padding: 3px 0;"><strong>GST (18%):</strong></td>
            <td style="text-align: right; padding: 3px 0; padding-left: 20px; font-weight: bold;">₹${gst_amount.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #000;">
            <td style="text-align: right; padding: 8px 0; font-size: 14px; font-weight: bold;"><strong>TOTAL:</strong></td>
            <td style="text-align: right; padding: 8px 0; padding-left: 20px; font-size: 14px; font-weight: bold;"><strong>₹${total_amount.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px;">
        <p style="margin: 5px 0; font-size: 11px; font-weight: bold;">Thank you for shopping!</p>
        <p style="margin: 5px 0; font-size: 10px; font-weight: bold;">Visit again soon</p>
      </div>
    </div>
  `;

  return receiptHTML;
};

export const printReceipt = (receiptHTML, settings) => {
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  
  // Add print styles based on paper size
  const paperWidth = settings.paper_size === '58mm' ? '58mm' : 
                     settings.paper_size === 'A4' ? '210mm' : '80mm';
  
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @page {
            size: ${paperWidth} auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-weight: bold;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
              font-weight: bold;
            }
            * {
              font-weight: bold !important;
            }
          }
        </style>
      </head>
      <body>
        ${receiptHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for content to load, then print
  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error('Print error:', error);
        document.body.removeChild(iframe);
      }
    }, 250);
  };
};

export const handleAutoPrint = async (saleData, settings) => {
  try {
    // Check if auto-print is enabled
    if (!settings.auto_print) {
      return false;
    }

    // Generate receipt HTML
    const receiptHTML = generateReceipt(saleData, settings);
    
    // Print receipt
    printReceipt(receiptHTML, settings);
    
    return true;
  } catch (error) {
    console.error('Auto-print error:', error);
    return false;
  }
};
