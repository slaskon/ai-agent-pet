// Orbital elements for planets (J2000 epoch)
const planets = {
  mercury: { name: 'Mercury', a: 0.387, e: 0.206, i: 7.0, L: 77.5, w: 29.1, W: 48.3, period: 87.97 },
  venus: { name: 'Venus', a: 0.723, e: 0.007, i: 3.4, L: 131.6, w: 54.9, W: 76.7, period: 224.70 },
  earth: { name: 'Earth', a: 1.000, e: 0.017, i: 0.0, L: 100.5, w: 102.9, W: 0.0, period: 365.26 },
  mars: { name: 'Mars', a: 1.524, e: 0.093, i: 1.9, L: 355.4, w: 286.5, W: 49.6, period: 686.98 }
};

let currentDate = new Date(2026, 4, 13); // May 13, 2026

// Calculate Julian Date from Date object
function getJulianDate(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn + 0.5;
}

// Calculate T (centuries since J2000)
function getT(jd) {
  return (jd - 2451545.0) / 36525.0;
}

// Calculate mean anomaly for a planet
function getMeanAnomaly(planet, T) {
  const n = 360 / planet.period;
  const M = planet.L - planet.w + n * T * 36525;
  return normalizeAngle(M);
}

// Calculate eccentric anomaly using Newton's method
function getEccentricAnomaly(M, e) {
  M = M * Math.PI / 180;
  let E = M;
  for (let i = 0; i < 10; i++) {
    E = M + e * Math.sin(E);
  }
  return E;
}

// Calculate true anomaly
function getTrueAnomaly(E, e) {
  const v = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  return v * 180 / Math.PI;
}

// Normalize angle to 0-360
function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

// Calculate heliocentric ecliptic coordinates
function getHeliocentricCoords(planet, T) {
  const M = getMeanAnomaly(planet, T);
  const E = getEccentricAnomaly(M * Math.PI / 180, planet.e);
  const v = getTrueAnomaly(E, planet.e);
  
  const r = planet.a * (1 - planet.e * Math.cos(E));
  const x = r * Math.cos((planet.w + v) * Math.PI / 180);
  const y = r * Math.sin((planet.w + v) * Math.PI / 180);
  
  return { x, y, r };
}

// Update planet positions on screen
function updatePlanetPositions() {
  const jd = getJulianDate(currentDate);
  const T = getT(jd);
  
  const solarSystem = document.querySelector('.solar-system');
  const size = Math.min(window.innerWidth * 0.9, 600);
  const scale = (size / 2) / 1.8; // Scale to fit in container
  
  Object.entries(planets).forEach(([key, planet]) => {
    const coords = getHeliocentricCoords(planet, T);
    const screenX = coords.x * scale;
    const screenY = coords.y * scale;
    
    const element = document.getElementById(key);
    if (element) {
      element.style.left = (50 + (screenX / (size / 2)) * 50) + '%';
      element.style.top = (50 + (screenY / (size / 2)) * 50) + '%';
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
