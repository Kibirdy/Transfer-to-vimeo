
const express = require('express');
const Vimeo = require('@vimeo/vimeo').Vimeo;
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());

const ACCESS_TOKEN = 'a8e2f266bcd9056051a0502d74290e29';  // Udskift med dit Vimeo API-token
const client = new Vimeo(null, null, ACCESS_TOKEN);

// Video struktur (Sun, Moon, Mercury i alle 12 stjernetegn)
const videos = {
    Sun: {
      Aries: "source-movies/Sun/1-Sun-Aries-V-1.mp4",
      Taurus: "source-movies/Sun/2-Sun-Taurus-V-1.mp4",
      Gemini: "source-movies/Sun/3-Sun-Gemini-V-1.mp4",
      Cancer: "source-movies/Sun/4-Sun-Cancer-V-1.mp4",
      Leo: "source-movies/Sun/5-Sun-Leo-V-1.mp4",
      Virgo: "source-movies/Sun/6-Sun-Virgo-V-1.mp4",
      Libra: "source-movies/Sun/7-Sun-Libra-V-1.mp4",
      Scorpio: "source-movies/Sun/8-Sun-Scorpio-V-1.mp4",
      Sagittarius: "source-movies/Sun/9-Sun-Sagittarius-V-1.mp4",
      Capricorn: "source-movies/Sun/10-Sun-Capricorn-V-1.mp4",
      Aquarius: "source-movies/Sun/11-Sun-Aquarius-V-1.mp4",
      Pisces: "source-movies/Sun/12-Sun-Pisces-V-1.mp4"
    },
    Moon: {
      Aries: "source-movies/Moon/1-Moon-Aries-V-1.mp4",
      Taurus: "source-movies/Moon/2-Moon-Taurus-V-1.mp4",
      Gemini: "source-movies/Moon/3-Moon-Gemini-V-1.mp4",
      Cancer: "source-movies/Moon/4-Moon-Cancer-V-1.mp4",
      Leo: "source-movies/Moon/5-Moon-Leo-V-1.mp4",
      Virgo: "source-movies/Moon/6-Moon-Virgo-V-1.mp4",
      Libra: "source-movies/Moon/7-Moon-Libra-V-1.mp4",
      Scorpio: "source-movies/Moon/8-Moon-Scorpio-V-1.mp4",
      Sagittarius: "source-movies/Moon/9-Moon-Sagittarius-V-1.mp4",
      Capricorn: "source-movies/Moon/10-Moon-Capricorn-V-1.mp4",
      Aquarius: "source-movies/Moon/11-Moon-Aquarius-V-1.mp4",
      Pisces: "source-movies/Moon/12-Moon-Pisces-V-1.mp4"
    },
    Mercury: {
      Aries: "source-movies/Mercury/1-Mercury-Aries-V-1.mp4",
      Taurus: "source-movies/Mercury/2-Mercury-Taurus-V-1.mp4",
      Gemini: "source-movies/Mercury/3-Mercury-Gemini-V-1.mp4",
      Cancer: "source-movies/Mercury/4-Mercury-Cancer-V-1.mp4",
      Leo: "source-movies/Mercury/5-Mercury-Leo-V-1.mp4",
      Virgo: "source-movies/Mercury/6-Mercury-Virgo-V-1.mp4",
      Libra: "source-movies/Mercury/7-Mercury-Libra-V-1.mp4",
      Scorpio: "source-movies/Mercury/8-Mercury-Scorpio-V-1.mp4",
      Sagittarius: "source-movies/Mercury/9-Mercury-Sagittarius-V-1.mp4",
      Capricorn: "source-movies/Mercury/10-Mercury-Capricorn-V-1.mp4",
      Aquarius: "source-movies/Mercury/11-Mercury-Aquarius-V-1.mp4",
      Pisces: "source-movies/Mercury/12-Mercury-Pisces-V-1.mp4"
    }
  };

// Stien til JSON-filen, der skal opdateres med Vimeo ID'er
const jsonFilePath = path.join(__dirname, 'PlanetsAndHousesCombi.json');

// Global variabel til at sikre, at der kun uploades én video ad gangen
let isUploading = false;

// Hjælpefunktion til at opdatere JSON-filen med Vimeo ID
function updateJsonWithVimeoId(vimeoId, planet, sign) {
  // Læs den eksisterende JSON-fil
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.log('Error reading JSON file:', err);
      return;
    }

    let jsonData = JSON.parse(data);

    // Find den kombination, der matcher planeten og tegnet
    const combinationToUpdate = jsonData.find(c => c.name === planet && c.sign === sign);

    if (combinationToUpdate) {
      // Opdater Vimeo ID'et for den fundne kombination
      combinationToUpdate.vimeoId = vimeoId;

      // Skriv den opdaterede JSON-fil tilbage til filsystemet
      fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.log('Error writing to JSON file:', err);
        } else {
          console.log(`Vimeo ID updated in JSON file for ${planet} in ${sign}.`);
        }
      });
    } else {
      console.log(`Combination not found for ${planet} in ${sign}`);
    }
  });
}

// Hjælpefunktion til at uploade en video til Vimeo
async function uploadVideoToVimeo(videoPath, videoName, planet, sign) {
  if (isUploading) {
    console.log('Another upload is in progress. Waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));  // Tjek hver sekund
    return uploadVideoToVimeo(videoPath, videoName, planet, sign);  // Genforsøg
  }

  isUploading = true;  // Lås upload-processen

  return new Promise((resolve, reject) => {
    client.upload(
      videoPath,
      {
        name: videoName,
        description: 'Automatically uploaded horoscope video',
      },
      (uri) => {
        const vimeoId = uri.split('/').pop();  // Ekstraher Vimeo video-ID fra URI
        console.log(`Video uploaded successfully: ${videoName}, Vimeo ID: ${vimeoId}`);
        updateJsonWithVimeoId(vimeoId, planet, sign);  // Opdater JSON med Vimeo ID
        isUploading = false;  // Frigør låsen
        resolve(vimeoId);
      },
      (bytes_uploaded, bytes_total) => {
        const percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
        console.log(`Upload progress for ${videoName}: ${percentage}%`);
      },
      (error) => {
        console.error(`Failed to upload video: ${videoName}`, error);
        isUploading = false;  // Frigør låsen, selv ved fejl
        reject(error);
      }
    );
  });
}

// Upload alle videoer fra strukturen sekventielt
app.get('/upload-videos', async (req, res) => {
  try {
    for (const planet in videos) {
      for (const sign in videos[planet]) {
        const videoPath = videos[planet][sign];  // Sti til videoen
        const videoName = `${planet} in ${sign}`;  // Navn til Vimeo (f.eks. "Sun in Aries")

        // Tjek om filen findes
        if (fs.existsSync(videoPath)) {
          console.log(`Uploading video: ${videoName}`);
          await uploadVideoToVimeo(videoPath, videoName, planet, sign);  // Vent på at upload er fuldført
          
          // Vent lidt mellem uploads for at undgå rate-limiting
          await new Promise(resolve => setTimeout(resolve, 5000));  // 5 sekunders pause mellem uploads
        } else {
          console.log(`Video not found: ${videoPath}`);
        }
      }
    }

    res.json({ message: 'All videos uploaded successfully' });
  } catch (error) {
    console.error('Error uploading videos:', error);
    res.status(500).json({ message: 'Error uploading videos', error });
  }
});

// Start serveren
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


