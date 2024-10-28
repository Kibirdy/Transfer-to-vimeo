const fs = require('fs');

// Definer stjernetegn, huse og planeter
const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const planets = ["Sun", "Moon", "Mars", "Mercury", "Venus", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

// Funktion til at generere kombinationer af planeter og tegn (10 planeter × 12 tegn = 120 kombinationer)
function generatePlanetSignCombinations() {
    let combinations = [];
    let id = 1;

    for (let planet of planets) {
        for (let sign of signs) {
            combinations.push({
                id: id,
                name: planet,
                sign: sign,
                vimeoId: "null",
                video: null
            });
            id++;
        }
    }

    return combinations;
}

// Funktion til at generere kombinationer af tegn og huse (12 tegn × 12 huse = 144 kombinationer)
function generateSignHouseCombinations() {
    let combinations = [];
    let id = 121; // Fortsætter ID fra 120

    for (let sign of signs) {
        for (let house of houses) {
            combinations.push({
                id: id,
                sign: sign,
                house: house,
                vimeoId: "null",
                video: null
            });
            id++;
        }
    }

    return combinations;
}

// Generer både planet/tegn og tegn/hus kombinationer og saml dem
let planetSignData = generatePlanetSignCombinations();
let signHouseData = generateSignHouseCombinations();

// Saml begge sæt data i én fil
let combinedData = planetSignData.concat(signHouseData);

// Skriv dataene til en JSON-fil
fs.writeFile('combinations.json', JSON.stringify(combinedData, null, 2), (err) => {
    if (err) throw err;
    console.log('Kombinationerne er gemt i combinations.json');
});
