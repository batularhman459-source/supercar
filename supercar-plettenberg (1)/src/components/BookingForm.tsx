import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Sparkles, User, Mail, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../types';

interface BookingFormProps {
  vehicles: Vehicle[];
  initialVehicleId?: string;
  onSuccessClose?: () => void;
}

const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];

export default function BookingForm({ vehicles, initialVehicleId = '', onSuccessClose }: BookingFormProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId || vehicles[0]?.id || '');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Generate next 7 days dynamically starting from today
  const getDaysArray = () => {
    const days = [];
    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Skip Sundays for visits
      if (date.getDay() === 0) {
        date.setDate(date.getDate() + 1);
        i++;
      }

      days.push({
        weekday: weekdays[date.getDay()],
        dayNum: date.getDate(),
        month: months[date.getMonth()],
        fullString: date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      });
    }
    return days.slice(0, 6); // Take exactly 6 pristine slots
  };

  const daysList = getDaysArray();
  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setIsSubmitting(true);

    // Simulate luxury API submission delay
    setTimeout(() => {
      const randomCode = `SC-${Math.floor(1000 + Math.random() * 9000)}-${daysList[selectedDayIndex].dayNum}`;
      setBookingRef(randomCode);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div id="booking-panel" className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 lg:p-8 max-w-4xl mx-auto shadow-xl relative">
      <AnimatePresence mode="wait">
        {!bookingRef ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            {/* Header */}
            <div className="mb-6">
              <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-[#0a1d37] uppercase flex items-center gap-1.5 justify-center md:justify-start">
                <Sparkles className="w-3.5 h-3.5 text-[#0a1d37]" /> PRÄSENTATIONSTERMIN & PROBEFAHRT SOWIE BERATUNG
              </span>
              <h3 className="text-2xl font-black font-sans mt-1.5 text-center md:text-left text-[#0a1d37]">Präsentationstermin vereinbaren</h3>
              <p className="text-xs text-slate-500 mt-1 text-center md:text-left">
                Planen Sie eine exklusive persönliche Besichtigung Ihres Wunschmodells bei uns vor Ort in Plettenberg.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: Vehicle Selection & Calendar */}
                <div className="space-y-5">
                  {/* Select Vehicle */}
                  <div className="space-y-2">
                    <label htmlFor="booking-vehicle-select" className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                      Gewünschtes Fahrzeug
                    </label>
                    <select
                      id="booking-vehicle-select"
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-900 focus:outline-none focus:border-[#0a1d37] transition cursor-pointer font-medium"
                      required
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id} className="text-slate-900 bg-white">
                          {v.brand} {v.model} - €{v.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Calendar Dates Slider */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                      Wunschtermin wählen
                    </label>
                    <div id="booking-days-grid" className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {daysList.map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDayIndex(idx)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition duration-300 cursor-pointer ${
                            selectedDayIndex === idx
                              ? 'bg-[#0a1d37] border-[#0a1d37] text-white font-extrabold shadow'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`text-[8px] uppercase tracking-wider ${selectedDayIndex === idx ? 'text-white/80 font-bold' : 'text-slate-400'}`}>
                            {day.weekday}
                          </span>
                          <span className="text-base font-bold font-mono my-0.5">{day.dayNum}</span>
                          <span className={`text-[8px] ${selectedDayIndex === idx ? 'text-white/70 font-medium' : 'text-slate-500'}`}>
                            {day.month}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5 select-none">
                      Aktiviert: {daysList[selectedDayIndex].fullString} (Öffnungszeiten ab 09:00 Uhr)
                    </p>
                  </div>

                  {/* Time Slots Selector */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                      Zeitfenster wählen
                    </label>
                    <div id="booking-time-slots" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTimeSlot(time)}
                          className={`flex items-center justify-center py-2.5 px-2 rounded-lg border text-center transition duration-350 cursor-pointer ${
                            selectedTimeSlot === time
                              ? 'bg-[#0a1d37] text-white border-[#0a1d37] font-bold shadow'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-[10px] font-mono flex items-center gap-1.5 justify-center">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> {time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Contact Info & Action */}
                <div className="space-y-5 flex flex-col justify-between">
                  {/* Fields Block */}
                  <div className="space-y-4">
                    <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                      Persönliche Angaben
                    </span>

                    {/* Name input */}
                    <div className="space-y-1 relative">
                      <label htmlFor="booking-name" className="sr-only">Vollständiger Name</label>
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        id="booking-name"
                        type="text"
                        placeholder="Ihr vollständiger Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-[#94a3b8] focus:outline-none focus:border-[#0a1d37] transition"
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1 relative">
                      <label htmlFor="booking-email" className="sr-only">E-Mail-Adresse</label>
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        id="booking-email"
                        type="email"
                        placeholder="Ihre E-Mail-Adresse"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-[#94a3b8] focus:outline-none focus:border-[#0a1d37] transition"
                        required
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1 relative">
                      <label htmlFor="booking-phone" className="sr-only">Telefonnummer</label>
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        id="booking-phone"
                        type="tel"
                        placeholder="Ihre Telefonnummer (für Rückfragen)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-[#94a3b8] focus:outline-none focus:border-[#0a1d37] transition"
                        required
                      />
                    </div>

                    {/* Special Note */}
                    <div className="space-y-1">
                      <label htmlFor="booking-note" className="sr-only">Besondere Wünsche</label>
                      <textarea
                        id="booking-note"
                        placeholder="Besondere Wünsche (z. B. Inzahlungnahme, Bewertung Altfahrzeug, spezielle Ausstattungsmerkmale)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-900 placeholder-[#94a3b8] focus:outline-none focus:border-[#0a1d37] transition"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  {/* Action CTA Box */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-between text-center gap-3">
                    <div className="text-[10px] text-slate-500 font-medium leading-normal">
                      Mit dem Absenden Ihrer Anfrage sichern Sie sich Ihren persönlichen Termin mit bevorzugter Beratung vor Ort. Völlig unverbindlich.
                    </div>
                    <button
                      type="submit"
                      id="btn-confirm-booking"
                      disabled={isSubmitting}
                      className="w-full bg-[#0a1d37] text-white py-3 px-6 rounded-lg text-xs font-mono font-bold uppercase transition hover:bg-[#08172c] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 tracking-wider shadow cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          RESERVIERUNG WIRD GESICHERT...
                        </>
                      ) : (
                        <>
                          RESERVIERUNG JETZT ABSENDEN <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            </form>
          </motion.div>
        ) : (
          /* SUCCESS SCREEN EXQUISITE TICKET CARD */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 155 }}
            className="text-center py-6 max-w-lg mx-auto"
          >
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#0a1d37]" />
            </div>

            <h3 className="text-2xl font-black font-sans tracking-tight text-[#0a1d37]">RESERVIERUNG ERFOLGREICH</h3>
            <p className="text-[9px] text-slate-500 font-mono tracking-[0.2em] uppercase mt-1 text-center">SUPER CAR EL CHAMI • PLETTENBERG</p>

            {/* Custom high-end visual ticket style */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-6 text-left relative overflow-hidden shadow-lg">
              {/* Ticket cutouts on edges */}
              <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-r border-slate-200 rounded-r-full" />
              <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-l border-slate-200 rounded-l-full" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(10,29,55,0.03),transparent_40%)] pointer-events-none" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">RESERVIERUNGS-NUMMER:</span>
                  <span className="text-sm font-mono font-extrabold text-[#0a1d37]">{bookingRef}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">STATUS:</span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                    Slot reserviert
                  </span>
                </div>
              </div>

              <hr className="border-dashed border-slate-200 my-3.5" />

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">AUSGEWÄHLTES MODELL:</span>
                  <p className="font-bold text-[#0a1d37] text-sm">
                    {selectedVehicleObj ? `${selectedVehicleObj.brand} ${selectedVehicleObj.model}` : 'Super Car Presentation'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-mono">{selectedVehicleObj?.trim}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">WUNSCHTERMIN:</span>
                    <p className="font-bold text-slate-800">{daysList[selectedDayIndex].fullString}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">ZEITFENSTER:</span>
                    <p className="font-bold text-slate-800">{selectedTimeSlot} Uhr</p>
                  </div>
                </div>

                <hr className="border-slate-200" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">NAME DES KUNDEN:</span>
                    <p className="text-slate-700 font-semibold">{name}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-[#0a1d37] uppercase block tracking-wider font-bold">STANDORT DETAILS:</span>
                    <a 
                      href="https://maps.google.com/?q=Super+Car+El+Chami+Breddestraße+58840+Plettenberg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] block hover:underline transition cursor-pointer"
                      title="Wegbeschreibung auf Google Maps aufrufen"
                    >
                      Breddestraße, 58840 Plettenberg ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-normal px-4 font-medium">
              Wir haben soeben eine Bestätigung an Ihre E-Mail-Adresse <strong className="text-slate-800">{email}</strong> versendet. 
              Unser Verkaufsteam wird sich in Kürze unter Ihrer Telefonnummer <strong className="text-slate-800">{phone}</strong> melden, um den Präsentationstermin kurz zu bestätigen.
            </p>

            <button
              onClick={() => {
                setBookingRef(null);
                setName('');
                setEmail('');
                setPhone('');
                setNote('');
                if (onSuccessClose) onSuccessClose();
              }}
              className="mt-6 bg-[#0a1d37] text-white hover:bg-[#0c2448] font-mono text-[9px] uppercase px-6 py-2.5 rounded-lg border border-[#0a1d37] transition duration-300 cursor-pointer"
            >
              WEITEREN TERMIN BUCHEN
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
