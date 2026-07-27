import { PrismaClient, InvoiceStatus, DiscountType } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing tables
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcryptjs.hash('Pass@123', 10);
  const testUser = await prisma.user.create({
    data: {
      name: 'test1',
      email: 'test@gmail.com',
      password: hashedPassword,
    },
  });
  console.log('👤 Test user created:', testUser.email);

  // Create demo customers
  const cust1 = await prisma.customer.create({
    data: {
      name: 'Tata Consultancy Services',
      email: 'billing@tcs.co.in',
      phone: '+91 22 6778 9999',
      address: 'TCS House, Raveline Street, Fort, Mumbai, Maharashtra 400001',
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      name: 'Infosys Limited',
      email: 'accounts@infosys.com',
      phone: '+91 80 2852 0261',
      address: 'Electronics City, Hosur Road, Bengaluru, Karnataka 560100',
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      name: 'Zomato Pvt Ltd',
      email: 'finance@zomato.com',
      phone: '+91 11 4019 5555',
      address: '12th Floor, Tower D, DLF Cyber City, Gurugram, Haryana 122002',
    },
  });

  const today = new Date();

  // Array of invoice amounts for variety
  const invoiceAmounts = [
    { subtotal: 1500000, items: [{ desc: 'Web Development Services', qty: 1, price: 1500000 }] },
    { subtotal: 2800000, items: [{ desc: 'UI/UX Design', qty: 1, price: 1800000 }, { desc: 'Frontend Dev', qty: 1, price: 1000000 }] },
    { subtotal: 3200000, items: [{ desc: 'Full Stack Development', qty: 1, price: 3200000 }] },
    { subtotal: 950000, items: [{ desc: 'Consulting', qty: 1, price: 950000 }] },
    { subtotal: 5400000, items: [{ desc: 'Enterprise Solution', qty: 1, price: 5400000 }] },
    { subtotal: 2100000, items: [{ desc: 'API Integration', qty: 1, price: 2100000 }] },
    { subtotal: 1800000, items: [{ desc: 'Mobile App Dev', qty: 1, price: 1800000 }] },
    { subtotal: 3600000, items: [{ desc: 'Database Optimization', qty: 1, price: 3600000 }] },
  ];

  // Generate 20 invoices with different dates and statuses
  for (let i = 0; i < 20; i++) {
    const invoiceDate = new Date(today);
    invoiceDate.setDate(today.getDate() - (i * 4)); // Spread across ~80 days

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 15); // Net 15 days

    // Determine status based on date
    let status = InvoiceStatus.UNPAID;
    if (invoiceDate < new Date(today.getTime() - 30 * 86400000)) {
      status = i % 3 === 0 ? InvoiceStatus.PAID : InvoiceStatus.OVERDUE;
    } else if (invoiceDate < new Date(today.getTime() - 15 * 86400000)) {
      status = i % 2 === 0 ? InvoiceStatus.PAID : InvoiceStatus.UNPAID;
    }

    const amountData = invoiceAmounts[i % invoiceAmounts.length];
    const discountPercent = i % 5 === 0 ? 10 : 0;
    const discountAmount = Math.floor((amountData.subtotal * discountPercent) / 100);
    const discountedSubtotal = amountData.subtotal - discountAmount;
    const taxAmount = Math.floor((discountedSubtotal * 18) / 100);
    const total = discountedSubtotal + taxAmount;

    const customerIndex = i % 3;
    const customerId = [cust1.id, cust2.id, cust3.id][customerIndex];
    const customerObj = [cust1, cust2, cust3][customerIndex];

    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(i + 1).padStart(3, '0')}`,
        status,
        customerId,
        customerName: customerObj.name,
        customerEmail: customerObj.email,
        customerPhone: customerObj.phone,
        customerAddress: customerObj.address,

        businessName: 'SmartBill Solutions Pvt. Ltd.',
        businessEmail: 'hello@smartbill.in',
        businessPhone: '+91 98765 43210',
        businessAddress: '4th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103',

        issueDate: invoiceDate,
        dueDate,

        subtotal: amountData.subtotal,
        discountType: discountPercent > 0 ? DiscountType.PERCENTAGE : DiscountType.FIXED,
        discountValue: discountPercent,
        discountAmount: discountAmount,
        taxTotal: taxAmount,
        total,

        notes: `Invoice for ${['July', 'June', 'May'][Math.floor(i / 7)]} 2026 services.`,
        terms: 'Net 15 days. Thank you for your business!',

        items: {
          create: amountData.items.map((item) => ({
            description: item.desc,
            quantity: item.qty,
            unitPrice: item.price,
            taxRate: 18,
            lineTotal: Math.floor((item.price * 118) / 100),
          })),
        },
      },
    });
  }

  console.log('✅ Seed completed! Created 20 invoices for dashboard revenue display.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
