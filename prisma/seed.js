// =========================================================
// PRINTXO BOS - SEED DATA SCRIPT
// Section 56: Realistic Seed Data for full end-to-end testing
// =========================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PrintXO BOS database seeding...');

  // 1. Clean existing records (in reverse FK dependency order)
  console.log('Cleaning old data...');
  const models = [
    'auditLog', 'notification', 'sop', 'document', 'task',
    'inventoryItem', 'supplier', 'expense', 'payment', 'invoiceItem',
    'invoice', 'shipment', 'capa', 'defect', 'qualityInspection',
    'printJob', 'rndExperiment', 'rndProject', 'printProfile', 'calibration',
    'filamentSpool', 'material', 'printerMaintenance', 'printer', 'designFile',
    'productVersion', 'orderItem', 'order', 'quoteItem', 'quote',
    'complaint', 'lead', 'customer', 'product', 'user', 'setting',
  ];
  for (const m of models) {
    try {
      if (prisma[m]) await prisma[m].deleteMany();
    } catch (_) {}
  }

  // 2. Settings
  console.log('Seeding settings...');
  const settings = [
    { key: 'company_name', value: 'PRINTXO', category: 'GENERAL' },
    { key: 'company_email', value: 'printxo.studio@gmail.com', category: 'GENERAL' },
    { key: 'company_phone', value: '+91 98765 43210', category: 'GENERAL' },
    { key: 'company_gstin', value: '29ABCDE1234F1Z5', category: 'GENERAL' },
    { key: 'currency', value: 'INR', category: 'GENERAL' },
    { key: 'currency_symbol', value: '₹', category: 'GENERAL' },
    { key: 'machine_depreciation_rate', value: '45', category: 'PRICING' },
    { key: 'electricity_rate_kwh', value: '9.5', category: 'PRICING' },
    { key: 'labor_rate_hour', value: '180', category: 'PRICING' },
    { key: 'default_margin_percent', value: '45', category: 'PRICING' },
    { key: 'overhead_percent', value: '15', category: 'PRICING' },
    { key: 'default_gst_rate', value: '18', category: 'TAX' },
  ];
  for (const s of settings) {
    await prisma.setting.create({ data: s });
  }

  // 3. User (Owner)
  console.log('Seeding owner account...');
  const owner = await prisma.user.create({
    data: {
      email: 'printxo.studio@gmail.com',
      name: 'PrintXO Studio Owner',
      role: 'OWNER',
      phone: '+91 98765 43210',
    },
  });

  // 4. Materials
  console.log('Seeding materials...');
  const pla = await prisma.material.create({
    data: { code: 'PLA', name: 'Polylactic Acid', densityGPerCm3: 1.24, defaultPrintTemp: 215, defaultBedTemp: 55 },
  });
  const petg = await prisma.material.create({
    data: { code: 'PETG', name: 'Polyethylene Terephthalate Glycol', densityGPerCm3: 1.27, defaultPrintTemp: 240, defaultBedTemp: 80 },
  });
  const abs = await prisma.material.create({
    data: { code: 'ABS', name: 'Acrylonitrile Butadiene Styrene', densityGPerCm3: 1.04, defaultPrintTemp: 250, defaultBedTemp: 100 },
  });
  const tpu = await prisma.material.create({
    data: { code: 'TPU', name: 'Thermoplastic Polyurethane 95A', densityGPerCm3: 1.21, defaultPrintTemp: 225, defaultBedTemp: 45 },
  });
  const pacf = await prisma.material.create({
    data: { code: 'PA-CF', name: 'Carbon Fiber Nylon', densityGPerCm3: 1.15, defaultPrintTemp: 280, defaultBedTemp: 90 },
  });

  // 5. Printers (Print Farm)
  console.log('Seeding printer farm...');
  const prt1 = await prisma.printer.create({
    data: {
      printerCode: 'PRT-X1C-01',
      name: 'Bambu Lab X1-Carbon #1',
      manufacturer: 'Bambu Lab',
      model: 'X1-Carbon',
      serialNumber: 'BL-X1C-2025-081',
      location: 'Farm Rack 1 - Top',
      nozzleSize: 0.4,
      nozzleType: 'Hardened Steel',
      purchaseCost: 135000,
      status: 'PRINTING',
      totalPrintHours: 1420.5,
      totalJobs: 215,
      successfulJobs: 204,
      failedJobs: 11,
      maintenanceCost: 3200,
    },
  });

  const prt2 = await prisma.printer.create({
    data: {
      printerCode: 'PRT-P1S-02',
      name: 'Bambu Lab P1S #2',
      manufacturer: 'Bambu Lab',
      model: 'P1S',
      serialNumber: 'BL-P1S-2025-142',
      location: 'Farm Rack 1 - Middle',
      nozzleSize: 0.4,
      nozzleType: 'Stainless Steel',
      purchaseCost: 85000,
      status: 'AVAILABLE',
      totalPrintHours: 980.0,
      totalJobs: 140,
      successfulJobs: 135,
      failedJobs: 5,
      maintenanceCost: 1500,
    },
  });

  const prt3 = await prisma.printer.create({
    data: {
      printerCode: 'PRT-MK4-03',
      name: 'Original Prusa MK4 #1',
      manufacturer: 'Prusa Research',
      model: 'MK4',
      serialNumber: 'PR-MK4-2024-992',
      location: 'Farm Rack 2 - Bench',
      nozzleSize: 0.6,
      nozzleType: 'High Flow Brass',
      purchaseCost: 95000,
      status: 'AVAILABLE',
      totalPrintHours: 2140.0,
      totalJobs: 310,
      successfulJobs: 301,
      failedJobs: 9,
      maintenanceCost: 4800,
    },
  });

  const prt4 = await prisma.printer.create({
    data: {
      printerCode: 'PRT-K1M-04',
      name: 'Creality K1 Max (Large Format)',
      manufacturer: 'Creality',
      model: 'K1 Max',
      serialNumber: 'CR-K1M-2024-301',
      location: 'Farm Rack 2 - Floor',
      nozzleSize: 0.4,
      nozzleType: 'Hardened Bimetal',
      purchaseCost: 65000,
      status: 'MAINTENANCE',
      totalPrintHours: 850.0,
      totalJobs: 95,
      successfulJobs: 82,
      failedJobs: 13,
      maintenanceCost: 5200,
    },
  });

  // 6. Filament Spools
  console.log('Seeding filament spools...');
  const spool1 = await prisma.filamentSpool.create({
    data: {
      spoolCode: 'SPL-PLA-BLK-01',
      brand: 'Polymaker',
      material: 'PLA',
      series: 'PolyLite Pro',
      color: 'Matte Black',
      colorHex: '#18181b',
      diameter: 1.75,
      initialWeightG: 1000,
      currentWeightG: 720,
      usedWeightG: 280,
      wasteWeightG: 14,
      spoolCost: 1800,
      costPerGram: 1.8,
      supplier: 'MakerBazaar India',
      storageLocation: 'Drybox Rack A1',
      dryingStatus: 'DRIED',
      status: 'IN_USE',
    },
  });

  const spool2 = await prisma.filamentSpool.create({
    data: {
      spoolCode: 'SPL-PETG-GRY-02',
      brand: 'eSun',
      material: 'PETG',
      series: 'Solid Grey',
      color: 'Industrial Grey',
      colorHex: '#64748b',
      diameter: 1.75,
      initialWeightG: 1000,
      currentWeightG: 890,
      usedWeightG: 110,
      wasteWeightG: 5,
      spoolCost: 1600,
      costPerGram: 1.6,
      supplier: 'eSun India Store',
      storageLocation: 'Drybox Rack A2',
      dryingStatus: 'DRIED',
      status: 'IN_STOCK',
    },
  });

  const spool3 = await prisma.filamentSpool.create({
    data: {
      spoolCode: 'SPL-PACF-BLK-03',
      brand: 'Bambu Lab',
      material: 'PA-CF',
      series: 'Carbon Fiber High Temp',
      color: 'Carbon Black',
      colorHex: '#09090b',
      diameter: 1.75,
      initialWeightG: 1000,
      currentWeightG: 180,
      usedWeightG: 820,
      wasteWeightG: 45,
      spoolCost: 4500,
      costPerGram: 4.5,
      supplier: 'Bambu Lab Direct',
      storageLocation: 'Heated Dry Cabinet #1',
      dryingStatus: 'DRIED',
      status: 'LOW',
    },
  });

  const spool4 = await prisma.filamentSpool.create({
    data: {
      spoolCode: 'SPL-TPU-RED-04',
      brand: 'Numakers',
      material: 'TPU',
      series: 'Flexible 95A',
      color: 'Racing Red',
      colorHex: '#e11d48',
      diameter: 1.75,
      initialWeightG: 1000,
      currentWeightG: 950,
      usedWeightG: 50,
      wasteWeightG: 2,
      spoolCost: 2200,
      costPerGram: 2.2,
      supplier: 'Numakers Direct',
      storageLocation: 'Vacuum Seal Bag #4',
      dryingStatus: 'DRIED',
      status: 'IN_STOCK',
    },
  });

  // 7. Customers
  console.log('Seeding customers...');
  const cust1 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-AERO-01',
      name: 'Vikram Joshi',
      company: 'AeroDynamics Tech Pvt Ltd',
      customerType: 'B2B',
      phone: '+91 98450 11223',
      email: 'vikram@aerodynamicstech.in',
      address: 'Plot 45, Aerospace Park, Devanahalli',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '562110',
      gstin: '29AABCA9876Q1Z2',
      source: 'Referral',
      rating: 4.9,
      status: 'ACTIVE',
      notes: 'High precision engineering client. Prefers PA-CF and PETG parts with CMM reports.',
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-ROBO-02',
      name: 'Ananya Sharma',
      company: 'RoboMotion Automation',
      customerType: 'B2B',
      phone: '+91 99887 66554',
      email: 'ananya@robomotion.co',
      address: 'Survey 18, Electronic City Phase 1',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
      gstin: '29XYZPA5544B1ZX',
      source: 'Website',
      rating: 5.0,
      status: 'ACTIVE',
      notes: 'Regular batch orders of sensor mounts, cable organizers, and end-of-arm tooling brackets.',
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-STUD-03',
      name: 'Rahul Mehta',
      company: 'Studio K Architecture & Design',
      customerType: 'B2B',
      phone: '+91 97112 33445',
      email: 'rahul@studiokdesign.com',
      address: '4th Block, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      source: 'Instagram',
      rating: 4.6,
      status: 'ACTIVE',
      notes: 'Architectural scale models and organic decorative fixtures. Requires fine layer heights (0.12 - 0.16mm).',
    },
  });

  // 8. Leads
  console.log('Seeding CRM leads...');
  await prisma.lead.create({
    data: {
      leadCode: 'LEAD-2026-001',
      name: 'Karthik Rao',
      company: 'MedDevices Innovations',
      phone: '+91 98800 55443',
      email: 'karthik@meddev.in',
      source: 'WEBSITE',
      requirement: 'Custom casing for handheld diagnostic device, 50 units in medical white PETG.',
      budget: 45000,
      productInterest: 'Custom Enclosure',
      status: 'QUALIFIED',
      priority: 'HIGH',
      owner: 'PrintXO Studio Owner',
    },
  });

  await prisma.lead.create({
    data: {
      leadCode: 'LEAD-2026-002',
      name: 'Deepak Verma',
      company: 'Indie Drone Racing',
      phone: '+91 91234 56789',
      email: 'deepak@fpvracing.club',
      source: 'SOCIAL',
      requirement: 'Lightweight carbon fiber nylon TPU hybrid canopy mounts for 5-inch freestyle drone.',
      budget: 15000,
      productInterest: 'Drone Canopy Parts',
      status: 'NEGOTIATION',
      priority: 'MEDIUM',
      owner: 'PrintXO Studio Owner',
    },
  });

  // 9. Calibrations & Print Profiles
  console.log('Seeding engineering calibrations & profiles...');
  const calib1 = await prisma.calibration.create({
    data: {
      calibrationCode: 'CAL-X1C-PACF-01',
      printerId: prt1.id,
      material: 'PA-CF',
      brand: 'Bambu Lab',
      nozzleSize: 0.4,
      calibrationType: 'PRESSURE_ADVANCE',
      parameterName: 'k-factor',
      previousValue: '0.035',
      testValue: '0.028',
      measuredValue: '0.028',
      recommendedValue: '0.028',
      tolerance: '±0.002',
      result: 'PASSED',
      operator: 'PrintXO Studio Owner',
      approvalStatus: 'APPROVED',
      approvedBy: 'Lead Engineer',
    },
  });

  const profile1 = await prisma.printProfile.create({
    data: {
      profileCode: 'PRF-X1C-PACF-HIGH-STRENGTH',
      name: 'Bambu X1C PA-CF High Strength Functional',
      printerModel: 'Bambu Lab X1-Carbon',
      material: 'PA-CF',
      nozzleSize: 0.4,
      layerHeight: 0.16,
      wallLoops: 5,
      topLayers: 5,
      bottomLayers: 4,
      infillPercent: 40,
      infillPattern: 'Gyroid',
      printSpeed: 120,
      nozzleTemp: 285,
      bedTemp: 90,
      coolingFanSpeed: 40,
      calibrationId: calib1.id,
      status: 'APPROVED',
      approvedBy: 'PrintXO Studio Owner',
      totalPrints: 48,
      successfulPrints: 46,
      failedPrints: 2,
    },
  });

  // 9b. R&D Experiment
  console.log('Seeding R&D lab experiment...');
  await prisma.rndExperiment.create({
    data: {
      experimentCode: 'EXP-2026-0001',
      title: 'Carbon Fiber Interlayer Annealing & Tensile Strength Trial',
      objective: 'Increase Z-axis layer tensile strength from 28 MPa to >45 MPa using high-temperature convection annealing.',
      hypothesis: 'Baking printed PA-CF components at 130°C for 4 hours will relax internal residual stresses and induce secondary polymer crystallization.',
      productId: null,
      material: 'PA-CF',
      printProfileId: profile1.id,
      calibrationId: calib1.id,
      variablesTested: 'Annealing temperature (110°C, 130°C, 150°C) and ramp-down cooling rate.',
      controlValues: 'Unannealed as-printed tensile bar: 28.4 MPa yield strength.',
      testValues: '130°C for 4h followed by 0.5°C/min slow chamber cooling.',
      measurements: 'Measured yield tensile strength: 49.2 MPa (+73% increase). Dimensional shrinkage: 0.4% in X/Y, 0.2% in Z.',
      resultsSummary: 'Exceeded target strength. Zero visual warping or surface blister formation.',
      failureOccurred: false,
      cost: 3450,
      conclusion: 'Protocol validated. Mandatory for all aerospace drone components before delivery.',
      recommendedSettings: 'Oven: 130°C | Dwell: 240 mins | Cooling: Chamber slow cool to <50°C',
      status: 'VALIDATED',
    },
  });

  // 10. Products
  console.log('Seeding product master...');
  const prod1 = await prisma.product.create({
    data: {
      sku: 'PRX-AERO-ARM-V1',
      name: 'Carbon Fiber Quadcopter Motor Arm',
      category: 'Functional / Aerospace',
      productType: 'STANDARD',
      description: 'Heavy duty high stiffness motor arm for industrial surveillance quadcopters.',
      status: 'ACTIVE',
      currentVersion: '1.2',
      materialName: 'PA-CF',
      recommendedPrinter: 'Bambu Lab X1-Carbon',
      nozzleSize: 0.4,
      layerHeight: 0.16,
      infillPercent: 45,
      wallCount: 5,
      standardPrintTimeHours: 3.5,
      standardFilamentGrams: 85,
      sellingPrice: 1650,
      productionCost: 620,
      estimatedMargin: 62.4,
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      sku: 'PRX-ROBO-BRK-V2',
      name: 'Dual Sensor Mounting Bracket',
      category: 'Robotics & Automation',
      productType: 'STANDARD',
      description: 'Adjustable bracket for optical and ultrasonic sensors on factory floor AGVs.',
      status: 'ACTIVE',
      currentVersion: '2.0',
      materialName: 'PETG',
      recommendedPrinter: 'Bambu Lab P1S',
      nozzleSize: 0.4,
      layerHeight: 0.2,
      infillPercent: 30,
      wallCount: 4,
      standardPrintTimeHours: 2.2,
      standardFilamentGrams: 55,
      sellingPrice: 750,
      productionCost: 280,
      estimatedMargin: 62.6,
    },
  });

  // 11. Quotes & Orders
  console.log('Seeding quotes and orders...');
  const quote1 = await prisma.quote.create({
    data: {
      quoteNumber: 'QTE-2026-0082',
      customerId: cust1.id,
      date: new Date(Date.now() - 7 * 86400000),
      validUntil: new Date(Date.now() + 23 * 86400000),
      preparedBy: 'PrintXO Studio Owner',
      currency: 'INR',
      status: 'CONVERTED',
      materialCost: 2480,
      printCost: 2100,
      postProcessCost: 400,
      shippingCost: 350,
      subtotal: 6600,
      taxRate: 18.0,
      taxAmount: 1188,
      grandTotal: 7788,
      estimatedCost: 3200,
      estimatedProfit: 3400,
      marginPercent: 51.5,
    },
  });

  await prisma.quoteItem.create({
    data: {
      quoteId: quote1.id,
      productId: prod1.id,
      name: 'Carbon Fiber Quadcopter Motor Arm',
      quantity: 4,
      unitPrice: 1650,
      lineTotal: 6600,
      material: 'PA-CF',
      printTimeHours: 14.0,
      filamentGrams: 340,
    },
  });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-0045',
      customerId: cust1.id,
      quoteId: quote1.id,
      orderDate: new Date(Date.now() - 5 * 86400000),
      dueDate: new Date(Date.now() + 3 * 86400000),
      priority: 'HIGH',
      subtotal: 6600,
      taxAmount: 1188,
      shippingCost: 350,
      totalAmount: 8138,
      paymentStatus: 'PAID',
      productionStatus: 'IN_PROGRESS',
      qcStatus: 'PENDING',
      shippingStatus: 'PENDING',
      overallStatus: 'IN_PRODUCTION',
      shippingAddress: 'Plot 45, Aerospace Park, Devanahalli, Bangalore 562110',
      notes: 'Customer requested dimensional inspection certificate with shipment.',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: prod1.id,
      name: 'Carbon Fiber Quadcopter Motor Arm',
      sku: 'PRX-AERO-ARM-V1',
      quantity: 4,
      unitPrice: 1650,
      lineTotal: 6600,
      producedQty: 2,
      qcPassedQty: 2,
    },
  });

  // 12. Print Jobs
  console.log('Seeding print jobs...');
  const job1 = await prisma.printJob.create({
    data: {
      jobCode: 'JOB-2026-0112',
      orderId: order1.id,
      productId: prod1.id,
      printerId: prt1.id,
      filamentSpoolId: spool3.id,
      printProfileId: profile1.id,
      calibrationId: calib1.id,
      operator: 'PrintXO Studio Owner',
      quantity: 2,
      estimatedTimeHours: 7.0,
      actualTimeHours: 6.8,
      estimatedFilamentG: 170,
      actualFilamentG: 168,
      wasteFilamentG: 6,
      startedAt: new Date(Date.now() - 20 * 3600000),
      completedAt: new Date(Date.now() - 13 * 3600000),
      status: 'COMPLETED',
      result: 'SUCCESS',
      qcStatus: 'PASSED',
    },
  });

  const job2 = await prisma.printJob.create({
    data: {
      jobCode: 'JOB-2026-0113',
      orderId: order1.id,
      productId: prod1.id,
      printerId: prt1.id,
      filamentSpoolId: spool3.id,
      printProfileId: profile1.id,
      calibrationId: calib1.id,
      operator: 'PrintXO Studio Owner',
      quantity: 2,
      estimatedTimeHours: 7.0,
      estimatedFilamentG: 170,
      startedAt: new Date(Date.now() - 2 * 3600000),
      status: 'PRINTING',
      qcStatus: 'PENDING',
    },
  });

  // 13. Quality Inspection & TQM
  console.log('Seeding QC inspections, defects, complaints, and CAPA...');
  const qc1 = await prisma.qualityInspection.create({
    data: {
      qcCode: 'QC-2026-0091',
      orderId: order1.id,
      productId: prod1.id,
      printJobId: job1.id,
      inspector: 'PrintXO Studio Owner',
      inspectionStage: 'FINAL',
      specification: 'Arm center hole diameter: 22.00mm ± 0.08mm',
      requiredValue: '22.00mm',
      actualValue: '22.03mm',
      tolerance: '±0.08mm',
      result: 'PASSED',
      severity: 'MINOR',
      reworkRequired: false,
      reprintRequired: false,
      notes: 'Clean layer bonding, no delamination or corner warping.',
    },
  });

  const qc2 = await prisma.qualityInspection.create({
    data: {
      qcCode: 'QC-2026-0092',
      orderId: order1.id,
      productId: prod1.id,
      inspector: 'PrintXO Quality Inspector',
      inspectionStage: 'IN_PROCESS',
      specification: 'Overhang Angle & Layer Consistency at 60°',
      requiredValue: 'No drooping / sagging',
      actualValue: 'Corner lifting and warping by 1.2mm',
      tolerance: '0.2mm max deflection',
      result: 'FAILED',
      severity: 'MAJOR',
      defectType: 'WARPING',
      rootCause: 'Drafts in room caused bed corner cooling below glass transition.',
      correctiveAction: 'Enclose printer chamber and raise bed temp to 95°C for first 5 layers.',
      preventiveAction: 'Mandate draft shield on slicer profile when ambient temp < 22°C.',
      reworkRequired: false,
      reprintRequired: true,
      notes: 'Scrapped part. Auto-logged reprint job.',
    },
  });

  await prisma.defect.create({
    data: {
      inspectionId: qc2.id,
      defectType: 'WARPING',
      description: 'Bed corner lifted by 1.2mm causing dimensional warp on quadcopter arm.',
      severity: 'MAJOR',
      costImpact: 620,
    },
  });

  await prisma.defect.create({
    data: {
      defectType: 'STRINGING',
      description: 'Minor wisps of filament across travel moves on retraction test.',
      severity: 'MINOR',
      costImpact: 150,
    },
  });

  await prisma.defect.create({
    data: {
      defectType: 'LAYER_SHIFT',
      description: 'X-axis belt slip causing 0.8mm step at Z=45mm.',
      severity: 'CRITICAL',
      costImpact: 980,
    },
  });

  const cmp1 = await prisma.complaint.create({
    data: {
      complaintCode: 'CMP-2026-001',
      customerId: cust1.id,
      orderId: order1.id,
      productId: prod1.id,
      issueTitle: 'Slight hole undersizing on mounting boss',
      severity: 'HIGH',
      description: 'Customer found that M3 heat-set insert hole was 3.8mm instead of required 4.0mm, requiring manual reaming before assembly.',
      status: 'INVESTIGATING',
      owner: 'PrintXO Quality Lead',
      notes: 'Inspecting XY hole shrinkage compensation in active Bambu profile.',
    },
  });

  await prisma.capa.create({
    data: {
      capaCode: 'CAPA-2026-001',
      complaintId: cmp1.id,
      qcInspectionId: qc2.id,
      problemStatement: 'M3 heat-set insert holes printed 0.2mm undersized due to thermal shrinkage in PA-CF material.',
      containmentAction: 'Ream all parts in current batch using calibrated 4.05mm hand reamer before packing.',
      rootCauseMethod: '5_WHY',
      rootCauseAnalysis: `Why 1: Hole was undersized by 0.2mm.
Why 2: Filament shrunk during high-temp crystallization.
Why 3: Slicer XY hole compensation was set to 0.0mm.
Why 4: Standard profile was cloned from PLA without adjusting hole shrinkage.
Why 5: Lack of material-specific design rule check in pre-flight SOP.`,
      correctiveAction: 'Apply +0.15mm X-Y Hole Compensation in PRF-X1C-PACF-HIGH-STRENGTH profile.',
      preventiveAction: 'Add Mandatory Hole Tolerance Calibration block check to SOP-PRT-001 for all carbon fiber engineering resins.',
      owner: 'PrintXO Quality Lead',
      dueDate: new Date(Date.now() + 5 * 86400000),
      verificationMethod: 'Print 5 test blocks with 4.0mm holes and measure with bore pin gauges.',
      status: 'IN_PROGRESS',
      notes: 'Test coupon batch queued on Printer #1.',
    },
  });

  // 14. Invoices & Payments
  console.log('Seeding invoice and payments...');
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0041',
      orderId: order1.id,
      customerId: cust1.id,
      billingAddress: 'Plot 45, Aerospace Park, Devanahalli, Bangalore 562110',
      shippingAddress: 'Plot 45, Aerospace Park, Devanahalli, Bangalore 562110',
      gstin: '29AABCA9876Q1Z2',
      invoiceDate: new Date(Date.now() - 4 * 86400000),
      dueDate: new Date(Date.now() + 10 * 86400000),
      subtotal: 6600,
      taxableAmount: 6600,
      cgstAmount: 594, // 9%
      sgstAmount: 594, // 9%
      shippingAmount: 350,
      grandTotal: 8138,
      amountPaid: 8138,
      balanceDue: 0,
      status: 'PAID',
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: inv1.id,
      description: 'High Stiffness Carbon Fiber Drone Motor Arm (PRX-AERO-ARM-V1)',
      hsnSacCode: '8477',
      quantity: 4,
      rate: 1650,
      taxRate: 18.0,
      amount: 6600,
    },
  });

  await prisma.payment.create({
    data: {
      paymentCode: 'PAY-2026-0038',
      invoiceId: inv1.id,
      customerId: cust1.id,
      amount: 8138,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI/20260912/9821389102',
      status: 'CONFIRMED',
      notes: 'Full payment received via Google Pay / UPI',
    },
  });

  // 15. Expenses
  console.log('Seeding expenses...');
  await prisma.expense.create({
    data: {
      expenseCode: 'EXP-2026-0012',
      expenseDate: new Date(Date.now() - 10 * 86400000),
      category: 'FILAMENT',
      description: 'Purchase of 3x Bambu Lab PA-CF Spools and 2x Polymaker PLA',
      supplierName: 'MakerBazaar India',
      amount: 17100,
      taxAmount: 2608,
      paymentMethod: 'UPI',
      referenceNumber: 'MB-INV-88912',
    },
  });

  await prisma.expense.create({
    data: {
      expenseCode: 'EXP-2026-0013',
      expenseDate: new Date(Date.now() - 15 * 86400000),
      category: 'ELECTRICITY',
      description: 'Monthly Workshop Electricity Bill - BESCOM Commercial',
      supplierName: 'BESCOM Bangalore',
      amount: 4850,
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: 'BESCOM-SEP-2026',
    },
  });

  // 16. SOPs & Knowledge Base
  console.log('Seeding standard operating procedures...');
  await prisma.sop.create({
    data: {
      sopCode: 'SOP-PRT-001',
      title: 'PA-CF Material Preparation & Printing Protocol',
      category: 'PRINTING',
      purpose: 'Ensure zero moisture and optimal interlayer adhesion when printing Carbon Fiber Nylon.',
      procedureSteps: `1. Bake spool in heated dryer at 80°C for at least 8 hours prior to print.
2. Confirm ambient humidity in enclosure is below 15% RH.
3. Install 0.4mm Hardened Steel or Ruby nozzle (do NOT use brass).
4. Apply liquid glue / PVP adhesive layer to engineering build plate.
5. Set nozzle temperature to 285°C and bed to 90°C.
6. Verify first layer slow speed is capped at 40mm/s.`,
      requiredTools: 'Filament Dryer Box, 0.4mm Hardened Steel Nozzle, Liquid Glue Stick, Digital Calipers',
      parameters: 'Nozzle: 285°C | Bed: 90°C | Enclosure: >40°C | Chamber Fan: OFF',
      qualityCriteria: 'No visible layer voids, 100% fill density on mounting lugs, tolerance ±0.1mm',
      owner: 'PrintXO Studio Owner',
      approvalStatus: 'APPROVED',
      approvedBy: 'Lead Engineer',
    },
  });

  // 17. Tasks
  console.log('Seeding operational tasks...');
  await prisma.task.create({
    data: {
      title: 'Run First Layer Calibration on Prusa MK4 #1',
      description: 'After installing new 0.6mm brass nozzle, re-calibrate live-Z offset and mesh bed leveling.',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 2 * 86400000),
      printerId: prt3.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Dispatch Order ORD-2026-0045 with QC Report',
      description: 'Pack 4x Carbon Fiber quadcopter arms in anti-static bubble wrap and enclose signed inspection certificate.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 3 * 86400000),
      orderId: order1.id,
    },
  });

  // 17b. Shipments
  console.log('Seeding shipment and waybills...');
  await prisma.shipment.create({
    data: {
      shipmentCode: 'SHP-2026-0038',
      orderId: order1.id,
      courierName: 'Delhivery Express',
      trackingNumber: 'DEL-9928172635',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL-9928172635',
      shipDate: new Date(Date.now() - 1 * 86400000),
      expectedDelivery: new Date(Date.now() + 2 * 86400000),
      shippingCost: 350,
      status: 'IN_TRANSIT',
      notes: 'Carbon Fiber Quadcopter Motor Arms packaged in anti-static 3-ply corrugated box.',
    },
  });

  // 18. Suppliers & Workshop Inventory
  console.log('Seeding suppliers and workshop inventory...');
  const sup1 = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-001',
      name: 'MakerBazaar India',
      contactPerson: 'Arun Kumar',
      email: 'sales@makerbazaar.in',
      phone: '+91 98450 11223',
      address: 'SP Road Electronics Market, Bangalore 560002',
      gstin: '29AABCM5432R1Z8',
      category: 'Filament & Spares',
      rating: 4.8,
      leadTimeDays: 2,
      paymentTerms: 'Net 15',
      notes: 'Primary supplier for Polymaker & eSun spools, nozzles, and stepper motors.',
    },
  });

  const sup2 = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-002',
      name: 'Bambu Lab Direct Store',
      contactPerson: 'Enterprise Support',
      email: 'enterprise@bambulab.com',
      phone: '+91 80 4000 5500',
      category: 'OEM Parts & High Performance Polymers',
      rating: 5.0,
      leadTimeDays: 5,
      paymentTerms: 'Prepaid / Credit Card',
      notes: 'Original Bambu Lab X1C accessories, PEI plates, and PA-CF filament.',
    },
  });

  const sup3 = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-003',
      name: 'PackWell Solutions',
      contactPerson: 'Ramesh Patel',
      email: 'orders@packwell.in',
      phone: '+91 99001 77889',
      address: 'Peenya Industrial Area, Bangalore 560058',
      category: 'Packaging',
      rating: 4.6,
      leadTimeDays: 1,
      paymentTerms: 'Net 30',
      notes: 'Custom corrugated boxes, bubble wrap rolls, and silica gel desiccant packs.',
    },
  });

  // Workshop Inventory Items
  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-NOZ-04H',
      itemName: '0.4mm Hardened Steel Nozzle (Bambu X1C / P1S)',
      category: 'NOZZLES',
      quantity: 6,
      unit: 'PCS',
      unitCost: 1450,
      totalValue: 8700,
      reorderLevel: 3,
      storageLocation: 'Bench A - Drawer 1',
      supplierId: sup2.id,
      status: 'IN_STOCK',
      notes: 'High wear resistance for carbon fiber and abrasive filaments.',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-NOZ-06B',
      itemName: '0.6mm High Flow Brass Nozzle (V6 / Prusa MK4)',
      category: 'NOZZLES',
      quantity: 2,
      unit: 'PCS',
      unitCost: 650,
      totalValue: 1300,
      reorderLevel: 4,
      storageLocation: 'Bench A - Drawer 1',
      supplierId: sup1.id,
      status: 'LOW_STOCK',
      notes: 'High volume rapid prototyping nozzle. Low stock - reorder pending.',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-PLT-PEI',
      itemName: 'Double-Sided Textured PEI Build Plate (256x256mm)',
      category: 'BUILD_PLATES',
      quantity: 3,
      unit: 'PCS',
      unitCost: 2800,
      totalValue: 8400,
      reorderLevel: 2,
      storageLocation: 'Rack 1 - Plate Holder',
      supplierId: sup2.id,
      status: 'IN_STOCK',
      notes: 'Standard bed for PLA, PETG, ABS printing.',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-CHM-IPA',
      itemName: 'Isopropyl Alcohol 99.9% (IPA Bed Cleaner)',
      category: 'CHEMICALS',
      quantity: 1,
      unit: 'LITRES',
      unitCost: 420,
      totalValue: 420,
      reorderLevel: 3,
      storageLocation: 'Chemical Flammable Cabinet',
      supplierId: sup1.id,
      status: 'CRITICAL',
      notes: 'Crucial for first-layer bed degreasing before every print.',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-CON-GLU',
      itemName: 'Magigoo 3D Bed Adhesive Stick (50ml)',
      category: 'CONSUMABLES',
      quantity: 4,
      unit: 'PCS',
      unitCost: 1250,
      totalValue: 5000,
      reorderLevel: 2,
      storageLocation: 'Bench B - Shelf 2',
      supplierId: sup1.id,
      status: 'IN_STOCK',
      notes: 'Prevents warping on PA-CF, ABS, and PC prints.',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-PKG-BOX-M',
      itemName: 'Corrugated Shipping Boxes (250x200x150mm - 3 Ply)',
      category: 'PACKAGING',
      quantity: 45,
      unit: 'PCS',
      unitCost: 28,
      totalValue: 1260,
      reorderLevel: 20,
      storageLocation: 'Packaging Station - Lower Shelf',
      supplierId: sup3.id,
      status: 'IN_STOCK',
      notes: 'Standard box for client part deliveries.',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-PKG-BUB',
      itemName: 'Anti-Static Bubble Wrap Roll (100m x 0.5m)',
      category: 'PACKAGING',
      quantity: 2,
      unit: 'ROLLS',
      unitCost: 950,
      totalValue: 1900,
      reorderLevel: 1,
      storageLocation: 'Packaging Station',
      supplierId: sup3.id,
      status: 'IN_STOCK',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      sku: 'INV-SPR-BLT-GT2',
      itemName: 'Gates GT2 6mm Timing Belt (5 Meters)',
      category: 'SPARE_PARTS',
      quantity: 0,
      unit: 'PCS',
      unitCost: 550,
      totalValue: 0,
      reorderLevel: 2,
      storageLocation: 'Maintenance Spare Bin 3',
      supplierId: sup1.id,
      status: 'OUT_OF_STOCK',
      notes: 'Used for X/Y gantry maintenance. Currently out of stock.',
    },
  });

  // 19. Notifications
  console.log('Seeding notifications...');
  await prisma.notification.create({
    data: {
      type: 'LOW_STOCK',
      title: 'Low Filament Alert',
      message: 'Filament spool SPL-PACF-BLK-03 (Bambu Lab PA-CF) has only 180g remaining. Reorder recommended.',
      entityType: 'FilamentSpool',
      entityId: spool3.id,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'ORDER_OVERDUE',
      title: 'Upcoming Order Deadline',
      message: 'Order ORD-2026-0045 for AeroDynamics Tech is due in 3 days. Production is 50% complete.',
      entityType: 'Order',
      entityId: order1.id,
      isRead: false,
    },
  });

  console.log('✅ PrintXO BOS seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
