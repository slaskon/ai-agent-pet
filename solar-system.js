// Planet orbital data and colors
const planets = {
  mercury: { name: 'Mercury', color: '#cbd5e1', size: 14 },
  venus: { name: 'Venus', color: '#f6e05e', size: 18 },
  earth: { name: 'Earth', color: '#60a5fa', size: 20 },
  mars: { name: 'Mars', color: '#f97316', size: 16 }
};

let currentDate = new Date(2026, 4, 13); // May 13, 2026
let planetPositions = {};

// Get planet positions from Open-Astronomy or calculate simplified positions
async function getPlanetPositions(date) {
  try {
    // Using a simple astronomical calculation based on known orbital elements
    const jd = getJulianDate(date);
    const T = (jd - 2451545.0) / 36525.0; // Centuries since J2000
    
    // Simplified VSOP87 elements for inner planets with orbital periods
    const elements = {
      mercury: { a: 0.38709927, L: 252.25084, w: 77.45645, e: 0.20563593, period: 87.969, meanMotion: 4.0923 },
      venus: { a: 0.72333566, L: 181.97973, w: 131.60246, e: 0.00677672, period: 224.701, meanMotion: 1.6021 },
      earth: { a: 1.00000261, L: 100.46645, w: 102.93005, e: 0.01671123, period: 365.256, meanMotion: 0.9856 },
      mars: { a: 1.52371034, L: 355.45332, w: 286.27161, e: 0.09336511, period: 686.971, meanMotion: 0.5240 }
    };
    
    const positions = {};
    
    Object.entries(elements).forEach(([key, elem]) => {
      // Mean longitude - use proper mean motion for each planet
      // Days since J2000 epoch
      const daysSinceJ2000 = getJulianDate(new Date(2000, 0, 1, 12, 0, 0)) - jd;
      const daysElapsed = Math.abs(daysSinceJ2000);
      
      // Mean longitude at current date
      const L = (elem.L + elem.meanMotion * daysElapsed) % 360;
      
      // Mean anomaly (simplified)
      const M = (L - elem.w) % 360;
      const M_rad = M * Math.PI / 180;
      
      // Solve Kepler's equation (simplified iteration)
      let E = M_rad;
      for (let i = 0; i < 5; i++) {
        E = M_rad + elem.e * Math.sin(E);
      }
      
      // True anomaly
      const nu = 2 * Math.atan2(
        Math.sqrt(1 + elem.e) * Math.sin(E / 2),
        Math.sqrt(1 - elem.e) * Math.cos(E / 2)
      );
      
      // Distance
      const r = elem.a * (1 - elem.e * elem.e) / (1 + elem.e * Math.cos(nu));
      
      // Heliocentric coordinates
      const x = r * Math.cos(nu);
      const y = r * Math.sin(nu);
      
      positions[key] = { x, y, r, angle: nu * 180 / Math.PI };
    });
    
    return positions;
  } catch (e) {
    console.error('Error calculating positions:', e);
    return {};
  }
}

// Calculate Julian Date
function getJulianDate(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
            Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn + 0.5;
}

// Update planet positions on screen
async function updatePlanetPositions() {
  planetPositions = await getPlanetPositions(currentDate);
  
  const solarSystem = document.querySelector('.solar-system');
  if (!solarSystem) return;
  
  const size = Math.min(window.innerWidth * 0.9, 600);
  const centerX = size / 2;
  const centerY = size / 2;
  const scale = (size / 2) * 0.8; // Leave some margin
  
  Object.entries(planets).forEach(([key, planet]) => {
    const pos = planetPositions[key];
    if (!pos) return;
    
    // Convert heliocentric coordinates to screen coordinates
    const screenX = centerX + (pos.x * scale);
    const screenY = centerY + (pos.y * scale);
    
    const element = document.getElementById(key);
    if (element) {
      element.style.left = screenX + 'px';
      element.style.top = screenY + 'px';
      element.style.position = 'absolute';
      element.style.transform = 'translate(-50%, -50%)';
    }
  });
}

// Update date display
function updateDateDisplay() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = currentDate.toLocaleDateString('en-US', options);
  document.getElementById('dateLabel').textContent = dateString;
  updatePlanetPositions();
}

// Navigate dates
function previousDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateDisplay();
}

function nextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDateDisplay();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prevBtn').addEventListener('click', previousDay);
  document.getElementById('nextBtn').addEventListener('click', nextDay);
  updateDateDisplay();
  
  // Update on window resize
  window.addEventListener('resize', updatePlanetPositions);
});
