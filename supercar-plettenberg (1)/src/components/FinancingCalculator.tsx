import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Landmark, Percent, CalendarRange, HelpCircle, Car } from 'lucide-react';
import { Vehicle } from '../types';

interface FinancingCalculatorProps {
  vehiclePrice: number;
  vehicles?: Vehicle[];
  selectedVehicleId?: string;
  onVehicleChange?: (id: string) => void;
}

export default function FinancingCalculator({
  vehiclePrice,
  vehicles,
  selectedVehicleId,
  onVehicleChange,
}: FinancingCalculatorProps) {
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.23));
  const [termMonths, setTermMonths] = useState(48);
  const [apr, setApr] = useState(4.9);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // Sync down payment when vehicle price changes to prevent out of bounds
  useEffect(() => {
    setDownPayment(Math.round(vehiclePrice * 0.25));
  }, [vehiclePrice]);

  useEffect(() => {
    const principal = vehiclePrice - downPayment;
    const monthlyRate = apr / 100 / 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / termMonths);
      setTotalInterest(0);
      setTotalCost(vehiclePrice);
      return;
    }
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    const total = payment * termMonths;
    const interest = total - principal;

    setMonthlyPayment(Math.round(payment));
    setTotalInterest(Math.round(interest));
    setTotalCost(Math.round(total + downPayment));
  }, [vehiclePrice, downPayment, termMonths, apr]);

  const maxDownPayment = Math.round(vehiclePrice * 0.85);

  return (
    <div id="finance-calc" className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 text-slate-950 relative shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
         <div>
          <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-[#0a1d37] uppercase">
            FINANZIERUNGS-RECHNER
          </span>
          <h4 className="text-xl md:text-2xl font-black font-sans mt-1 text-[#0a1d37]">Kalkulations-Assistent</h4>
          <p className="text-xs text-slate-500 mt-0.5">Passen Sie Ihre Konditionen an, um Ihre monatliche Finanzierungsrate zu berechnen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Sliders Input Segment (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Vehicle Dropdown Selector */}
          {vehicles && vehicles.length > 0 && (
            <div id="finance-vehicle-select-container" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <label htmlFor="finance-vehicle-select" className="text-slate-600 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 focus:text-[#0a1d37]">
                <Car className="w-3.5 h-3.5 text-[#0a1d37]" /> Ausgewähltes Fahrzeug:
              </label>
              <select
                id="finance-vehicle-select"
                value={selectedVehicleId || ''}
                onChange={(e) => onVehicleChange && onVehicleChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-[#0a1d37] transition font-bold"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.price.toLocaleString()} €)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sliders Item 1: Down Payment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#0a1d37]" /> Höhe der Anzahlung
              </span>
              <span className="font-mono text-[#0a1d37] font-bold">
                €{downPayment.toLocaleString()} <span className="text-slate-400 font-normal">({Math.round((downPayment / vehiclePrice) * 100)}%)</span>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxDownPayment}
              step={500}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-[#0a1d37] h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>€0</span>
              <span>MAX. ANZAHLUNG (€{(maxDownPayment).toLocaleString()})</span>
            </div>
          </div>

          {/* Sliders Item 2: Term in Months */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-[#0a1d37]" /> Laufzeit in Monaten
              </span>
              <span className="font-mono text-[#0a1d37] font-bold">{termMonths} Monate</span>
            </div>
            <input
              type="range"
              min={12}
              max={72}
              step={12}
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full accent-[#0a1d37] h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 Jahr</span>
              <span>3 Jahre</span>
              <span>5 Jahre</span>
              <span>6 Jahre</span>
            </div>
          </div>

          {/* Sliders Item 3: APR */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#0a1d37]" /> Effektiver Jahreszins
              </span>
              <span className="font-mono text-[#0a1d37] font-bold">{apr}% p.a.</span>
            </div>
            <input
              type="range"
              min={1.9}
              max={9.9}
              step={0.1}
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
              className="w-full accent-[#0a1d37] h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Sonderzins (1.9%)</span>
              <span>Mittelwert (5.9%)</span>
              <span>Standard (9.9%)</span>
            </div>
          </div>
        </div>

        {/* Calculation Visual Summary (5 Cols) */}
        <div className="md:col-span-12 lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm">
          <div className="text-center md:text-left">
            <span className="text-[8px] font-mono font-bold uppercase text-slate-500 tracking-[0.15em]">
              GESCHÄTZTE MONATSRATE:
            </span>
            <div id="calc-monthly-payment" className="text-3xl lg:text-4xl font-black text-[#0a1d37] font-mono mt-1 tracking-tight">
              €{monthlyPayment.toLocaleString()}<span className="text-xs font-normal text-slate-500 select-none">/mtl.</span>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-2.5 text-xs font-medium">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-slate-400" /> Fahrzeugpreis:</span>
              <span className="font-mono font-bold text-[#0a1d37]">€{vehiclePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Einmalige Anzahlung:</span>
              <span className="font-mono text-slate-900 border-b border-dotted border-slate-300">€{downPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Nettodarlehensbetrag:</span>
              <span className="font-mono text-slate-900">€{(vehiclePrice - downPayment).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Erwartete Zinskosten:</span>
              <span className="font-mono text-slate-900">€{totalInterest.toLocaleString()}</span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between text-sm pt-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Gesamtkosten (geschätzt):</span>
              <span className="font-mono font-bold text-[#0a1d37] text-sm">€{totalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-[9px] text-slate-500 text-center leading-normal">
            * Unverbindliche Berechnungen. Vorbehaltlich Bonitätsprüfung, Einreichung vollständiger Unterlagen und Zwischenverkauf vorbehalten.
          </div>
        </div>
      </div>
    </div>
  );
}
