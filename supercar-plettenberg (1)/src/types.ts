export type VehicleStatus = 'Available' | 'Reserved' | 'On Display' | 'Just Sold';

export interface VehicleSpecs {
  horsepower: number;
  acceleration?: string; // e.g. "6.5s (0-100)"
  engine: string; // e.g. "2.0L Turbo"
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  mileage: number; // in km
  year: number;
  owners: number;
}

export interface CustomizerColor {
  id: string;
  name: string;
  hex: string;
  extraCost: number;
}

export interface CustomizerWheel {
  id: string;
  name: string;
  extraCost: number;
  imageSize: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  trim: string;
  price: number;
  status: VehicleStatus;
  viewersCount: number;
  image: string;
  gallery: string[];
  specs: VehicleSpecs;
  features: string[];
  description: string;
  mobileDeUrl?: string;
  customizerColors?: CustomizerColor[];
  customizerWheels?: CustomizerWheel[];
}

export interface BookingDetails {
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  note?: string;
}
