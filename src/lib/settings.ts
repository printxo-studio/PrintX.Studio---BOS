import { db } from './db';
import { COMPANY_DETAILS, DEFAULT_PRICING_CONFIG } from './constants';

export interface SystemSettings {
  // GST & Compliance
  gstEnabled: boolean;
  gstin: string;
  defaultGstRate: number;
  compositionScheme: boolean;
  invoicePrefix: string;
  invoiceTypeWithGst: string;
  invoiceTypeWithoutGst: string;
  taxExemptionNote: string;

  // Company Profile
  companyName: string;
  legalName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  website: string;
  logoUrl: string;

  // Costing & Pricing Engine
  electricityRatePerKwh: number;
  powerConsumptionWatts: number;
  machineDepreciationPerHour: number;
  laborRatePerHour: number;
  overheadPercent: number;
  defaultMarginPercent: number;

  // Currency
  defaultCurrency: string;
  currencySymbol: string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  // GST defaults to FALSE per user requirement (currently no GSTIN)
  gstEnabled: false,
  gstin: '',
  defaultGstRate: 18,
  compositionScheme: false,
  invoicePrefix: 'INV-2026-',
  invoiceTypeWithGst: 'TAX INVOICE',
  invoiceTypeWithoutGst: 'BILL OF SUPPLY / COMMERCIAL INVOICE',
  taxExemptionNote: 'Composition / Unregistered Supplier under GST Law — Not eligible to collect tax on supplies.',

  // Company Profile
  companyName: 'PRINTXO',
  legalName: 'PRINTXO Additive Technologies',
  tagline: 'Professional 3D Printing & Additive Manufacturing',
  email: 'printxo.studio@gmail.com',
  phone: '+91 98765 43210',
  address: 'Industrial Area, Phase II',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  pincode: '560058',
  website: 'https://printxo.studio',
  logoUrl: '/logo.png',

  // Pricing Engine
  electricityRatePerKwh: DEFAULT_PRICING_CONFIG.electricityRatePerKwh || 9.5,
  powerConsumptionWatts: DEFAULT_PRICING_CONFIG.powerConsumptionWatts || 250,
  machineDepreciationPerHour: DEFAULT_PRICING_CONFIG.machineDepreciationPerHour || 45,
  laborRatePerHour: DEFAULT_PRICING_CONFIG.laborRatePerHour || 180,
  overheadPercent: DEFAULT_PRICING_CONFIG.overheadPercent || 15,
  defaultMarginPercent: DEFAULT_PRICING_CONFIG.defaultMarginPercent || 45,

  // Currency
  defaultCurrency: 'INR',
  currencySymbol: '₹',
};

const SETTINGS_KEY = 'PRINTXO_SYSTEM_CONFIG';

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const record = await db.setting.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (!record || !record.value) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(record.value);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.error('Error reading system settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  try {
    const current = await getSystemSettings();
    const updated = { ...current, ...settings };

    await db.setting.upsert({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        value: JSON.stringify(updated),
        category: 'GENERAL',
        description: 'PRINTXO Master System Settings including GST Mode and Costing Constants',
      },
      update: {
        value: JSON.stringify(updated),
      },
    });

    return updated;
  } catch (error) {
    console.error('Error saving system settings:', error);
    throw error;
  }
}
