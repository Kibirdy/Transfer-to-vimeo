const express = require('express');
const Vimeo = require('@vimeo/vimeo').Vimeo;
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
ffmpeg.setFfprobePath(ffprobeStatic.path);

const app = express();
const port = 3000;

app.use(express.json());

const jsonPath = path.join(__dirname, 'combinations.json');

// Helper function for pause
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Opret output-mappen, hvis den ikke findes
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Output directory created:', outputDir);
}

// Hent Vimeo-access token
const ACCESS_TOKEN = 'a8e2f266bcd9056051a0502d74290e29';  // Udskift med dit Vimeo API-token
const client = new Vimeo(null, null, ACCESS_TOKEN);

// POST-rute til at behandle de første 100 kombinationer
app.get('/upload', async (req, res) => {
  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.log('Error reading JSON file:', err);
      res.status(500).json({ message: 'Error reading combinations file' });
      return;
    }

    const combinations = JSON.parse(data).slice(0, 1728);  // De første 100 kombinationer
    const processVideos = async () => {
      for (const combination of combinations) {
        // Tjek om Vimeo ID allerede findes
        if (combination.vimeoId) {
          console.log(`Combination ID ${combination.id} already has a Vimeo ID: ${combination.vimeoId}. Skipping...`);
          continue;  // Spring over, hvis Vimeo ID allerede findes
        }

        const fødselsArray = [
          'source-movies/Ekstra/Intro-V-1.mp4',   // Ekstra intro
          combination.Sun.video,                  // Sol video
          combination.Moon.video,                 // Måne video
          combination.Mercury.video,              // Merkur video
          'source-movies/Ekstra/Outro-V-1.mp4'    // Ekstra outro
        ];

        const outputPath = `output/${combination.id}-video.mp4`;

        try {
          // Flet videoen
          console.log(`Processing combination ID ${combination.id}`);
          await startMerging(fødselsArray, outputPath);
          
          // Upload video til Vimeo
          const vimeoId = await uploadToVimeo(outputPath, combination);

          // Opdater JSON-filen med Vimeo ID, hvis upload lykkedes
          if (vimeoId) {
            updateJsonWithVimeoId(vimeoId, combination.id);
          }

          // Vent før næste upload for at undgå rate-limiting
          await sleep(10000);  // 10 sekunders pause mellem uploads
        } catch (error) {
          console.error(`Error during processing for combination ID ${combination.id}:`, error);
        }
      }

      res.json({ message: 'All videos processed and uploaded successfully with pauses' });
    };

    processVideos(); // Start behandlingen af videoer
  });
});

// FFMPEG logik til at sammenflette videoerne
async function startMerging(fødselsArray, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg({ source: fødselsArray[0] })
      .input(fødselsArray[1])
      .input(fødselsArray[2])
      .input(fødselsArray[3])
      .input(fødselsArray[4])
      .on('start', (commandLine) => {
        console.log('Spawned ffmpeg with command:', commandLine);
      })
      .on('end', () => {
        console.log(`Merging completed for ${outputPath}!`);
        resolve();
      })
      .on('error', (err) => {
        console.log('Error during merging:', err);
        reject(err);
      })
      .complexFilter([
        {
          filter: 'concat',
          options: { n: 5, v: 1, a: 1 },
          inputs: ['0:v', '0:a', '1:v', '1:a', '2:v', '2:a', '3:v', '3:a', '4:v', '4:a'],
          outputs: ['concatVideo', 'concatAudio'],
        }
      ])
      .outputOptions(['-map [concatVideo]', '-map [concatAudio]'])
      .save(outputPath);
  });
}

// Vimeo-upload logik med korrekt afslutning og fejlhåndtering for rate-limiting
async function uploadToVimeo(outputPath, combination) {
  const videoPath = path.join(__dirname, outputPath);

  const videoName = `Id: ${combination.id}, Sun in ${combination.Sun.sign}, Moon in ${combination.Moon.sign}, Mercury in ${combination.Mercury.sign}`;
  const description = 'Your personal horoscope';

  try {
    return new Promise((resolve, reject) => {
      client.upload(
        videoPath,
        {
          name: videoName,  // Viser hvilke tegn planeterne er i
          description: description,  // Sætter beskrivelsen til 'Your personal horoscope'
        },
        (uri) => {
          const vimeoId = uri.split('/').pop();  // Ekstraher video-ID fra URI
          console.log(`Video uploaded successfully for combination ID ${combination.id}, Vimeo ID: ${vimeoId}`);
          resolve(vimeoId);
        },
        (bytes_uploaded, bytes_total) => {
          const percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
          console.log(`Upload progress for combination ID ${combination.id}: ${percentage}%`);
        },
        (error) => {
          console.log(`Failed to upload video for combination ID ${combination.id}:`, error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error(`Error during Vimeo upload for combination ID ${combination.id}:`, error);
    return null;
  }
}

// Opdater JSON-filen med Vimeo ID'et
function updateJsonWithVimeoId(vimeoId, combinationId) {
  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.log('Error reading JSON file:', err);
      return;
    }

    const combinations = JSON.parse(data);
    const combinationToUpdate = combinations.find(c => c.id === combinationId);

    if (combinationToUpdate) {
      combinationToUpdate.vimeoId = vimeoId;
      fs.writeFile(jsonPath, JSON.stringify(combinations, null, 2), (err) => {
        if (err) {
          console.log('Error writing to JSON file:', err);
        } else {
          console.log(`Vimeo ID updated in JSON file for combination ID ${combinationId}.`);
        }
      });
    }
  });
}

// Start serveren
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
