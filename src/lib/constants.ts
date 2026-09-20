// =========================================================
// PRINTXO BOS - CENTRALIZED CONSTANTS & STATUS ENUMS
// =========================================================

export const COMPANY_DETAILS = {
  name: 'PRINTXO',
  legalName: 'PRINTXO Additive Technologies',
  tagline: 'Professional 3D Printing & Additive Manufacturing',
  email: 'printxo.studio@gmail.com',
  phone: '+91 98765 43210',
  address: 'Industrial Area, Phase II',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  pincode: '560058',
  gstEnabled: false, // User does not currently have GSTIN; toggleable via /settings
  gstin: '', // Blank until registered
  website: 'https://printxo.studio',
  logoUrl: '/logo.png',
  defaultCurrency: 'INR',
  currencySymbol: '₹',
};

// Module list for Sidebar & Command Center
export const NAVIGATION_MODULES = [
  { id: 'dashboard', name: 'Dashboard', path: '/', icon: 'LayoutDashboard', group: 'Overview' },
  { id: 'command-center', name: 'Command Center', path: '/command-center', icon: 'Zap', group: 'Overview' },
  
  { id: 'crm', name: 'CRM & Leads', path: '/crm', icon: 'Users', group: 'Sales & Commercial' },
  { id: 'customers', name: 'Customers', path: '/customers', icon: 'UserCheck', group: 'Sales & Commercial' },
  { id: 'quotes', name: 'Quotations', path: '/quotes', icon: 'FileText', group: 'Sales & Commercial' },
  { id: 'orders', name: 'Orders', path: '/orders', icon: 'ShoppingBag', group: 'Sales & Commercial' },
  { id: 'listings', name: 'Store Listings', path: '/listings', icon: 'Store', group: 'Sales & Commercial' },
  
  { id: 'production', name: 'Production', path: '/production', icon: 'Cpu', group: 'Manufacturing' },
  { id: 'products', name: 'Products & CAD', path: '/products', icon: 'Box', group: 'Manufacturing' },
  { id: 'printers', name: 'Printer Farm', path: '/printers', icon: 'Printer', group: 'Manufacturing' },
  { id: 'filament', name: 'Filament & Spools', path: '/filament', icon: 'Disc', group: 'Manufacturing' },
  { id: 'inventory', name: 'Inventory', path: '/inventory', icon: 'Layers', group: 'Manufacturing' },
  
  { id: 'quality', name: 'Quality / TQM', path: '/quality', icon: 'ShieldCheck', group: 'Quality & Engineering' },
  { id: 'calibrations', name: 'Calibrations', path: '/calibrations', icon: 'Gauge', group: 'Quality & Engineering' },
  { id: 'print-profiles', name: 'Print Profiles', path: '/print-profiles', icon: 'Sliders', group: 'Quality & Engineering' },
  { id: 'rnd', name: 'R&D / Labs', path: '/rnd', icon: 'FlaskConical', group: 'Quality & Engineering' },
  
  { id: 'shipping', name: 'Shipping', path: '/shipping', icon: 'Truck', group: 'Operations & Finance' },
  { id: 'finance', name: 'Finance & Invoices', path: '/finance', icon: 'CreditCard', group: 'Operations & Finance' },
  { id: 'tasks', name: 'Tasks', path: '/tasks', icon: 'CheckSquare', group: 'Operations & Finance' },
  { id: 'documents', name: 'Documents & SOPs', path: '/documents', icon: 'FolderArchive', group: 'Operations & Finance' },
  
  { id: 'analytics', name: 'Analytics', path: '/analytics', icon: 'BarChart3', group: 'Analytics' },
  { id: 'reports', name: 'Reports', path: '/reports', icon: 'PieChart', group: 'Analytics' },
  { id: 'settings', name: 'Settings', path: '/settings', icon: 'Settings', group: 'System' },
];

export const ORDER_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'neutral' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'info' },
  { value: 'IN_PRODUCTION', label: 'In Production', color: 'purple' },
  { value: 'READY', label: 'Ready', color: 'warning' },
  { value: 'DISPATCHED', label: 'Dispatched', color: 'info' },
  { value: 'DELIVERED', label: 'Delivered', color: 'success' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'danger' },
];

export const PRINT_JOB_STATUSES = [
  { value: 'QUEUED', label: 'Queued', color: 'neutral' },
  { value: 'SCHEDULED', label: 'Scheduled', color: 'info' },
  { value: 'PRINTING', label: 'Printing', color: 'purple' },
  { value: 'PAUSED', label: 'Paused', color: 'warning' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'FAILED', label: 'Failed', color: 'danger' },
  { value: 'REPRINT', label: 'Reprint', color: 'danger' },
];

export const PRINTER_STATUSES = [
  { value: 'AVAILABLE', label: 'Available', color: 'success' },
  { value: 'PRINTING', label: 'Printing', color: 'purple' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'warning' },
  { value: 'CALIBRATION', label: 'Calibration', color: 'info' },
  { value: 'OFFLINE', label: 'Offline', color: 'neutral' },
  { value: 'ERROR', label: 'Error', color: 'danger' },
];

export const FILAMENT_STATUSES = [
  { value: 'IN_STOCK', label: 'In Stock', color: 'success' },
  { value: 'OPENED', label: 'Opened', color: 'info' },
  { value: 'IN_USE', label: 'In Use', color: 'purple' },
  { value: 'LOW', label: 'Low (<200g)', color: 'warning' },
  { value: 'EMPTY', label: 'Empty', color: 'danger' },
  { value: 'DEFECTIVE', label: 'Defective', color: 'danger' },
];

export const DEFECT_CATALOG = [
  { id: 'LAYER_SHIFT', name: 'Layer Shift (X/Y axis desync)' },
  { id: 'WARPING', name: 'Bed Warping / Corner Lifting' },
  { id: 'STRINGING', name: 'Stringing / Oozing' },
  { id: 'UNDER_EXTRUSION', name: 'Under-extrusion / Missing layers' },
  { id: 'OVER_EXTRUSION', name: 'Over-extrusion / Blobs / Zits' },
  { id: 'POOR_ADHESION', name: 'First Layer / Bed Adhesion Failure' },
  { id: 'DIMENSIONAL', name: 'Dimensional Error / Out of Tolerance' },
  { id: 'SURFACE_DEFECT', name: 'Surface Roughness / Z-Banding' },
  { id: 'SUPPORT_FAILURE', name: 'Support Structure Collapse' },
  { id: 'CRACKING', name: 'Layer Delamination / Cracking' },
  { id: 'WEAK_PART', name: 'Poor Infill Bond / Weak Part' },
  { id: 'COLOR_ISSUE', name: 'Color Contamination / Discoloration' },
];

export const DEFAULT_PRICING_CONFIG = {
  electricityRatePerKwh: 9.5, // INR
  powerConsumptionWatts: 250, // Average 3D printer
  machineDepreciationPerHour: 45, // INR per hour based on 5000h lifetime
  laborRatePerHour: 180, // INR per hour
  defaultMarginPercent: 45, // 45% gross margin
  overheadPercent: 15, // 15% operational overhead
  defaultGstRate: 18, // 18% standard GST
};
