import { PrismaClient, Role, MovementKind } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing database records
  await prisma.lowStockAlert.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.itemNote.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.locationAssignment.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleaned existing database records');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const manager = await prisma.user.create({
    data: {
      email: 'manager@inventory.com',
      passwordHash,
      name: 'Sarah Connor',
      role: Role.MANAGER,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: 'staff1@inventory.com',
      passwordHash,
      name: 'John Doe',
      role: Role.STAFF,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'staff2@inventory.com',
      passwordHash,
      name: 'Jane Smith',
      role: Role.STAFF,
    },
  });

  console.log('✓ Users created (1 Manager, 2 Staff)');

  // 2. Create Locations
  const locMain = await prisma.location.create({ data: { name: 'Main Warehouse A' } });
  const locRetail = await prisma.location.create({ data: { name: 'Retail Store North' } });
  const locDist = await prisma.location.create({ data: { name: 'Distribution Hub East' } });
  const locBackroom = await prisma.location.create({ data: { name: 'Backroom Overflow' } });

  console.log('✓ 4 Locations created');

  // 3. Assign Staff to Locations
  await prisma.locationAssignment.createMany({
    data: [
      { userId: staff1.id, locationId: locMain.id },
      { userId: staff1.id, locationId: locRetail.id },
      { userId: staff2.id, locationId: locDist.id },
    ],
  });

  console.log('✓ Location assignments created');

  // 4. Create Categories
  const catElectronics = await prisma.category.create({ data: { name: 'Consumer Electronics' } });
  const catNetworking = await prisma.category.create({ data: { name: 'Networking Hardware' } });
  const catOffice = await prisma.category.create({ data: { name: 'Office Supplies' } });
  const catPackaging = await prisma.category.create({ data: { name: 'Packaging Materials' } });

  console.log('✓ 4 Categories created');

  // 5. Create Suppliers (Office Characters)
  const suppMichael = await prisma.supplier.create({
    data: {
      name: 'Dunder Mifflin Paper Co.',
      contact: 'Michael Scott',
      email: 'michael.scott@dundermifflin.com',
      phone: '+1-570-555-0100',
    },
  });

  const suppDwight = await prisma.supplier.create({
    data: {
      name: 'Schrute Farms & Logistics',
      contact: 'Dwight Schrute',
      email: 'dwight.schrute@schrutefarms.com',
      phone: '+1-570-555-0102',
    },
  });

  const suppJim = await prisma.supplier.create({
    data: {
      name: 'Athlead Sports Equipment',
      contact: 'Jim Halpert',
      email: 'jim.halpert@athlead.com',
      phone: '+1-215-555-0104',
    },
  });

  const suppPam = await prisma.supplier.create({
    data: {
      name: 'Beesly Art & Design Studio',
      contact: 'Pam Beesly',
      email: 'pam.beesly@dundermifflin.com',
      phone: '+1-570-555-0109',
    },
  });

  const suppBob = await prisma.supplier.create({
    data: {
      name: 'Vance Refrigeration Solutions',
      contact: 'Bob Vance',
      email: 'bob.vance@vancerefrigeration.com',
      phone: '+1-570-555-0103',
    },
  });

  const suppRyan = await prisma.supplier.create({
    data: {
      name: 'WUPFH Digital Solutions',
      contact: 'Ryan Howard',
      email: 'ryan.howard@wupfh.com',
      phone: '+1-570-555-0106',
    },
  });

  const suppAndy = await prisma.supplier.create({
    data: {
      name: 'Bernard Cornell Merchandise',
      contact: 'Andy Bernard',
      email: 'narddog@cornell.edu',
      phone: '+1-570-555-0105',
    },
  });

  const suppStanley = await prisma.supplier.create({
    data: {
      name: 'Pretzel Day Wholesale',
      contact: 'Stanley Hudson',
      email: 'stanley.hudson@dundermifflin.com',
      phone: '+1-570-555-0110',
    },
  });

  const suppAngela = await prisma.supplier.create({
    data: {
      name: 'Pronto Accounting & Tax',
      contact: 'Angela Martin',
      email: 'angela.martin@dundermifflin.com',
      phone: '+1-570-555-0111',
    },
  });

  const suppCreed = await prisma.supplier.create({
    data: {
      name: 'Quabity Assuance Corp',
      contact: 'Creed Bratton',
      email: 'creed.bratton@dundermifflin.com',
      phone: '+1-570-555-0107',
    },
  });

  console.log('✓ 10 Office Suppliers created');

  // 6. Create 16 Items
  const itemsData = [
    { sku: 'ELEC-LAP-101', name: 'Workstation Laptop 15"', unit: 'pcs', reorderLevel: 10, categoryId: catElectronics.id, supplierId: suppRyan.id },
    { sku: 'ELEC-MON-102', name: '4K IPS Monitor 27"', unit: 'pcs', reorderLevel: 8, categoryId: catElectronics.id, supplierId: suppBob.id },
    { sku: 'ELEC-KBD-103', name: 'Mechanical Keyboard RGB', unit: 'pcs', reorderLevel: 15, categoryId: catElectronics.id, supplierId: suppJim.id },
    { sku: 'ELEC-MSE-104', name: 'Ergonomic Wireless Mouse', unit: 'pcs', reorderLevel: 20, categoryId: catElectronics.id, supplierId: suppJim.id },
    { sku: 'NET-RTR-201', name: 'Enterprise Gigabit Router', unit: 'pcs', reorderLevel: 5, categoryId: catNetworking.id, supplierId: suppCreed.id },
    { sku: 'NET-SWT-202', name: '24-Port Managed Switch', unit: 'pcs', reorderLevel: 6, categoryId: catNetworking.id, supplierId: suppCreed.id },
    { sku: 'NET-CBL-203', name: 'Cat6 Patch Cable 10ft', unit: 'packs', reorderLevel: 30, categoryId: catNetworking.id, supplierId: suppRyan.id },
    { sku: 'NET-AP-204', name: 'Wi-Fi 6 Access Point', unit: 'pcs', reorderLevel: 10, categoryId: catNetworking.id, supplierId: suppBob.id },
    { sku: 'OFF-PPR-301', name: 'A4 Printing Paper (Box of 5)', unit: 'boxes', reorderLevel: 25, categoryId: catOffice.id, supplierId: suppMichael.id },
    { sku: 'OFF-TNR-302', name: 'LaserJet Toner Black', unit: 'pcs', reorderLevel: 12, categoryId: catOffice.id, supplierId: suppMichael.id },
    { sku: 'OFF-PEN-303', name: 'Gel Ink Pens (Pack of 12)', unit: 'packs', reorderLevel: 40, categoryId: catOffice.id, supplierId: suppPam.id },
    { sku: 'OFF-DSK-304', name: 'Adjustable Standing Desk', unit: 'pcs', reorderLevel: 4, categoryId: catOffice.id, supplierId: suppAndy.id },
    { sku: 'PKG-BOX-401', name: 'Cardboard Shipping Box (Medium)', unit: 'pcs', reorderLevel: 50, categoryId: catPackaging.id, supplierId: suppDwight.id },
    { sku: 'PKG-TAP-402', name: 'Heavy Duty Packing Tape', unit: 'rolls', reorderLevel: 35, categoryId: catPackaging.id, supplierId: suppDwight.id },
    { sku: 'PKG-BUB-403', name: 'Bubble Wrap Roll 100ft', unit: 'rolls', reorderLevel: 15, categoryId: catPackaging.id, supplierId: suppStanley.id },
    { sku: 'PKG-LBL-404', name: 'Thermal Shipping Labels', unit: 'rolls', reorderLevel: 20, categoryId: catPackaging.id, supplierId: suppAngela.id },
  ];

  const createdItems = [];
  for (const itemData of itemsData) {
    const item = await prisma.item.create({ data: itemData });
    createdItems.push(item);
  }

  console.log(`✓ ${createdItems.length} Items created`);

  // 7. Generate ~50 Stock Movements across items & locations
  const locationsList = [locMain.id, locRetail.id, locDist.id, locBackroom.id];
  const usersList = [manager.id, staff1.id, staff2.id];

  console.log('📦 Recording stock movements...');

  // Step A: Initial Receipts for all items at Main Warehouse
  for (const item of createdItems) {
    // Generate initial stock receipt
    let initialQty = 50;
    // Set low initial stock for 3 items to trigger low stock alerts
    if (item.sku === 'ELEC-MON-102' || item.sku === 'NET-RTR-201' || item.sku === 'OFF-DSK-304') {
      initialQty = item.reorderLevel - 2; // Below reorder level!
    }

    await prisma.stockMovement.create({
      data: {
        itemId: item.id,
        kind: MovementKind.RECEIPT,
        quantity: initialQty,
        locationId: locMain.id,
        recordedById: manager.id,
      },
    });
  }

  // Step B: Mix of receipts, issues, transfers, and adjustments
  for (let i = 0; i < 35; i++) {
    const randomItem = createdItems[i % createdItems.length];
    const randomLoc = locationsList[i % locationsList.length];
    const randomUser = usersList[i % usersList.length];

    if (i % 4 === 0) {
      // RECEIPT
      await prisma.stockMovement.create({
        data: {
          itemId: randomItem.id,
          kind: MovementKind.RECEIPT,
          quantity: Math.floor(Math.random() * 20) + 5,
          locationId: randomLoc,
          recordedById: randomUser,
        },
      });
    } else if (i % 4 === 1) {
      // ISSUE (from Main Warehouse)
      await prisma.stockMovement.create({
        data: {
          itemId: randomItem.id,
          kind: MovementKind.ISSUE,
          quantity: Math.floor(Math.random() * 5) + 1,
          locationId: locMain.id,
          recordedById: randomUser,
        },
      });
    } else if (i % 4 === 2) {
      // TRANSFER (Main -> Retail or Dist)
      const destLoc = locationsList[(i + 1) % locationsList.length];
      if (locMain.id !== destLoc) {
        await prisma.stockMovement.create({
          data: {
            itemId: randomItem.id,
            kind: MovementKind.TRANSFER,
            quantity: Math.floor(Math.random() * 3) + 1,
            locationId: locMain.id,
            sourceLocationId: locMain.id,
            destinationLocationId: destLoc,
            recordedById: randomUser,
          },
        });
      }
    } else {
      // ADJUSTMENT
      await prisma.stockMovement.create({
        data: {
          itemId: randomItem.id,
          kind: MovementKind.ADJUSTMENT,
          quantity: Math.floor(Math.random() * 5) + 1,
          locationId: locMain.id,
          reason: 'Routine cycle count adjustment',
          recordedById: manager.id,
        },
      });
    }
  }

  console.log('✓ ~50 Movements recorded');

  // 8. Generate Low Stock Alerts for items at or below reorder level
  for (const item of createdItems) {
    const movements = await prisma.stockMovement.findMany({ where: { itemId: item.id } });
    let totalOnHand = 0;
    for (const m of movements) {
      if (m.kind === 'RECEIPT' || m.kind === 'ADJUSTMENT') totalOnHand += m.quantity;
      if (m.kind === 'ISSUE') totalOnHand -= m.quantity;
    }

    if (totalOnHand <= item.reorderLevel) {
      await prisma.lowStockAlert.create({
        data: {
          itemId: item.id,
          lastTriggeredQuantity: totalOnHand,
          dismissedAt: null,
        },
      });
    }
  }

  // 9. Add Audit Logs & Item Notes
  await prisma.itemNote.create({
    data: {
      itemId: createdItems[0].id,
      userId: manager.id,
      content: 'Initial shipment inspected and verified.',
    },
  });

  await prisma.auditLog.create({
    data: {
      itemId: createdItems[0].id,
      userId: manager.id,
      field: 'reorderLevel',
      oldValue: '5',
      newValue: '10',
    },
  });

  console.log('✓ Audit logs & notes created');
  console.log('🚀 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
