// YouTube API video uploader using JavaScript/Node.js
// You can find the full visual guide at: https://www.youtube.com/watch?v=gncPwSEzq1s
// You can find the brief written guide at: https://quanticdev.com/articles/automating-my-youtube-uploads-using-nodejs
//
// Upload code is adapted from: https://developers.google.com/youtube/v3/quickstart/nodejs

const fs = require("fs");
const readline = require("readline");
const assert = require("assert");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const categoryIds = {
  Entertainment: 24,
  Education: 27,
  ScienceTechnology: 28,
};

// If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
const TOKEN_PATH = "./" + "client_oauth_token.json";

interface Iinfo {
  reader: string;
  start: number;
  end: number;
}

export const UploadVideo = (title: string, name: string, info: Iinfo) => {
  const videoFilePath = `./src/videos/${name}`;
  assert(fs.existsSync(videoFilePath));

  // Load client secrets from a local file.
  fs.readFile(
    "./client_secret.json",
    function processClientSecrets(err: any, content: any) {
      if (err) {
        console.log("Error loading client secret file: " + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the YouTube API.
      authorize(JSON.parse(content), (auth: any) =>
        uploadVideo(auth, title, name, info)
      );
    }
  );
};

/**
 * Upload the video file.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function uploadVideo(auth: any, title: string, name: string, info: Iinfo) {
  const service = google.youtube("v3");
  const videoFilePath = `./src/videos/${name}`;

  service.videos.insert(
    {
      auth: auth,
      part: "snippet,status",
      requestBody: {
        snippet: {
          title,
          description: `${title} [${info.start}-${info.end}]\nالقارئ ${info.reader}\nسبحان الله وبحمده سبحان الله العظيم♥\nصل على رسول الله\n أدعو لجدتي بالرحمة والمغفرة`,
          tags: "quran,قران الكريم, قران",
          categoryId: 24,
          defaultLanguage: "ar",
          defaultAudioLanguage: "ar",
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream(videoFilePath),
      },
    },
    function (err: any, response: any) {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      console.log(response.data);

      console.log("Video uploaded.");
    }
  );
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: any, callback: any) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err: any, token: any) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client: any, callback: any) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url: ", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", function (code: any) {
    rl.close();
    oauth2Client.getToken(code, function (err: any, token: any) {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token: any) {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err: any) => {
    if (err) throw err;
    console.log("Token stored to " + TOKEN_PATH);
  });
}
