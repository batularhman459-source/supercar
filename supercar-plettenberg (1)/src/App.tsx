import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car,
  Sparkles,
  Search,
  SlidersHorizontal,
  Award,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Gauge,
  Cpu,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Plus,
  ArrowUpRight,
  Coins,
  CalendarCheck,
  Camera,
  Eye,
  Maximize2,
  Printer,
  Smartphone,
  Lock,
  Unlock
} from 'lucide-react';

import { VEHICLES_DATA, REVIEWS_DATA } from './data';
import { Vehicle, VehicleStatus } from './types';
import Logo from './components/Logo';
import FinancingCalculator from './components/FinancingCalculator';
import BookingForm from './components/BookingForm';

export const CATEGORIES = [
  { id: 'exterior', label: 'Hauptansicht & Exterieur', desc: 'Exterieur und Hauptansichten des Fahrzeugs' },
  { id: 'interior', label: 'Innenraum & Cockpit', desc: 'Sitze, Bedienelemente, Lenkrad und Innenausstattung' },
  { id: 'details', label: 'Details & Extras', desc: 'Nahaufnahmen von Felgen, Logos, Lichtern und Besonderheiten' },
  { id: 'technical', label: 'Fahrwerk & Technik', desc: 'Motorraum, Unterboden, Bremsanlage und Technikkomponenten' }
];

export default function App() {
  // Real-time Vehicle State Simulator with sync to latest vehicle_data code updates
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('supercar_vehicles_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only items that exist in VEHICLES_DATA to eliminate deleted/duplicate cars
          const verifiedItems = parsed.filter((item: any) => 
            VEHICLES_DATA.some((v) => v.id === item.id)
          );

          // Merge static updates to specs/price/description to align with core data.ts edits
          const merged = verifiedItems.map((item: any) => {
            const fresh = VEHICLES_DATA.find((v) => v.id === item.id);
            if (fresh) {
              return {
                ...item,
                price: fresh.price,
                trim: fresh.trim,
                specs: fresh.specs,
                features: fresh.features,
                description: fresh.description,
                customizerColors: fresh.customizerColors,
                customizerWheels: fresh.customizerWheels,
                mobileDeUrl: fresh.mobileDeUrl || item.mobileDeUrl,
                brand: fresh.brand || item.brand,
                model: fresh.model || item.model
              };
            }
            return item;
          });

          // Append any newly added vehicles from static code that aren't in localStorage yet
          const missingVehicles = VEHICLES_DATA.filter(
            (v) => !merged.some((m) => m.id === v.id)
          );

          const finalVehicles = [...merged, ...missingVehicles];
          localStorage.setItem('supercar_vehicles_v3', JSON.stringify(finalVehicles));
          return finalVehicles;
        }
      }
    } catch (e) {
      console.error('Error loading vehicles from localStorage', e);
    }
    return VEHICLES_DATA;
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('supercar_vehicles_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (e) {}
    return VEHICLES_DATA[0].id;
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || VEHICLES_DATA[0];

  // Persist vehicles to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('supercar_vehicles_v3', JSON.stringify(vehicles));
    } catch (e) {
      console.error('Error saving vehicles to localStorage', e);
    }
  }, [vehicles]);

  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Reset editor states upon vehicle change
  useEffect(() => {
    setIsEditingDescription(false);
    setIsDescExpanded(false);
  }, [selectedVehicleId]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'year' | 'mileage'>('price-desc');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingVehicleId, setBookingVehicleId] = useState('');
  const [isNewArrivalNotification, setIsNewArrivalNotification] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('exterior');

  // Load or initialize persistent categorized galleries
  const [categorizedGalleries, setCategorizedGalleries] = useState<Record<string, Record<string, string[]>>>(() => {
    // Default configuration: pre-populate with nice original assets
    const initial: Record<string, Record<string, string[]>> = {};
    VEHICLES_DATA.forEach((v) => {
      // Create fresh category holders for each vehicle
      initial[v.id] = {
        exterior: [v.image],
        interior: [],
        details: [],
        technical: []
      };

      // Distribute any extra images from v.gallery or default placeholders
      const extraItems = (v.gallery || []).filter(u => u !== v.image);
      extraItems.forEach((url, index) => {
        if (url.includes('detail2') || url.includes('detail3') || url.includes('70') || url.includes('842') || url.includes('150')) {
          initial[v.id].interior.push(url);
        } else if (url.includes('detail1') || url.includes('detail4') || url.includes('1205') || url.includes('91') || url.includes('537')) {
          initial[v.id].details.push(url);
        } else {
          // Fallback distribution
          if (index % 3 === 0) {
            initial[v.id].interior.push(url);
          } else if (index % 3 === 1) {
            initial[v.id].details.push(url);
          } else {
            initial[v.id].exterior.push(url);
          }
        }
      });

      // Let's add premium default fallback images so they never start empty
      if (initial[v.id].interior.length === 0) {
        initial[v.id].interior.push('https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1200');
      }
      if (initial[v.id].details.length === 0) {
        initial[v.id].details.push('https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200');
      }
      if (initial[v.id].technical.length === 0) {
        initial[v.id].technical.push('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1200');
      }
    });

    try {
      const saved = localStorage.getItem('supercard_categorized_galleries');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure any new vehicles added statically get their default galleries set
        let modified = false;
        Object.keys(initial).forEach((vId) => {
          if (!parsed[vId]) {
            parsed[vId] = initial[vId];
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem('supercard_categorized_galleries', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading categorized galleries', e);
    }

    return initial;
  });

  const [showImpressum, setShowImpressum] = useState(false);
  const [showAgb, setShowAgb] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);
  const [showUrlSavedMsg, setShowUrlSavedMsg] = useState(false);
  const [isEditingMobileDeUrl, setIsEditingMobileDeUrl] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showDescSavedMsg, setShowDescSavedMsg] = useState(false);
  const [isManagingPhotos, setIsManagingPhotos] = useState(false);

  const getCategoryImages = (vehicleId: string, categoryId: string): string[] => {
    const list = categorizedGalleries[vehicleId]?.[categoryId] || [];
    if (list.length === 0 && categoryId === 'exterior') {
      const v = VEHICLES_DATA.find((u) => u.id === vehicleId);
      return v ? [v.image] : [];
    }
    return list;
  };

  const addPhotoToCategory = (vehicleId: string, categoryId: string, url: string) => {
    if (!url.trim()) return;
    setCategorizedGalleries((prev) => {
      const vehicleCats = prev[vehicleId] || { exterior: [], interior: [], details: [], technical: [] };
      const currentList = vehicleCats[categoryId] || [];
      const updatedList = [...currentList, url.trim()];

      const updated = {
        ...prev,
        [vehicleId]: {
          ...vehicleCats,
          [categoryId]: updatedList
        }
      };

      try {
        localStorage.setItem('supercard_categorized_galleries', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      return updated;
    });
  };

  const removePhotoFromCategory = (vehicleId: string, categoryId: string, indexToRemove: number) => {
    setCategorizedGalleries((prev) => {
      const vehicleCats = prev[vehicleId] || { exterior: [], interior: [], details: [], technical: [] };
      const currentList = vehicleCats[categoryId] || [];
      const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);

      const updated = {
        ...prev,
        [vehicleId]: {
          ...vehicleCats,
          [categoryId]: updatedList
        }
      };

      try {
        localStorage.setItem('supercard_categorized_galleries', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      // Adjust active index if it's out of bounds after deletion
      setActiveGalleryIndex((prevIdx) => Math.min(prevIdx, Math.max(0, updatedList.length - 1)));

      return updated;
    });
  };

  const updateVehicleMobileDeUrl = (vehicleId: string, url: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, mobileDeUrl: url.trim() };
        }
        return v;
      })
    );
  };

  const updateVehicleDescription = (vehicleId: string, text: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, description: text.trim() };
        }
        return v;
      })
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        addPhotoToCategory(selectedVehicle.id, activeCategory, base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        addPhotoToCategory(selectedVehicle.id, activeCategory, base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset active photo index when vehicle or category selection changes
  useEffect(() => {
    setActiveGalleryIndex(0);
  }, [selectedVehicle.id, activeCategory]);

  // Dynamic Vehicle Activity Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          // Rare status rotation simulation to illustrate real-time updates
          let updatedStatus = v.status;
          const randomFactor = Math.random();
          if (randomFactor > 0.96) {
            if (v.status === 'Available') {
              updatedStatus = 'Reserved';
            } else if (v.status === 'Reserved' && Math.random() > 0.5) {
              updatedStatus = 'Available';
            }
          }

          return {
            ...v,
            status: updatedStatus,
          };
        })
      );
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  // Automated Hero Slideshow transition
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 3); // Cycle top 3 premier cars
    }, 9000);
    return () => clearInterval(heroTimer);
  }, []);

  // Filter and Sort Logic
  const brandsList = ['All', ...Array.from(new Set(vehicles.map((v) => v.brand)))];
  const fuelsList = ['All', ...Array.from(new Set(vehicles.map((v) => v.specs.fuelType)))];

  const filteredVehicles = vehicles
    .filter((v) => {
      const matchSearch =
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.trim.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBrand = selectedBrand === 'All' || v.brand === selectedBrand;
      const matchFuel = selectedFuel === 'All' || v.specs.fuelType === selectedFuel;
      const matchPrice = v.price <= maxPrice;

      return matchSearch && matchBrand && matchFuel && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'year') return b.specs.year - a.specs.year;
      if (sortBy === 'mileage') return a.specs.mileage - b.specs.mileage;
      return 0;
    });

  // Top 3 spotlight vehicles for the interactive diashow
  const spotlightVehicles = vehicles.slice(0, 3);

  const selectVehicleForConfig = (v: Vehicle) => {
    setSelectedVehicleId(v.id);
    const element = document.getElementById('specs-details-target');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openBookingForVehicle = (vId: string) => {
    setBookingVehicleId(vId);
    setShowBookingModal(true);
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans selection:bg-[#0a1d37] selection:text-white">

      {/* Header / Navigation Bar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-40 transition py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo in mobile.de styled luxury format */}
          <div className="flex items-center">
            <Logo className="w-40 sm:w-48" variant="navy" />
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-8 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
            <a href="#hero-diashow" className="hover:text-[#0a1d37] transition-colors">Highlights</a>
            <a href="#inventory-catalog" className="hover:text-[#0a1d37] transition-colors">Fahrzeugbestand</a>
            <a href="#specs-details-target" className="hover:text-[#0a1d37] transition-colors">Spezifikationen</a>
            <a href="#finance-section" className="hover:text-[#0a1d37] transition-colors">Finanzierung</a>
            <a href="#contact-info-footer" className="hover:text-[#0a1d37] transition-colors">Kontakt</a>
          </nav>

          {/* Priority Button */}
          <div className="flex items-center gap-3">
            <a
              href="#appointment-section"
              onClick={() => openBookingForVehicle('')}
              className="bg-[#0a1d37] hover:bg-[#001333] text-white font-mono text-[10px] uppercase font-bold tracking-[0.15em] py-2.5 px-5 rounded-lg border border-[#0a1d37] transition-all duration-300 shadow-sm"
            >
              Termin Buchen
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Diashow Section (Spotlight Slider) */}
      <section id="hero-diashow" className="relative h-[85vh] min-h-[550px] flex items-center justify-center overflow-hidden border-b border-slate-200 bg-white">
        {/* Background slider wrapper */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.0, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Overlay shading for sleek bright contrast and legibility - refined to keep pictures highly vibrant and bright */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc]/45 via-transparent to-transparent z-10" />
              <img
                src={spotlightVehicles[heroIndex].image}
                alt={spotlightVehicles[heroIndex].model}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover origin-center opacity-100 contrast-[1.04] brightness-[1.04] saturate-[1.04] transition-all duration-700"
              />
            </motion.div>
          </AnimatePresence>
        </div>



        {/* Hero Content Area */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 relative z-20 flex flex-col justify-end h-full pb-16 lg:pb-20">
          <div className="max-w-2xl text-left space-y-4">
            {/* Dynamic mini label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[9px] font-mono py-1 px-3.5 bg-white/85 border border-[#0a1d37]/10 rounded-full text-[#0a1d37] tracking-[0.2em] uppercase inline-flex items-center gap-1.5 font-black shadow-sm">
                UNSER SPOTLIGHT-FAHRZEUG
              </span>
            </motion.div>

            {/* Dynamic high display title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-black tracking-tight text-[#0a1d37] leading-none">
              <span className="block text-[#0a1d37] font-black">{spotlightVehicles[heroIndex].brand}</span>
              <span className="block mt-1 font-bold text-slate-800">{spotlightVehicles[heroIndex].model}</span>
            </h1>

            {/* CTA cluster */}
            <div className="flex flex-wrap gap-3 pt-3">
              <button
                onClick={() => selectVehicleForConfig(spotlightVehicles[heroIndex])}
                className="bg-[#0a1d37] hover:bg-[#001333] text-white py-3 px-6 rounded-lg text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md"
              >
                Technische Daten <ArrowUpRight className="w-3.5 h-3.5 text-blue-300" />
              </button>
              <button
                onClick={() => openBookingForVehicle(spotlightVehicles[heroIndex].id)}
                className="bg-white hover:bg-slate-50 text-[#0a1d37] py-3 px-6 rounded-lg text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-all duration-300 border border-slate-300 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                Termin vereinbaren <CalendarCheck className="w-3.5 h-3.5 text-[#0a1d37]" />
              </button>
            </div>
          </div>
        </div>

        {/* Diashow Navigation Triggers */}
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-3">
          <button
            onClick={() => setHeroIndex((prev) => (prev - 1 + spotlightVehicles.length) % spotlightVehicles.length)}
            className="w-10 h-10 rounded-lg bg-white/90 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0a1d37] transition-all duration-300 cursor-pointer shadow-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-slate-500 bg-white/95 px-2.5 py-1.5 rounded-md shadow-sm border border-slate-200">
            <span className="text-[#0a1d37] font-bold">{heroIndex + 1}</span>
            <span>/</span>
            <span>{spotlightVehicles.length}</span>
          </div>
          <button
            onClick={() => setHeroIndex((prev) => (prev + 1) % spotlightVehicles.length)}
            className="w-10 h-10 rounded-lg bg-white/90 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0a1d37] transition-all duration-300 cursor-pointer shadow-sm"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Main Catalog & Inventory Section */}
      <section id="inventory-catalog" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 bg-[#f8fafc]">
        
        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#0a1d37] uppercase block">
              FAHRZEUGBESTAND IN ECHTZEIT
            </span>
            <h2 className="text-3xl lg:text-4xl font-sans font-black tracking-tight mt-2 text-slate-900">
              Fahrzeugauswahl & Bestand
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 py-2 px-4.5 rounded-lg text-[10px] tracking-wider text-slate-600 font-bold font-mono shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-[#0a1d37]" />
            <span>AKTIVE FAHRZEUGE:</span>
            <span className="text-[#0a1d37] font-extrabold">{vehicles.length} SOFORT VERFÜGBAR</span>
          </div>
        </div>

        {/* Dynamic Filters Console */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            {/* Search */}
            <div className="relative col-span-1">
              <label htmlFor="search-input" className="sr-only">Modell oder Marke suchen</label>
              <Search className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Fahrzeugbestand durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0a1d37] transition-all duration-300 font-medium"
              />
            </div>

            {/* Brand Filter */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-brand" className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.15em] uppercase pl-1">Marke:</label>
              <select
                id="filter-brand"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#0a1d37] transition-all duration-300 font-medium cursor-pointer"
              >
                {brandsList.map((brand) => (
                  <option key={brand} value={brand} className="bg-white text-slate-800">
                    {brand === 'All' ? 'Alle Marken' : brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Type Filter */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-fuel" className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.15em] uppercase pl-1">Kraftstoffart:</label>
              <select
                id="filter-fuel"
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#0a1d37] transition-all duration-300 font-medium cursor-pointer"
              >
                {fuelsList.map((fuel) => (
                  <option key={fuel} value={fuel} className="bg-white text-slate-800">
                    {fuel === 'All' ? 'Alle Kraftstoffe' : 
                     fuel === 'Petrol' ? 'Benzin' :
                     fuel === 'Diesel' ? 'Diesel' :
                     fuel === 'Hybrid' ? 'Hybrid' :
                     fuel === 'Electric' ? 'Elektro' : fuel}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sort-select" className="text-[9px] font-mono font-bold text-slate-400 tracking-[0.15em] uppercase pl-1">Sortieren nach:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#0a1d37] transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="price-desc" className="bg-white text-slate-800">Preis: Höchster zuerst</option>
                <option value="price-asc" className="bg-white text-slate-800">Preis: Niedrigster zuerst</option>
                <option value="year" className="bg-white text-slate-800">Baujahr: Neueste zuerst</option>
                <option value="mileage" className="bg-white text-slate-800">Kilometerstand: Geringster zuerst</option>
              </select>
            </div>

          </div>

          <hr className="border-slate-200" />

          {/* Pricing slider & active badges */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-1">
            <div className="flex-1 max-w-sm space-y-2">
              <div className="flex justify-between text-[10px] font-mono tracking-wider text-slate-500">
                <span>MAXIMALER PREIS:</span>
                <span className="text-[#0a1d37] font-extrabold">€{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={13000}
                max={50000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0a1d37] h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
              <span className="text-[10px] font-mono tracking-wide text-slate-400 uppercase">
                {filteredVehicles.length} von {vehicles.length} passenden Modellen
              </span>
              {(searchTerm !== '' || selectedBrand !== 'All' || selectedFuel !== 'All' || maxPrice !== 50000) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBrand('All');
                    setSelectedFuel('All');
                    setMaxPrice(50000);
                  }}
                  className="text-[9px] font-mono tracking-[0.15em] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 transition-all duration-300 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Zurücksetzen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fleet Grid */}
        <div id="fleet-card-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle) => {
              const worksAsSelected = selectedVehicle.id === vehicle.id;

              return (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className={`bg-white border rounded-2xl overflow-hidden group flex flex-col justify-between hover:shadow-lg hover:border-slate-350 transition-all duration-300 relative ${
                    worksAsSelected ? 'border-[#0a1d37] shadow-xl bg-[#0a1d37]/[0.01]' : 'border-slate-200'
                  }`}
                >
                  {/* Real-time viewer counter tag */}
                  {worksAsSelected && (
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-emerald-500 py-1 px-3 rounded-full shadow-sm ring-1 ring-emerald-600/10">
                      <span className="relative flex h-1.5 w-1.5 rounded-full bg-white">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      </span>
                      <span className="text-[8px] font-mono text-white uppercase tracking-wider font-extrabold">
                        1 Betrachter (Sie)
                      </span>
                    </div>
                  )}



                  {/* Image Presentation */}
                  <div className="relative h-48 overflow-hidden bg-slate-55 flex items-center justify-center p-4">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      referrerPolicy="no-referrer"
                      className="max-w-[85%] h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-100/30 to-transparent pointer-events-none" />
                  </div>

                  {/* Details Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 relative bg-white">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase font-mono tracking-[0.2em] text-[#0a1d37] font-bold block">
                        {vehicle.brand} • Modell {vehicle.specs.year}
                      </span>
                      <h3 className="text-base font-bold font-sans tracking-tight text-slate-800 group-hover:text-[#0a1d37] transition-all duration-200">
                        {vehicle.model}
                      </h3>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[8px] tracking-[0.1em] uppercase block font-mono font-bold">KAUFPREIS:</span>
                        <span className="text-lg font-mono font-bold text-[#0a1d37]">
                          €{vehicle.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => selectVehicleForConfig(vehicle)}
                        className={`py-2.5 rounded-lg text-[10px] font-mono tracking-wider uppercase font-bold transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer ${
                          worksAsSelected
                            ? 'bg-[#0a1d37] text-white font-extrabold shadow-md'
                            : 'bg-transparent text-slate-700 hover:text-[#0a1d37] hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        {worksAsSelected ? 'Ausgewählt' : 'Details & Daten'}
                      </button>
                      <button
                        onClick={() => openBookingForVehicle(vehicle.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-lg text-[10px] font-mono tracking-wider uppercase font-bold transition-all duration-300 border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Termin buchen
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty search fallback */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto space-y-4 shadow-sm">
            <Car className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold font-sans text-slate-900">Keine passenden Modelle gefunden</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Wir konnten keine Übereinstimmungen im aktuellen Bestand ermitteln. Bitte passen Sie Ihre Preisschwelle an oder ändern Sie Ihre Filtereinstellungen.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('All');
                setSelectedFuel('All');
                setMaxPrice(50000);
              }}
              className="mt-3 bg-[#0a1d37] text-white font-mono text-[10px] tracking-wider uppercase font-bold px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-all duration-300 pointer-events-auto cursor-pointer"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </section>

      {/* Vehicle Specifications Section */}
      <section id="specs-details-target" className="py-20 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Specs Description block */}
          <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#0a1d37] uppercase">
               Fahrzeug-Spezifikationen
            </span>
            <h2 className="text-3xl font-black font-sans tracking-tight text-[#0a1d37] leading-tight mt-1">
              Details für {selectedVehicle.brand} {selectedVehicle.model}
            </h2>
          </div>

          {/* Side stats & features comparison sheet mapping currently loaded car */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-6 items-stretch">
            
            {/* Left Column: Tech Specs & Highlights */}
            <div className="space-y-6 flex flex-col justify-start">
              
              {/* Tech Specs Summary Sheet (Kasten 1) */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#0a1d37]/80 block border-b border-slate-200 pb-2">
                  TECHNISCHES DATENBLATT • {selectedVehicle.brand} {selectedVehicle.model}
                </span>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs pt-1">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-mono font-bold text-[9px] tracking-wider uppercase">MOTOR:</span>
                    <span className="font-bold text-slate-800">{selectedVehicle.specs.engine}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-mono font-bold text-[9px] tracking-wider uppercase">LEISTUNG:</span>
                    <span className="font-bold text-[#0a1d37]">{selectedVehicle.specs.horsepower} PS</span>
                  </div>
                  {selectedVehicle.specs.acceleration && (
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-400 font-mono font-bold text-[9px] tracking-wider uppercase">BESCHLEUNIGUNG:</span>
                      <span className="font-bold text-slate-800">{selectedVehicle.specs.acceleration}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-mono font-bold text-[9px] tracking-wider uppercase">GETRIEBE:</span>
                    <span className="font-bold text-slate-800">
                      {selectedVehicle.specs.transmission === 'Automatic' ? 'Automatik' : 'Schaltgetriebe'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-mono font-bold text-[9px] tracking-wider uppercase">KRAFTSTOFF:</span>
                    <span className="font-bold text-slate-800">
                      {selectedVehicle.specs.fuelType === 'Petrol' ? 'Benzin' :
                       selectedVehicle.specs.fuelType === 'Diesel' ? 'Diesel' :
                       selectedVehicle.specs.fuelType === 'Hybrid' ? 'Hybrid' :
                       selectedVehicle.specs.fuelType === 'Electric' ? 'Elektro' : selectedVehicle.specs.fuelType}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-mono font-bold text-[9px] tracking-wider uppercase">KM-STAND:</span>
                    <span className="font-bold text-slate-800">{selectedVehicle.specs.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-mono font-bold text-[9px] tracking-wider uppercase">HALTER:</span>
                    <span className="font-bold text-slate-800">{selectedVehicle.specs.owners} Hand (Unfallfrei)</span>
                  </div>
                </div>
              </div>

              {/* Premium Highlight Features checklist (Kasten 2) */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#0a1d37]/80 block border-b border-slate-200 pb-2">
                  HIGHLIGHTS & SONDERAUSSTATTUNG
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {selectedVehicle.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-[#0a1d37] font-black text-lg leading-none shrink-0" style={{ marginTop: '-1px' }}>•</span>
                      <span className="font-semibold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Detailed Description (Kasten 3) */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#0a1d37]/80">
                    FAHRZEUGBESCHREIBUNG & DETAILS
                  </span>
                </div>

                <div className="pt-1 space-y-3">
                  {(() => {
                    const descText = selectedVehicle.description || 'Keine Beschreibung für dieses Fahrzeug hinterlegt.';
                    const needsTruncation = descText.length > 500;
                    const displayedText = (needsTruncation && !isDescExpanded) 
                      ? `${descText.slice(0, 500)}...` 
                      : descText;

                    return (
                      <>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line antialiased transition-all duration-300">
                          {displayedText}
                        </p>
                        {needsTruncation && (
                          <button
                            onClick={() => setIsDescExpanded(!isDescExpanded)}
                            className="text-[10px] font-mono font-bold text-[#0a1d37] hover:text-blue-700 transition flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-md border border-slate-200 shadow-sm uppercase tracking-wider"
                          >
                            {isDescExpanded ? 'Weniger anzeigen ▲' : 'Mehr anzeigen ▼'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Mobile.de button (placed under the vehicle description text / editor) */}
                <div className="pt-3 flex justify-start">
                  <a 
                    href={selectedVehicle.mobileDeUrl || "https://home.mobile.de/SUPERCARELCHAMI"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#ff7900] hover:bg-[#ee6a00] active:bg-[#d65a00] text-white font-sans text-xs font-bold tracking-wider uppercase py-2.5 px-5 rounded-xl transition-all duration-250 shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer border border-[#ff7900] w-auto animate-fade-in"
                  >
                    <Car className="w-4 h-4 shrink-0" />
                    <span>Auf mobile.de ansehen ↗</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Fahrzeug-Bildergalerie */}
          <div className="max-w-5xl mx-auto pt-12 border-t border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#0a1d37] uppercase flex items-center gap-1.5 justify-center md:justify-start">
                  <Camera className="w-3.5 h-3.5 text-blue-400" /> INTERAKTIVES FOTO-STUDIO
                </span>
                <h3 className="text-2xl font-black font-sans tracking-tight text-[#0a1d37] mt-1 text-center md:text-left">
                  Rundum-Ansichten: {selectedVehicle.brand} {selectedVehicle.model}
                </h3>
              </div>
              <p className="text-slate-500 text-xs text-center md:text-right font-medium max-w-sm">
                Erkunden Sie das Fahrzeug über die verschiedenen Kategorien.
              </p>
            </div>

            {/* Category Selection Tabs */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pb-1 border-b border-slate-200">
              {CATEGORIES.map((cat) => {
                const isCatActive = activeCategory === cat.id;
                const catImagesCount = getCategoryImages(selectedVehicle.id, cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setActiveGalleryIndex(0);
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                      isCatActive
                        ? 'bg-[#0a1d37] border-[#0a1d37] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isCatActive ? 'bg-blue-950 text-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                      {catImagesCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom interactive gallery layout */}
            {(() => {
              const currentGalleryImages = getCategoryImages(selectedVehicle.id, activeCategory);
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in">
                  {/* Left Column: Big active picture with hover and caption */}
                  <div className="lg:col-span-8 flex flex-col space-y-3">
                    <div 
                      className="bg-white rounded-2xl border border-slate-200/80 p-6 h-[280px] sm:h-[400px] flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-sm select-none"
                      onClick={() => {
                        if (currentGalleryImages.length > 0) {
                          setShowLightbox(true);
                        }
                      }}
                    >
                      {/* Subtle watermarked grid background */}
                      <div className="absolute inset-0 bg-[#0a1d37]/[0.01] pointer-events-none" />
                      
                      {/* Image counter */}
                      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-md">
                        <span className="text-white font-mono text-[9px] font-bold tracking-wider uppercase">
                          Foto {currentGalleryImages.length > 0 ? activeGalleryIndex + 1 : 0} von {currentGalleryImages.length}
                        </span>
                      </div>

                      {/* Perspective badge */}
                      <div className="absolute top-4 right-4 z-10 bg-white/95 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-slate-700 font-mono text-[8px] font-black uppercase tracking-wider">
                          {CATEGORIES.find(c => c.id === activeCategory)?.label}
                        </span>
                      </div>

                      {/* Zoom full screen instruction overlay */}
                      {currentGalleryImages.length > 0 && (
                        <div className="absolute inset-0 bg-[#0a1d37]/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 gap-2 text-white">
                          <Maximize2 className="w-5 h-5 animate-pulse" />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider">Klicken für Vollbild</span>
                        </div>
                      )}

                      {currentGalleryImages.length > 0 ? (
                        <img 
                          src={currentGalleryImages[activeGalleryIndex] || currentGalleryImages[0]} 
                          alt={`${selectedVehicle.brand} ${selectedVehicle.model} detailing`}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-[92%] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] group-hover:scale-103 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                          <Camera className="w-12 h-12 text-slate-350 animate-pulse" />
                          <div>
                            <p className="text-sm font-black text-slate-700">Keine Aufnahmen in dieser Kategorie</p>
                            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-1">
                              Für diese Kategorie sind aktuell keine Abbildungen hinterlegt.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Navigation helpers under big active slide */}
                    <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-mono">
                      <span>
                        Kategorie: <strong className="text-[#0a1d37] uppercase">{CATEGORIES.find(c => c.id === activeCategory)?.label}</strong>
                      </span>
                      {currentGalleryImages.length > 1 && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGalleryIndex((prev) => (prev - 1 + currentGalleryImages.length) % currentGalleryImages.length);
                            }}
                            className="px-2.5 py-1 hover:bg-slate-200 hover:text-slate-800 rounded border border-slate-200 transition bg-white font-bold cursor-pointer"
                          >
                            ← Zurück
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGalleryIndex((prev) => (prev + 1) % currentGalleryImages.length);
                            }}
                            className="px-2.5 py-1 hover:bg-slate-200 hover:text-slate-800 rounded border border-slate-200 transition bg-white font-bold cursor-pointer"
                          >
                            Weiter →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Thumbnail Selection list */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.12em] block border-b border-slate-200 pb-1.5 text-slate-500">
                        🔎 AUSWAHL ({currentGalleryImages.length} Bilder)
                      </span>
                      
                      {/* Thumbnails grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                        {currentGalleryImages.map((img, idx) => {
                          const isActive = activeGalleryIndex === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveGalleryIndex(idx)}
                              className={`flex items-center gap-3 p-2 rounded-xl border text-left transition-all duration-300 bg-white group cursor-pointer ${
                                isActive ? 'border-[#0a1d37] ring-1 ring-[#0a1d37] bg-blue-50/20' : 'border-slate-200 hover:border-slate-350 hover:bg-slate-55'
                              }`}
                            >
                              <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/60 shrink-0">
                                <img 
                                  src={img} 
                                  alt="thumbnail detailing" 
                                  referrerPolicy="no-referrer"
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <div className="hidden sm:block">
                                <p className={`text-[10px] font-bold font-sans leading-tight ${isActive ? 'text-[#0a1d37]' : 'text-slate-700'}`}>
                                  {`Bild ${idx + 1}`}
                                </p>
                                <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block">
                                  {isActive ? '● Ausgewählt' : 'Ansehen'}
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {currentGalleryImages.length === 0 && (
                          <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-[10px] text-slate-400 font-medium leading-relaxed">
                            Noch keine Bilder hochgeladen.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (currentGalleryImages.length > 0) {
                          setShowLightbox(true);
                        }
                      }}
                      disabled={currentGalleryImages.length === 0}
                      className="w-full bg-[#0a1d37] hover:bg-[#001333] text-white py-3 px-4 rounded-xl text-[9px] font-mono font-bold uppercase tracking-[0.15em] transition duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-blue-300" /> Diashow-Lightbox öffnen
                    </button>
                  </div>
                </div>
              );
            })()}


          </div>
        </div>
      </section>

      {/* Finance Calculator Section */}
      <section id="finance-section" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <FinancingCalculator 
            vehiclePrice={selectedVehicle.price} 
            vehicles={vehicles}
            selectedVehicleId={selectedVehicle.id}
            onVehicleChange={(id) => setSelectedVehicleId(id)}
          />
        </div>
      </section>

      {/* Visit Scroll Anchor & Contact Section */}
      <section id="appointment-section" className="py-20 bg-[#f8fafc] border-t border-slate-200 px-4 sm:px-8">
        <div id="booking-section-wrapper" className="max-w-7xl mx-auto space-y-12">
          
          {/* Booking module */}
          <BookingForm vehicles={vehicles} initialVehicleId={selectedVehicle.id} />

          {/* Grid: Map directions & Customer Reviews */}
          <div id="contact-info-footer" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            
            {/* Left Side: Editorial Location (5 Cols) */}
            <div className="lg:col-span-12 xl:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 space-y-6 flex flex-col justify-between shadow-md">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#0a1d37]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Super Car El Chami</h4>
                    <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Premium-Standort</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <a 
                    href="https://maps.google.com/?q=Super+Car+El+Chami+Breddestraße+58840+Plettenberg" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 hover:text-blue-600 group cursor-pointer transition-colors duration-200"
                    title="Wegbeschreibung in Google Maps öffnen"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
                    <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                      Breddestraße, 58840 Plettenberg, Deutschland
                    </span>
                  </a>
                  <div className="pl-6 pt-0.5">
                    <a 
                      href="https://maps.google.com/?q=Super+Car+El+Chami+Breddestraße+58840+Plettenberg" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100/80 text-blue-700 hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide transition duration-200 cursor-pointer border border-blue-100"
                      title="Wegbeschreibung in Google Maps öffnen"
                    >
                      🗺 Wegbeschreibung öffnen
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">Tel.: <a href="tel:+492391609808" className="hover:text-blue-600 transition">+49 2391 609808</a></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">Mobil: <a href="tel:+491718118999" className="hover:text-blue-600 transition">+49 171 8118999</a></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Printer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">Fax: +49 2391 609308</span>
                  </div>
                  <div className="flex items-start gap-4 pt-1.5 border-t border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-500 leading-normal font-medium">
                      <p className="font-bold text-slate-800 uppercase text-[8px] tracking-wider font-mono">Öffnungszeiten:</p>
                      <p className="mt-0.5">Montag - Freitag: 09:00 - 18:00 Uhr</p>
                      <p className="mt-0.5">Samstag: 09:00 - 14:00 Uhr • Sonntag geschlossen</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Map Visual Card with vector look linked to Google Maps */}
              <a 
                href="https://maps.google.com/?q=Super+Car+El+Chami+Breddestraße+58840+Plettenberg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden h-40 flex items-center justify-center shadow-inner group hover:border-blue-300 transition duration-300 cursor-pointer block"
                title="Google Maps Route berechnen"
              >
                <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <span className="bg-[#0a1d37]/90 text-white font-mono text-[9px] uppercase tracking-widest font-black py-1.5 px-3.5 rounded-lg border border-white/10 shadow-md">
                    In Google Maps öffnen ↗
                  </span>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,29,55,0.04),transparent_60%)]" />
                
                {/* Visual road grids */}
                <div className="absolute inset-0 border border-slate-100 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20" />
                <div className="w-full h-1 bg-[#0a1d37]/5 absolute top-1/2 left-0 -translate-y-1/2 rotate-12" title="Hauptstraße" />
                <div className="w-full h-1 bg-[#0a1d37]/5 absolute top-1/3 left-0 -translate-y-1/2 -rotate-6" />
                <div className="w-1 h-full bg-[#0a1d37]/5 absolute left-1/3 top-0 -translate-x-1/2" />
                
                {/* Pin Location */}
                <div className="relative flex flex-col items-center">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a1d37] opacity-25"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-[#0a1d37] flex items-center justify-center text-[10px] text-white font-extrabold shadow-sm">
                      ★
                    </span>
                  </span>
                  <span className="mt-1 bg-[#0a1d37] py-0.5 px-2.5 rounded text-[8px] border border-[#0a1d37] font-mono uppercase tracking-widest text-white shadow-sm">
                    Breddestraße
                  </span>
                </div>
              </a>
            </div>

            {/* Right Side: Customer Reviews (7 Cols) */}
            <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 space-y-6 flex flex-col justify-between shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#0a1d37] block">
                    GEPRÜFTE KUNDENBEWERTUNGEN
                  </span>
                  <h4 className="text-xl font-bold font-sans mt-1.5 text-slate-900">Was unsere Kunden sagen</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Super Car El Chami ist mit <strong>5/5 Sternen</strong> auf mobile.de von zertifizierten Fahrzeugkäufern bewertet.</p>
                </div>
                <a
                  href="https://www.mobile.de/bewertungen/SUPERCAR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider py-2 px-3.5 rounded-lg border border-slate-200 transition shadow-sm self-start sm:self-center shrink-0"
                >
                  <span>Bewertungen auf mobile.de ↗</span>
                </a>
              </div>

              <div id="reviews-carousel-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REVIEWS_DATA.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-350 transition-colors duration-200">
                    <div className="space-y-1.5 font-sans">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-450 text-amber-450" />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-600 italic leading-relaxed font-sans font-medium">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pt-1.5 border-t border-slate-200 uppercase">
                      <span className="font-bold text-slate-700">{rev.author}</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1d37] border-t border-[#0d284a] py-16 px-4 sm:px-8 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo className="w-40" variant="white" />
            </div>
            <p className="text-[11px] text-slate-350 leading-relaxed font-sans font-medium">
              Ihr exklusiver Partner für Premium-Automobile in Plettenberg. Erstklassige Fahrzeuge, unkomplizierte Abläufe und maßgeschneiderte Finanzierungslösungen für Ihren Traumwagen.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white mb-4 uppercase tracking-[0.15em] font-mono text-[9px]">Schnellzugriff</h5>
            <ul className="space-y-2.5 text-[11px] font-medium text-slate-300">
              <li><a href="#hero-diashow" className="hover:text-amber-400 transition">Spotlight Highlights</a></li>
              <li><a href="#inventory-catalog" className="hover:text-amber-400 transition">Fahrzeugbestand</a></li>
              <li><a href="#specs-details-target" className="hover:text-amber-400 transition">Spezifikationen</a></li>
              <li><a href="#finance-section" className="hover:text-amber-400 transition">Finanzierungsrechner</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-4 uppercase tracking-[0.15em] font-mono text-[9px]">Rechtliches</h5>
            <ul className="space-y-2.5 text-[11px] font-mono text-slate-400 font-semibold">
              <li>
                <button 
                  onClick={() => setShowImpressum(true)} 
                  className="hover:text-amber-350 transition text-left cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  Impressum
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowAgb(true)} 
                  className="hover:text-amber-350 transition text-left cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  Allgemeine Geschäftsbedingungen
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowDatenschutz(true)} 
                  className="hover:text-amber-350 transition text-left cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  Datenschutzerklärung
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowImpressum(true)} 
                  className="hover:text-amber-350 transition text-left cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  Haftungsausschluss & Angaben
                </button>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 my-10" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Logo className="w-24 pointer-events-none" variant="white" />
            <p>© 2026 SUPER CAR El Chami (Plettenberg). Alle Rechte vorbehalten. Premium-Repräsentanz.</p>
          </div>
          <p>Super Car El Chami • Breddestraße • 58840 Plettenberg</p>
        </div>
      </footer>

      {/* Legal Impressum Modal */}
      {showImpressum && (
        <div className="fixed inset-0 bg-[#0a1d37]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowImpressum(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-150 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#0a1d37]/75 block mb-1">
                SUPER CAR EL CHAMI • RECHTLICHE ANGABEN
              </span>
              <h3 className="text-xl font-black text-[#0a1d37]">Impressum</h3>
            </div>

            <div className="space-y-5 text-xs text-slate-600 leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Betreiber der Webseite:</h5>
                <p className="font-semibold text-slate-800">Super Car El Chami</p>
                <p>Breddestraße</p>
                <p>58840 Plettenberg</p>
                <p>Deutschland</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Inhaber & Verantwortlicher für den Inhalt (§ 55 Abs. 2 RStV):</h5>
                <p className="font-semibold text-slate-800">Kassem El Chami</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Kontaktmöglichkeiten:</h5>
                <p className="flex items-center gap-2"><strong className="w-12 block">Tel.:</strong> <a href="tel:+492391609808" className="text-blue-600 hover:underline font-semibold">+49 2391 609808</a></p>
                <p className="flex items-center gap-2"><strong className="w-12 block">Mobil:</strong> <a href="tel:+491718118999" className="text-blue-600 hover:underline font-semibold">+49 171 8118999</a></p>
                <p className="flex items-center gap-2"><strong className="w-12 block">Fax:</strong> <a href="tel:+492391609308" className="text-slate-500 font-semibold">+49 2391 609308</a></p>
                <p className="flex items-center gap-2"><strong className="w-12 block">E-Mail:</strong> <a href="mailto:k.elchami@hotmail.de" className="text-blue-600 hover:underline font-semibold">k.elchami@hotmail.de</a> / <a href="mailto:info@supercarelchami.de" className="text-blue-600 hover:underline font-semibold">info@supercarelchami.de</a></p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Umsatzsteuer-Identifikationsnummer (USt-IdNr.):</h5>
                <p>DE 314 987 654 (Muster-ID gemäß § 27a Umsatzsteuergesetz)</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Zuständige Aufsichtsbehörde:</h5>
                <p>Sicherheits- und Ordnungsamt der Stadt Plettenberg</p>
                <p>An der Kumpel 1, 58840 Plettenberg</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Kammerzugehörigkeit:</h5>
                <p>Mitglied der Industrie- und Handelskammer (IHK) Südwestfalen</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Haftungsausschluss (Disclaimer):</h5>
                <p className="italic">
                  Haftung für Inhalte: Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                </p>
                <p className="italic pt-1">
                  Haftung für Links: Unser Angebot enthält Links zu externen Webseiten Dritter (z. B. mobile.de), auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-[#0a1d37] text-sm">Online-Streitbeilegung (OS):</h5>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter folgendem Link finden: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ec.europa.eu/consumers/odr</a>.
                </p>
                <p className="pt-1">
                  Wir sind zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle weder bereit noch verpflichtet.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowImpressum(false)}
                className="bg-[#0a1d37] hover:bg-[#001333] text-white px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal AGB Modal */}
      {showAgb && (
        <div className="fixed inset-0 bg-[#0a1d37]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowAgb(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-150 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#0a1d37]/75 block mb-1">
                SUPER CAR EL CHAMI • RECHTLICHE RAHMENBEDINGUNGEN
              </span>
              <h3 className="text-xl font-black text-[#0a1d37]">Allgemeine Geschäftsbedingungen (AGB)</h3>
            </div>

            <div className="space-y-5 text-xs text-slate-600 leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">§ 1 Geltungsbereich und Allgemeines</h5>
                <p>
                  Diese allgemeinen Geschäftsbedingungen (AGB) gelten in ihrer zum Zeitpunkt der Bestellung bzw. des Besuchs gültigen Fassung für alle Verträge, geschäftliche Vereinbarungen, Online-Anfragen sowie Reservierungen zwischen dem Autohaus Super Car El Chami und Kunden.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">§ 2 Online-Reservierung und Termine</h5>
                <p>
                  Über das Online-Buchungstool angelegte Termine stellen noch keinen Kaufvertrag und keine bindende Willenserklärung zum Kauf des entsprechenden Fahrzeugs dar. Sie dienen rein der Abstimmung und kostenlosen Vorab-Reservierung für eine Besichtigung und Beratung vor Ort an unserem Standort in Plettenberg.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">§ 3 Gewährleistung für Gebrauchtwagen</h5>
                <p>
                  Es gelten die gesetzlichen Gewährleistungsvorschriften für den Kauf von Gebrauchtfahrzeugen, sofern nicht vertraglich ausdrücklich ein Haftungsausschluss vereinbart wurde (z.B. bei B2B-Export). Eine optionale Zusatz-Garantie (z.B. Premium-Gebrauchtwagengarantie) wird im Kaufvertrag separat abgeschlossen.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">§ 4 Haftung bei Besichtigungen</h5>
                <p>
                  Probefahrten erfolgen ausschließlich nach Vorlage einer gültigen Fahrerlaubnis und Unterzeichnung einer Probefahrtenvereinbarung mit Selbstbeteiligung. Bei Schäden während Besichtigungen oder Testfahrten haftet der Kunde im Rahmen der vertraglich vereinbarten Konditionen.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">§ 5 Gerichtsstand und Salvatorische Klausel</h5>
                <p>
                  Sofern der Kunde Kaufmann ist, gilt Plettenberg als ausschließlicher Gerichtsstand. Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Vereinbarungen hiervon unberührt.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowAgb(false)}
                className="bg-[#0a1d37] hover:bg-[#001333] text-white px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Datenschutzerklärung Modal */}
      {showDatenschutz && (
        <div className="fixed inset-0 bg-[#0a1d37]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowDatenschutz(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-150 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#0a1d37]/75 block mb-1">
                SUPER CAR EL CHAMI • DATENSCHUTZERKLÄRUNG (DSGVO)
              </span>
              <h3 className="text-xl font-black text-[#0a1d37]">Datenschutzerklärung</h3>
            </div>

            <div className="space-y-5 text-xs text-slate-600 leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">1. Datenschutz auf einen Blick</h5>
                <p>
                  Wir freuen uns über Ihren Besuch auf unserer Seite. Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Nachfolgend informieren wir Sie darüber, welche Daten bei der Nutzung unseres Buchungstools erhoben werden und wie wir diese verarbeiten.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">2. Verantwortliche Stelle</h5>
                <p className="font-semibold text-slate-800">
                  Kassem El Chami, Breddestraße, 58840 Plettenberg, Deutschland.
                </p>
                <p>E-Mail: k.elchami@hotmail.de</p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">3. Datenerhebung bei Online-Terminanfragen</h5>
                <p>
                  Wenn Sie einen Präsentationstermin vereinbaren, erheben wir folgende Pflichtangaben:
                </p>
                <ul className="list-disc pl-5 space-y-1 pt-1">
                  <li>Vor- und Nachname (für die Zuweisung des Termins)</li>
                  <li>E-Mail-Adresse (für die Zusendung der Terminbestätigung)</li>
                  <li>Telefonnummer (für eventuelle Rückfragen bei Ausfall oder Verschiebung)</li>
                  <li>Wunschdatum und Uhrzeit</li>
                </ul>
                <p className="pt-2">
                  Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen).
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">4. Speicherdauer und Weitergabe</h5>
                <p>
                  Die von Ihnen erhobenen Kontaktdaten verbleiben bei uns, bis Sie uns zur Löschung auffordern oder der Zweck für die Datenspeicherung entfällt (z.B. nach erledigtem Besichtigungstermin). Eine Weitergabe an Dritte oder Werbenetzwerke erfolgt zu keinem Zeitpunkt.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0a1d37] text-sm">5. Ihre gesetzlichen Betroffenenrechte</h5>
                <p>
                  Sie haben nach der DSGVO jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO), das Recht auf Berichtigung (Art. 16 DSGVO) sowie auf vollständige Löschung (Art. 17 DSGVO). Senden Sie hierzu einfach eine informelle E-Mail an <span className="font-semibold text-blue-600">k.elchami@hotmail.de</span>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDatenschutz(false)}
                className="bg-[#0a1d37] hover:bg-[#001333] text-white px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Lightbox Slider Modal */}
      <AnimatePresence>
        {showLightbox && (() => {
          const currentImages = getCategoryImages(selectedVehicle.id, activeCategory);
          return (
            <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-6 z-50 select-none animate-fade-in">
              {/* Header toolbar */}
              <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-white/90 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-sm font-bold font-sans tracking-tight">Super Car El Chami • Bilder-Viewer</h4>
                    <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                      {selectedVehicle.brand} {selectedVehicle.model} ({activeGalleryIndex + 1} / {currentImages.length})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLightbox(false)}
                  className="text-white/80 hover:text-white transition bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 cursor-pointer"
                  title="Viewer schließen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Central presentation area */}
              <div className="flex-1 max-w-5xl mx-auto w-full flex items-center justify-between gap-4 py-8">
                {/* Prev lever */}
                {currentImages.length > 1 && (
                  <button
                    onClick={() => setActiveGalleryIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white/90 transition shadow-md cursor-pointer"
                    title="Vorheriges Bild"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Main lightbox photo display container */}
                <div className="flex-1 h-full max-h-[70vh] flex items-center justify-center relative px-2">
                  {currentImages.length > 0 ? (
                    <motion.img
                      key={activeGalleryIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      src={currentImages[activeGalleryIndex] || currentImages[0]}
                      alt={`${selectedVehicle.brand} ${selectedVehicle.model} slide`}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    />
                  ) : (
                    <div className="text-white text-xs font-mono">Kein Bild vorhanden</div>
                  )}
                </div>

                {/* Next lever */}
                {currentImages.length > 1 && (
                  <button
                    onClick={() => setActiveGalleryIndex((prev) => (prev + 1) % currentImages.length)}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center text-white/90 transition shadow-md cursor-pointer"
                    title="Nächstes Bild"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Bottom active description & grid tray */}
              <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-4 text-center pb-2">
                <p className="text-xs text-white/70 font-mono tracking-wide">
                  ANSICHT: <strong className="text-white uppercase">{CATEGORIES.find(c => c.id === activeCategory)?.label} - BILD {activeGalleryIndex + 1}</strong>
                </p>
                
                {/* Dots tracker */}
                {currentImages.length > 0 && (
                  <div className="flex items-center gap-2">
                    {currentImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveGalleryIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                          activeGalleryIndex === idx ? 'bg-blue-400 w-6' : 'bg-white/30 hover:bg-white/50'
                        }`}
                        title={`Zu Bild ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Booking Floating Modal Trigger */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-[#0a1d37]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl relative border border-slate-200 shadow-2xl bg-white"
          >
            {/* Close trigger */}
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-800 transition bg-slate-100/90 p-2.5 rounded-full border border-slate-200 z-10 cursor-pointer"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
            <BookingForm
              vehicles={vehicles}
              initialVehicleId={bookingVehicleId}
              onSuccessClose={() => setTimeout(() => setShowBookingModal(false), 4000)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
