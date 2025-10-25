// src/utils/quotationGenerator.js
export const generateQuotationHTML = (quotationData) => {
  // Calculate inventory items subtotal
  const inventorySubtotal = quotationData.items.reduce((sum, item) =>
    sum + (item.quantityRequested * item.pricePerItem), 0
  );

  // Calculate borrowed items total
  const borrowedTotal = (quotationData.borrowed_items || []).reduce((sum, item) =>
    sum + (item.selling_price * item.quantity), 0
  );

  // Calculate total amount (adjusting for old item exchange and borrowed items)
  let totalAmount = inventorySubtotal + borrowedTotal;
  if (quotationData.old_item_exchange) {
    totalAmount -= quotationData.old_item_exchange.deduction_amount;
  }

  return `
    <html>
      <head>
        <title>Quotation - ${quotationData.id}</title>
        <style>
          /* --- Copy ALL styles from billGenerator.js --- */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #000;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          .company-address {
            font-size: 12px;
            margin: 5px 0;
          }
          .contact-info {
            font-size: 11px;
            margin: 5px 0;
          }
          .invoice-title { /* Change from invoice-title */
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
            text-decoration: underline;
          }
          .info-section {
            margin: 20px 0;
            border: 1px solid #000;
            padding: 10px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          .info-label {
            font-weight: bold;
            min-width: 120px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #000;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
          }
          td.center { text-align: center; }
          td.right { text-align: right; }
          .section-header {
            background-color: #f0f0f0;
            font-weight: bold;
            padding: 8px;
            border: 1px solid #000;
          }
          .totals {
            margin-top: 20px;
            border: 2px solid #000;
            padding: 15px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 13px;
          }
          .totals-row.highlight { font-weight: bold; color: #c00; }
          .totals-row.positive { color: #0a0; }
          .totals-row.total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .notes-section { /* Added for notes */
             margin-top: 20px;
             padding: 10px;
             border: 1px dashed #555;
             font-size: 11px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #000;
            font-size: 12px;
          }
          .print-button {
            margin-top: 15px;
            padding: 10px 20px;
            font-size: 14px;
            background-color: #000;
            color: #fff;
            border: none;
            cursor: pointer;
          }
          @media print {
            .print-button { display: none; }
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">LSP SEWING MACHINES</div>
          <div class="company-address">Badagamuwa, Thorayaya, Kurunegala</div>
          <div class="contact-info">Phone: 0764855091 / 0753751536 | Email: ispemboidery@gmail.com</div>
          <div class="invoice-title">QUOTATION</div> {/* Changed Title */}
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Quotation No:</span>
            <span>${quotationData.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${new Date(quotationData.date).toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer Name:</span>
            <span>${quotationData.customerName || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone Number:</span>
            <span>${quotationData.phoneNumber || 'N/A'}</span>
          </div>
        </div>

        ${quotationData.items && quotationData.items.length > 0 ? `
        <div class="section-header">QUOTED ITEMS</div>
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">No.</th>
              <th style="width: 40%;">Item Description</th>
              <th style="width: 15%;">Qty</th>
              <th style="width: 17.5%;">Unit Price</th>
              <th style="width: 17.5%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${quotationData.items.map((item, index) => {
              const itemTotal = item.quantityRequested * item.pricePerItem;
              const itemDescription = item.modelNumber
                ? `${item.itemName} - ${item.modelNumber}`
                : item.itemName;
              return `
                <tr>
                  <td class="center">${index + 1}</td>
                  <td>${itemDescription}</td>
                  <td class="center">${item.quantityRequested}</td>
                  <td class="right">Rs. ${item.pricePerItem.toFixed(2)}</td>
                  <td class="right">Rs. ${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
            <tr>
              <td colspan="4" class="right" style="font-weight: bold;">Subtotal:</td>
              <td class="right" style="font-weight: bold;">Rs. ${inventorySubtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        ${quotationData.borrowed_items && quotationData.borrowed_items.length > 0 ? `
        <div class="section-header">ADDITIONAL ITEMS</div>
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">No.</th>
              <th style="width: 55%;">Description</th>
              <th style="width: 15%;">Qty</th>
              <th style="width: 20%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${quotationData.borrowed_items.map((item, index) => {
              const itemTotal = item.selling_price * item.quantity;
              return `
                <tr>
                  <td class="center">${index + 1}</td>
                  <td>${item.description}</td>
                  <td class="center">${item.quantity}</td>
                  <td class="right">Rs. ${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
            <tr>
              <td colspan="3" class="right" style="font-weight: bold;">Additional Items Subtotal:</td>
              <td class="right" style="font-weight: bold;">Rs. ${borrowedTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        ${quotationData.old_item_exchange ? `
        <div class="info-section" style="background-color: #ffe0e0;">
          <div style="font-weight: bold; margin-bottom: 5px;">OLD ITEM EXCHANGE</div>
          <div class="info-row">
            <span class="info-label">Description:</span>
            <span>${quotationData.old_item_exchange.description}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Estimated Deduction:</span>
            <span style="color: #c00; font-weight: bold;">- Rs. ${quotationData.old_item_exchange.deduction_amount.toFixed(2)}</span>
          </div>
        </div>
        ` : ''}

        <div class="totals">
          ${quotationData.items && quotationData.items.length > 0 ? `
          <div class="totals-row">
            <span>Inventory Items:</span>
            <span>Rs. ${inventorySubtotal.toFixed(2)}</span>
          </div>
          ` : ''}

          ${quotationData.old_item_exchange ? `
          <div class="totals-row highlight">
            <span>Old Item Deduction:</span>
            <span>- Rs. ${quotationData.old_item_exchange.deduction_amount.toFixed(2)}</span>
          </div>
          ` : ''}

          ${quotationData.borrowed_items && quotationData.borrowed_items.length > 0 ? `
          <div class="totals-row positive">
            <span>Additional Items:</span>
            <span>+ Rs. ${borrowedTotal.toFixed(2)}</span>
          </div>
          ` : ''}

          <div class="totals-row total">
            <span>Estimated Total Amount:</span>
            <span>Rs. ${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        ${quotationData.notes ? `
        <div class="notes-section">
          <strong>Notes:</strong><br>
          ${quotationData.notes.replace(/\n/g, '<br>')}
        </div>
        ` : ''}

        <div class="footer">
          <div>This quotation is valid for 7 days. Prices are subject to change.</div>
          <button class="print-button" onclick="window.print()">PRINT QUOTATION</button>
        </div>
      </body>
    </html>
  `;
};
