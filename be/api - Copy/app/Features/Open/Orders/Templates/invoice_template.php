<?php
/**
 * Professional Single-Page Invoice Template for Ramesh Sweets
 * 260x100 logo with optimized layout for A4
 * 
 * @var array $invoiceData Invoice data
 */

// Extract invoice data
$invoiceNumber = $invoiceData['invoice_number'];
$orderNumber = $invoiceData['order_number'];
$orderDate = $invoiceData['order_date'];
$paymentMethod = $invoiceData['payment_method'];
$paymentStatus = $invoiceData['payment_status'];
$storeInfo = $invoiceData['store_info'];
$customerInfo = $invoiceData['customer_info'];
$shippingAddress = $invoiceData['shipping_address'];
$items = $invoiceData['items'];
$totalQuantity = $invoiceData['total_quantity'];
$billBreakdown = $invoiceData['bill_breakdown'];
$taxDetails = $invoiceData['tax_details'];

// Format currency
function formatCurrency($amount) {
    return '₹' . number_format($amount, 2);
}

// Format address
function formatAddress($address) {
    $parts = [];
    
    if (!empty($address['name'])) $parts[] = $address['name'];
    if (!empty($address['address'])) $parts[] = $address['address'];
    if (!empty($address['address2'])) $parts[] = $address['address2'];
    
    $cityParts = [];
    if (!empty($address['city'])) $cityParts[] = $address['city'];
    if (!empty($address['state'])) $cityParts[] = $address['state'];
    if (!empty($address['postal_code'])) $cityParts[] = $address['postal_code'];
    
    if (!empty($cityParts)) $parts[] = implode(', ', $cityParts);
    if (!empty($address['country'])) $parts[] = $address['country'];
    if (!empty($address['phone'])) $parts[] = 'Phone: ' . $address['phone'];
    
    return implode('<br>', $parts);
}

// Read the PNG logo file
$logoPath = __DIR__ . '/ramesh-logo.png';
$logoExists = file_exists($logoPath);

// SVG Icons
$phoneIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';

$emailIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';

$locationIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

$checkIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

$clockIcon = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="m12.5 7-1 0 0 6 5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - <?php echo htmlspecialchars($invoiceNumber); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'brand': '#d3ae6e',
                        'brand-light': '#e8c89a',
                        'peach': '#fdf7f0',
                        'peach-light': '#faf4ed'
                    },
                    fontFamily: {
                        'serif': ['Playfair Display', 'serif'],
                        'sans': ['Inter', 'sans-serif']
                    }
                }
            }
        }
    </script>
    <style>
        @page {
            size: A4;
            margin: 0.3in;
        }
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .font-serif {
            font-family: 'Playfair Display', serif;
        }
        
        @media print {
            body {
                background: white !important;
            }
            .no-print {
                display: none !important;
            }
            .invoice-container {
                margin: 0 !important;
                padding: 15px !important;
                box-shadow: none !important;
            }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-peach via-peach-light to-peach min-h-screen p-2">
    <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Top Brand Bar -->
        <div class="h-1 bg-brand"></div>
        
        <!-- Invoice Container -->
        <div class="p-4">
            <!-- Header Section -->
            <div class="flex justify-between items-start mb-4 pb-4 border-b-2 border-brand">
                <!-- Left: Logo and Store Details -->
                <div class="flex-1">
                    <!-- Large Logo 260x100 -->
                    <div class="mb-3">
                        <div class="flex items-center justify-start" style="width: 260px; height: 100px;">
                            <?php if ($logoExists): ?>
                                <div style="width: 260px; height: 100px; display: flex; align-items: center; justify-content: center;">
                                    <?php
                                    $logoData = base64_encode(file_get_contents($logoPath));
                                    $logoSrc = 'data:image/png;base64,' . $logoData;
                                    ?>
                                    <img src="<?php echo $logoSrc; ?>" alt="Company Logo" style="width: 240px; height: 90px; max-width: 240px; max-height: 90px; object-fit: contain;" class="drop-shadow-md">
                                </div>
                            <?php else: ?>
                                <div class="w-full h-full bg-brand/10 rounded-lg flex items-center justify-center">
                                    <span class="text-brand text-2xl font-bold">LOGO</span>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- Store Details Below Logo -->
                    <div class="space-y-1 text-xs text-gray-600 max-w-md">
                        <div class="flex items-center gap-1.5">
                            <?php echo $locationIcon; ?>
                            <span><?php echo htmlspecialchars($storeInfo['store_address_line1']); ?></span>
                        </div>
                        <?php if (!empty($storeInfo['store_address_line2'])): ?>
                        <div class="flex items-center gap-1.5">
                            <?php echo $locationIcon; ?>
                            <span><?php echo htmlspecialchars($storeInfo['store_address_line2']); ?></span>
                        </div>
                        <?php endif; ?>
                        <div class="flex items-center gap-1.5">
                            <?php echo $locationIcon; ?>
                            <span><?php echo htmlspecialchars($storeInfo['store_city']); ?>, <?php echo htmlspecialchars($storeInfo['store_state']); ?> - <?php echo htmlspecialchars($storeInfo['store_postal_code']); ?></span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <?php echo $phoneIcon; ?>
                            <span><?php echo htmlspecialchars($storeInfo['store_phone']); ?></span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <?php echo $emailIcon; ?>
                            <span><?php echo htmlspecialchars($storeInfo['store_email']); ?></span>
                        </div>
                        <?php if (!empty($storeInfo['store_gst'])): ?>
                        <div class="flex items-center gap-1.5">
                            <span class="font-semibold text-brand">GSTIN:</span>
                            <span><?php echo htmlspecialchars($storeInfo['store_gst']); ?></span>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Right: Invoice Details -->
                <div class="text-right">
                    <h1 class="font-serif text-4xl font-bold text-brand mb-1 tracking-wide">INVOICE</h1>
                    <p class="text-base text-gray-600 mb-3 font-medium"><?php echo htmlspecialchars($invoiceNumber); ?></p>
                    
                    <div class="bg-peach p-3 rounded-lg border-l-4 border-brand inline-block">
                        <table class="text-xs">
                            <tr>
                                <td class="font-semibold text-gray-700 pr-3 py-0.5">Order Number:</td>
                                <td class="py-0.5"><?php echo htmlspecialchars($orderNumber); ?></td>
                            </tr>
                            <tr>
                                <td class="font-semibold text-gray-700 pr-3 py-0.5">Order Date:</td>
                                <td class="py-0.5"><?php echo htmlspecialchars($orderDate); ?></td>
                            </tr>
                            <tr>
                                <td class="font-semibold text-gray-700 pr-3 py-0.5">Payment Method:</td>
                                <td class="py-0.5"><?php echo htmlspecialchars(ucfirst($paymentMethod)); ?></td>
                            </tr>
                            <tr>
                                <td class="font-semibold text-gray-700 pr-3 py-0.5">Payment Status:</td>
                                <td class="py-0.5">
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold <?php echo strtolower($paymentStatus) === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'; ?>">
                                        <?php echo strtolower($paymentStatus) === 'paid' ? $checkIcon : $clockIcon; ?>
                                        <?php echo htmlspecialchars(ucfirst($paymentStatus)); ?>
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Bill To & Ship To -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-peach p-3 rounded-lg border-l-4 border-brand">
                    <h3 class="font-serif text-sm font-semibold text-brand mb-2 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Bill To
                    </h3>
                    <div class="text-xs text-gray-700 space-y-0.5">
                        <div class="font-semibold"><?php echo htmlspecialchars($customerInfo['name'] ?: 'Valued Customer'); ?></div>
                        <?php if (!empty($customerInfo['phone'])): ?>
                            <div class="flex items-center gap-1">
                                <?php echo $phoneIcon; ?>
                                <?php echo htmlspecialchars($customerInfo['phone']); ?>
                            </div>
                        <?php endif; ?>
                        <?php if (!empty($customerInfo['email'])): ?>
                            <div class="flex items-center gap-1">
                                <?php echo $emailIcon; ?>
                                <?php echo htmlspecialchars($customerInfo['email']); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="bg-peach p-3 rounded-lg border-l-4 border-brand">
                    <h3 class="font-serif text-sm font-semibold text-brand mb-2 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Ship To
                    </h3>
                    <div class="text-xs text-gray-700">
                        <?php echo formatAddress($shippingAddress); ?>
                    </div>
                </div>
            </div>
            
            <!-- Items Table -->
            <div class="mb-4">
                <table class="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
                    <thead>
                        <tr class="bg-brand text-white">
                            <th class="p-2 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                            <th class="p-2 text-left text-xs font-semibold uppercase tracking-wider">Item Description</th>
                            <th class="p-2 text-center text-xs font-semibold uppercase tracking-wider">HSN</th>
                            <th class="p-2 text-center text-xs font-semibold uppercase tracking-wider">Qty</th>
                            <th class="p-2 text-right text-xs font-semibold uppercase tracking-wider">Rate (Incl. GST)</th>
                            <th class="p-2 text-right text-xs font-semibold uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white">
                        <?php foreach ($items as $index => $item): ?>
                        <tr class="<?php echo $index % 2 === 0 ? 'bg-gray-50' : 'bg-white'; ?> border-b border-gray-100">
                            <td class="p-2 text-center text-xs"><?php echo $index + 1; ?></td>
                            <td class="p-2 text-xs">
                                <div class="font-semibold"><?php echo htmlspecialchars($item['name']); ?></div>
                                <?php if (!empty($item['sku'])): ?>
                                    <div class="text-xs text-gray-500">SKU: <?php echo htmlspecialchars($item['sku']); ?></div>
                                <?php endif; ?>
                            </td>
                            <td class="p-2 text-center text-xs"><?php echo htmlspecialchars($item['hsn'] ?? '-'); ?></td>
                            <td class="p-2 text-center text-xs font-semibold"><?php echo $item['quantity']; ?></td>
                            <td class="p-2 text-right text-xs">
                                <div class="font-semibold"><?php echo formatCurrency($item['price']); ?></div>
                                <div class="text-xs text-gray-500">(incl. <?php echo number_format($item['tax_rate'], 1); ?>% GST)</div>
                            </td>
                            <td class="p-2 text-right text-xs font-semibold"><?php echo formatCurrency($item['total']); ?></td>
                        </tr>
                        <?php endforeach; ?>
                        <tr class="bg-brand text-white font-semibold">
                            <td colspan="3" class="p-2 text-right text-xs">Total Items: <?php echo count($items); ?></td>
                            <td class="p-2 text-center text-xs"><?php echo $totalQuantity; ?></td>
                            <td class="p-2 text-right text-xs">Grand Total:</td>
                            <td class="p-2 text-right text-sm"><?php echo formatCurrency($billBreakdown['final_total']); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Summary Section -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- Bill Summary with Tax Details -->
                <div class="bg-peach p-3 rounded-lg border border-gray-200">
                    <h4 class="font-serif text-sm font-semibold text-brand mb-2 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                        Tax Summary
                    </h4>
                    <div class="space-y-1 text-xs">
                        <?php
                        // Group items by tax rate for clearer tax breakdown
                        $taxGroups = [];
                        $totalTaxableAmount = 0;
                        $totalTaxAmount = 0;
                        
                        foreach ($items as $item) {
                            $taxRate = $item['tax_rate'];
                            if (!isset($taxGroups[$taxRate])) {
                                $taxGroups[$taxRate] = [
                                    'taxable_amount' => 0,
                                    'tax_amount' => 0,
                                    'items_count' => 0
                                ];
                            }
                            $taxGroups[$taxRate]['taxable_amount'] += $item['base_price'] * $item['quantity'];
                            $taxGroups[$taxRate]['tax_amount'] += $item['tax_amount'];
                            $taxGroups[$taxRate]['items_count']++;
                            
                            $totalTaxableAmount += $item['base_price'] * $item['quantity'];
                            $totalTaxAmount += $item['tax_amount'];
                        }
                        ?>
                        
                        <div class="flex justify-between font-semibold text-gray-800">
                            <span>Total Taxable Amount:</span>
                            <span><?php echo formatCurrency($totalTaxableAmount); ?></span>
                        </div>
                        <div class="border-t border-gray-300 pt-1 mt-1"></div>
                        
                        <?php foreach ($taxGroups as $rate => $group): ?>
                            <div class="bg-white p-2 rounded border-l-2 border-brand/30 mb-1">
                                <div class="flex justify-between text-gray-700">
                                    <span class="font-medium">Tax @ <?php echo number_format($rate, 1); ?>% (<?php echo $group['items_count']; ?> item<?php echo $group['items_count'] > 1 ? 's' : ''; ?>):</span>
                                    <span class="font-semibold"><?php echo formatCurrency($group['tax_amount']); ?></span>
                                </div>
                                <div class="text-xs text-gray-500 mt-0.5">
                                    Taxable: <?php echo formatCurrency($group['taxable_amount']); ?>
                                </div>
                                <?php if ($taxDetails['type'] == 'igst'): ?>
                                <div class="text-xs text-gray-600 mt-0.5">
                                    IGST (<?php echo number_format($rate, 1); ?>%): <?php echo formatCurrency($group['tax_amount']); ?>
                                </div>
                                <?php else: ?>
                                <div class="text-xs text-gray-600 mt-0.5">
                                    CGST (<?php echo number_format($rate/2, 1); ?>%): <?php echo formatCurrency($group['tax_amount']/2); ?>
                                    <br>
                                    SGST (<?php echo number_format($rate/2, 1); ?>%): <?php echo formatCurrency($group['tax_amount']/2); ?>
                                </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>

                        <div class="border-t border-brand pt-1 flex justify-between font-bold text-brand">
                            <?php if ($taxDetails['type'] == 'igst'): ?>
                            <span>Total IGST:</span>
                            <?php else: ?>
                            <span>Total CGST + SGST:</span>
                            <?php endif; ?>
                            <span><?php echo formatCurrency($totalTaxAmount); ?></span>
                        </div>
                        <div class="border-t border-gray-300 pt-1 flex justify-between font-bold text-lg text-gray-800">
                            <span>Product Total:</span>
                            <span><?php echo formatCurrency($totalTaxableAmount + $totalTaxAmount); ?></span>
                        </div>
                    </div>
                </div>
                
                <!-- Bill Summary -->
                <div class="bg-white border-2 border-brand rounded-lg overflow-hidden">
                    <table class="w-full">
                        <tbody>
                            <tr>
                                <td class="bg-peach p-2 font-semibold text-gray-700 border-b border-gray-200 text-xs">Original Price (Inc. GST):</td>
                                <td class="p-2 text-right font-semibold border-b border-gray-200 text-xs"><?php echo formatCurrency($billBreakdown['original_price'] ?? ($billBreakdown['base_amount'] + $billBreakdown['tax_amount'] + $billBreakdown['product_discount'] + $billBreakdown['coupon_discount'])); ?></td>
                            </tr>
                            <?php if ($billBreakdown['product_discount'] > 0): ?>
                            <tr>
                                <td class="bg-peach p-2 font-semibold text-gray-700 border-b border-gray-200 text-xs">Product Discount:</td>
                                <td class="p-2 text-right font-semibold border-b border-gray-200 text-red-600 text-xs">-<?php echo formatCurrency($billBreakdown['product_discount']); ?></td>
                            </tr>
                            <?php endif; ?>
                            <tr>
                                <td class="bg-peach p-2 font-semibold text-gray-700 border-b border-gray-200 text-xs">Subtotal (Inc. GST):</td>
                                <td class="p-2 text-right font-semibold border-b border-gray-200 text-xs"><?php echo formatCurrency($billBreakdown['subtotal']); ?></td>
                            </tr>
                            <?php if ($billBreakdown['coupon_discount'] > 0): ?>
                            <tr>
                                <td class="bg-peach p-2 font-semibold text-gray-700 border-b border-gray-200 text-xs">Coupon Discount:</td>
                                <td class="p-2 text-right font-semibold border-b border-gray-200 text-red-600 text-xs">-<?php echo formatCurrency($billBreakdown['coupon_discount']); ?></td>
                            </tr>
                            <?php endif; ?>
                            <?php if ($billBreakdown['shipping_charges'] > 0): ?>
                            <tr>
                                <td class="bg-peach p-2 font-semibold text-gray-700 border-b border-gray-200 text-xs">Shipping:</td>
                                <td class="p-2 text-right font-semibold border-b border-gray-200 text-xs"><?php echo formatCurrency($billBreakdown['shipping_charges']); ?></td>
                            </tr>
                            <?php endif; ?>
                            <?php if ($billBreakdown['payment_charges'] > 0): ?>
                            <tr>
                                <td class="bg-peach p-2 font-semibold text-gray-700 border-b border-gray-200 text-xs">Payment Processing:</td>
                                <td class="p-2 text-right font-semibold border-b border-gray-200 text-xs"><?php echo formatCurrency($billBreakdown['payment_charges']); ?></td>
                            </tr>
                            <?php endif; ?>
                            <?php if ($billBreakdown['roundoff'] != 0): ?>
                            <tr>
                                <td class="bg-peach p-2 font-semibold text-gray-700 border-b border-gray-200 text-xs">Roundoff:</td>
                                <td class="p-2 text-right font-semibold border-b border-gray-200 text-xs"><?php echo formatCurrency($billBreakdown['roundoff']); ?></td>
                            </tr>
                            <?php endif; ?>
                            <tr class="bg-brand text-white">
                                <td class="p-3 font-bold text-sm">Final Amount:</td>
                                <td class="p-3 text-right font-bold text-lg"><?php echo formatCurrency($billBreakdown['final_total']); ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-peach p-3 rounded-lg border border-gray-200 text-center">
                <h3 class="font-serif text-lg font-semibold text-brand mb-2">Thank You for Your Business</h3>
                <div class="flex justify-center items-center gap-4 mb-2 text-xs text-gray-600">
                    <div class="flex items-center gap-1">
                        <?php echo $phoneIcon; ?>
                        <?php echo htmlspecialchars($storeInfo['store_phone']); ?>
                    </div>
                    <div class="flex items-center gap-1">
                        <?php echo $emailIcon; ?>
                        <?php echo htmlspecialchars($storeInfo['store_email']); ?>
                    </div>
                </div>
                <p class="text-xs text-gray-500">This is a computer-generated invoice. Generated on <?php echo date('d M Y, h:i A'); ?></p>
            </div>
        </div>
        
        <?php if (strtolower($paymentStatus) === 'paid'): ?>
        <div class="absolute top-1/2 right-6 transform -translate-y-1/2 rotate-12 border-4 border-green-500 text-green-500 font-bold text-2xl px-6 py-3 rounded-lg opacity-80 pointer-events-none bg-green-50">
            PAID ✓
        </div>
        <?php endif; ?>
    </div>
</body>
</html>
