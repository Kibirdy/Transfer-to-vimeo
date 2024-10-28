const fs = require('fs');

// Definér de 12 tegn
const signs = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 
  'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 
  'Capricorn', 'Aquarius', 'Pisces'
];

// Lav en funktion der genererer filnavne baseret på planet og tegn
function generateFilePath(planet, signIndex, sign) {
  return `source-movies/${planet}/${signIndex + 1}-${planet}-${sign}-V-1.mp4`;
}

// Generer alle kombinationer og strukturen for JSON-filen
const combinations = [];

let idCounter = 1;

signs.forEach((moonSign, moonIndex) => {
  signs.forEach((sunSign, sunIndex) => {
    signs.forEach((mercurySign, mercuryIndex) => {
      combinations.push({
        id: idCounter++,  // ID for hver kombination
        vimeoId: null,    // Vimeo ID som ikke er udfyldt endnu
        Sun: {
          sign: sunSign,
          video: generateFilePath('Sun', sunIndex, sunSign),
        },
        Moon: {
          sign: moonSign,
          video: generateFilePath('Moon', moonIndex, moonSign),
        },
        Mercury: {
          sign: mercurySign,
          video: generateFilePath('Mercury', mercuryIndex, mercurySign),
        }
      });
    });
  });
});

// Gem kombinationerne som en JSON-fil
fs.writeFileSync('combinations.json', JSON.stringify(combinations, null, 2));

console.log('JSON-fil med kombinationer oprettet!');
