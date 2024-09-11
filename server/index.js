const express = require('express');
const multer = require('multer');
const cors = require('cors');
const uuid = require('uuid').v4;
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');
const { stderr, stdout } = require('process');

const app = express();

const PORT = 4000;

// multer middleware
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads")
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + uuid() + path.extname(file.originalname))
    }
})


// multer configuration
const upload = multer({storage: storage});

app.use(cors({
    origin: ["http://localhost:4000", "http://localhost:5173"],
    credentials: true,
}))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next()
  })

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/uploads", express.static("uploads"))

app.post("/upload", upload.single('file'), function(req, res){
    const videoID = uuid();
    const videoPath = req.file.path;
    const outputPath = `./uploads/videos/${videoID}`;
    const hlsPath = `${outputPath}/index.m3u8`;

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, {recursive: true})
    }
    console.log("hlsPath: ", hlsPath);

    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.log(`exec error: ${error}`)
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
        const videoUrl = `http://localhost:4000/uploads/videos/${videoID}/index.m3u8`;
    
        res.json({
          message: "Video converted to HLS format",
          videoUrl: videoUrl,
          videoID: videoID,
        })
      })

})

app.get('/', (req, res) => {
    res.send("Video Streaming Backend");
})

app.listen(PORT, () => {
    console.log(`The server is listening at Port: ${PORT}`);
})