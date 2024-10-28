const express = require('express');
const Vimeo = require('@vimeo/vimeo').Vimeo;
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

const jsonPath = path.join(__dirname, 'combinations.json');

// Hent Vimeo-access token
const ACCESS_TOKEN = 'a8e2f266bcd9056051a0502d74290e29'; // Udskift med dit Vimeo API-token
const client = new Vimeo(null, null, ACCESS_TOKEN);

// Function to update the Vimeo video name
async function updateVimeoVideoName(vimeoId, newVideoName) {
  return new Promise((resolve, reject) => {
    client.request({
      method: 'PATCH',
      path: `/videos/${vimeoId}`,
      query: {
        name: newVideoName
      }
    }, (error, body, statusCode, headers) => {
      if (error) {
        console.log('Error updating video name:', error);
        reject(error);
      } else {
        console.log(`Video name updated to "${newVideoName}" for Vimeo ID: ${vimeoId}`);
        resolve();
      }
    });
  });
}

// POST-rute til at uploade og opdatere video-navn
app.get('/update-vimeo-names', async (req, res) => {
  fs.readFile(jsonPath, 'utf8', async (err, data) => {
    if (err) {
      console.log('Error reading JSON file:', err);
      res.status(500).json({ message: 'Error reading combinations file' });
      return;
    }

    const combinations = JSON.parse(data).slice(0, 1728); // Behandler alle kombinationer
    const processVideos = async () => {
      for (const combination of combinations) {
        const vimeoId = combination.vimeoId;

        if (!vimeoId) {
          console.log(`Combination ID ${combination.id} does not have a Vimeo ID. Skipping...`);
          continue; // Hvis Vimeo ID mangler, springes det over
        }

        // Opretter det nye navn baseret på planetkombinationerne
        const newVideoName = `Sun in ${combination.Sun.sign}, Moon in ${combination.Moon.sign}, Mercury in ${combination.Mercury.sign}`;

        try {
          // Opdater Vimeo-videoens navn
          await updateVimeoVideoName(vimeoId, newVideoName);
        } catch (error) {
          console.error(`Error updating name for Vimeo ID ${vimeoId}:`, error);
        }
      }
      res.json({ message: 'All video names updated on Vimeo' });
    };

    await processVideos();
  });
});

// Start serveren
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
