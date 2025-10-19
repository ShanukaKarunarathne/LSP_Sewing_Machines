export const generateBillHTML = (saleData) => {
  // Calculate inventory items subtotal
  const inventorySubtotal = saleData.items.reduce((sum, item) => 
    sum + (item.quantitySold * item.pricePerItem), 0
  );

  // Calculate borrowed items total
  const borrowedTotal = (saleData.borrowed_items || []).reduce((sum, item) => 
    sum + (item.selling_price * item.quantity), 0
  );

  return `
    <html>
      <head>
        <title>Invoice - ${saleData.id}</title>
        <style>
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
          
          .invoice-title {
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
          
          td.center {
            text-align: center;
          }
          
          td.right {
            text-align: right;
          }

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

          .totals-row.highlight {
            font-weight: bold;
            color: #c00;
          }

          .totals-row.positive {
            color: #0a0;
          }
          
          .totals-row.total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          
          .warranty-section {
            margin-top: 30px;
            border: 2px dashed #000;
            padding: 15px;
            text-align: center;
          }
          
          .warranty-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-decoration: underline;
          }
          
          .warranty-text {
            font-size: 11px;
            line-height: 1.6;
          }
          
          .footer { 
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #000;
            font-size: 12px;
          }
          
          .thank-you {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
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
            .print-button { 
              display: none;
            }
            body {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">LSP SEWING MACHINES</div>
          <div class="company-address">Badagamuwa, Thorayaya, Kurunegala</div>
          <div class="contact-info">Phone: 0764855091 / 0753751536 | Email: ispemboidery@gmail.com</div>
          <div class="invoice-title">SALES INVOICE</div>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Invoice No:</span>
            <span>${saleData.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${new Date(saleData.date).toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer Name:</span>
            <span>${saleData.customerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone Number:</span>
            <span>${saleData.phoneNumber}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span>${saleData.paymentMethod}</span>
          </div>
        </div>

        ${saleData.items && saleData.items.length > 0 ? `
        <div class="section-header">INVENTORY ITEMS</div>
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
            ${saleData.items.map((item, index) => {
              const itemTotal = item.quantitySold * item.pricePerItem;
              const itemDescription = item.modelNumber 
                ? `${item.itemName} - ${item.modelNumber}`
                : item.itemName;
              return `
                <tr>
                  <td class="center">${index + 1}</td>
                  <td>${itemDescription}</td>
                  <td class="center">${item.quantitySold}</td>
                  <td class="right">Rs. ${item.pricePerItem.toFixed(2)}</td>
                  <td class="right">Rs. ${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
            <tr>
              <td colspan="4" class="right" style="font-weight: bold;">Inventory Subtotal:</td>
              <td class="right" style="font-weight: bold;">Rs. ${inventorySubtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        ${saleData.borrowed_items && saleData.borrowed_items.length > 0 ? `
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
            ${saleData.borrowed_items.map((item, index) => {
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

        ${saleData.old_item_exchange ? `
        <div class="info-section" style="background-color: #ffe0e0;">
          <div style="font-weight: bold; margin-bottom: 5px;">OLD ITEM EXCHANGE</div>
          <div class="info-row">
            <span class="info-label">Description:</span>
            <span>${saleData.old_item_exchange.description}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Deduction:</span>
            <span style="color: #c00; font-weight: bold;">- Rs. ${saleData.old_item_exchange.deduction_amount.toFixed(2)}</span>
          </div>
        </div>
        ` : ''}

        <div class="totals">
          ${saleData.items && saleData.items.length > 0 ? `
          <div class="totals-row">
            <span>Inventory Items:</span>
            <span>Rs. ${inventorySubtotal.toFixed(2)}</span>
          </div>
          ` : ''}
          
          ${saleData.old_item_exchange ? `
          <div class="totals-row highlight">
            <span>Old Item Deduction:</span>
            <span>- Rs. ${saleData.old_item_exchange.deduction_amount.toFixed(2)}</span>
          </div>
          ` : ''}
          
          ${saleData.borrowed_items && saleData.borrowed_items.length > 0 ? `
          <div class="totals-row positive">
            <span>Additional Items:</span>
            <span>+ Rs. ${borrowedTotal.toFixed(2)}</span>
          </div>
          ` : ''}

          <div class="totals-row total">
            <span>Total Amount:</span>
            <span>Rs. ${saleData.totalAmount.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Amount Paid:</span>
            <span>Rs. ${saleData.amountPaid.toFixed(2)}</span>
          </div>
          <div class="totals-row total">
            <span>Balance Due:</span>
            <span>Rs. ${saleData.balance.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Payment Status:</span>
            <span>${saleData.creditStatus}</span>
          </div>
        </div>

        <div class="warranty-section">
          <div class="warranty-title">*** WARRANTY INFORMATION ***</div>
          <div class="warranty-text">
            This product comes with a 1 YEAR WARRANTY from the date of purchase.<br>
            Warranty covers manufacturing defects and parts replacement.<br>
            Please keep this invoice for warranty claims.<br>
            For service and support, contact us at the numbers above.
          </div>
        </div>

        <div class="footer">
          <div class="thank-you">Thank You for Your Business!</div>
          <div>Visit us again for quality sewing machines and service</div>
          <button class="print-button" onclick="window.print()">PRINT INVOICE</button>
        </div>
      </body>
    </html>
  `;
};