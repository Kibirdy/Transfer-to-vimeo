const fs = require('fs');
const path = require('path');

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'PlanetsAndHousesCombi.json');

// The planets data array
const planetsData = [
  { name: 'Sun', fullDegree: 188.75864721638217, normDegree: 8.758647216382172, speed: 0.9837076315948917, isRetro: 'false', sign: 'Libra', house: 9 },
  { name: 'Moon', fullDegree: 174.43023801213224, normDegree: 24.430238012132236, speed: 11.812027132356516, isRetro: 'false', sign: 'Virgo', house: 9 },
  { name: 'Mars', fullDegree: 105.08989528162, normDegree: 15.089895281620002, speed: 0.5226905666833577, isRetro: 'false', sign: 'Cancer', house: 8 },
  { name: 'Mercury', fullDegree: 189.21253347195565, normDegree: 9.212533471955652, speed: 1.7664271325700538, isRetro: 'false', sign: 'Libra', house: 9 },
  { name: 'Jupiter', fullDegree: 81.23540206478187, normDegree: 21.235402064781866, speed: 0.026044694662274923, isRetro: 'false', sign: 'Gemini', house: 7 },
  { name: 'Venus', fullDegree: 220.16460639889092, normDegree: 10.164606398890925, speed: 1.2161134842513557, isRetro: 'false', sign: 'Scorpio', house: 11 },
  { name: 'Saturn', fullDegree: 344.32816753742406, normDegree: 14.328167537424065, speed: -0.06599071312691157, isRetro: 'true', sign: 'Pisces', house: 3 },
  { name: 'Uranus', fullDegree: 56.8941301596778, normDegree: 26.8941301596778, speed: -0.023661292549779233, isRetro: 'true', sign: 'Taurus', house: 6 },
  { name: 'Neptune', fullDegree: 358.2279986142527, normDegree: 28.227998614252726, speed: -0.027146437446078562, isRetro: 'true', sign: 'Pisces', house: 3 },
  { name: 'Pluto', fullDegree: 299.66857461176335, normDegree: 29.668574611763347, speed: -0.0050472500147653015, isRetro: 'true', sign: 'Capricorn', house: 2 },
  { name: 'Ascendant', fullDegree: 247.62577282658992, normDegree: 7.625772826589923, speed: 0, isRetro: 'false', sign: 'Sagittarius', house: 1 }
];

// Read and parse the JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.log('Error reading JSON file:', err);
    return;
  }

  // Parse the JSON data
  let vimeoData = JSON.parse(data);

  // Iterate over the planetsData and find matching entries in the vimeoData
  let matchedData = planetsData.map(planet => {
    // Try to find a match by both name + sign or sign + house (if available)
    let match = vimeoData.find(item => 
      (item.name === planet.name && item.sign === planet.sign && item.vimeoId !== 'null' && item.vimeoId) ||
      (item.sign === planet.sign && item.house === planet.house && item.vimeoId !== 'null' && item.vimeoId)
    );

    if (match) {
      // Return the matched object
      if (match.name) {
        // Planet with sign match
        return { name: match.name, sign: match.sign, vimeoId: match.vimeoId };
      } else if (match.house) {
        // Sign with house match
        return { sign: match.sign, house: match.house, vimeoId: match.vimeoId };
      }
    }
  }).filter(Boolean); // Filter out undefined values

  // Log the matched data
  console.log(matchedData);
});
