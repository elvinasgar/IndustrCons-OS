/* ==========================================================================
   IndustrCons OS — CALCULATORS ENGINE
   Pure functions; UI layer in modules.js calls these.
   ========================================================================== */
const CALC = {

  // Concrete volume + approximate material breakdown (per m3, common mix ratios)
  concrete({ length, width, height, wastePct = 5, mix = '1:2:4' }) {
    const volume = length * width * height;
    const withWaste = volume * (1 + wastePct / 100);
    const ratios = {
      '1:1.5:3': { cement: 8.0, sand: 0.45, aggregate: 0.9 },   // bags/m3 (50kg), m3/m3
      '1:2:4':   { cement: 6.4, sand: 0.47, aggregate: 0.90 },
      '1:3:6':   { cement: 4.6, sand: 0.50, aggregate: 0.95 },
    };
    const r = ratios[mix] || ratios['1:2:4'];
    return {
      volume: round2(volume),
      volumeWithWaste: round2(withWaste),
      cementBags: round2(withWaste * r.cement),
      sandM3: round2(withWaste * r.sand),
      aggregateM3: round2(withWaste * r.aggregate),
      waterLiters: round2(withWaste * 180), // ~180L/m3 typical
    };
  },

  // Rebar weight from diameter (mm) and total length (m), standard steel density
  rebar({ diameterMm, totalLengthM, wastePct = 3 }) {
    // unit weight kg/m = d^2/162 (standard steel rebar formula)
    const unitWeight = (diameterMm * diameterMm) / 162;
    const totalKg = unitWeight * totalLengthM * (1 + wastePct / 100);
    return {
      unitWeightKgM: round3(unitWeight),
      totalKg: round2(totalKg),
      totalTon: round3(totalKg / 1000),
    };
  },

  // Excavation volume + truck trips estimate
  excavation({ length, width, depth, truckCapacityM3 = 10, bulkingPct = 20 }) {
    const volume = length * width * depth;
    const bulked = volume * (1 + bulkingPct / 100);
    const trips = Math.ceil(bulked / truckCapacityM3);
    return {
      volume: round2(volume),
      bulkedVolume: round2(bulked),
      truckTrips: trips,
    };
  },

  // Simple BOQ line total + summary
  boqTotal(rows) {
    return rows.reduce((sum, r) => sum + (Number(r.qty) || 0) * (Number(r.unitPrice) || 0), 0);
  },
};

function round2(n) { return Math.round(n * 100) / 100; }
function round3(n) { return Math.round(n * 1000) / 1000; }
