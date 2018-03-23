const express = require('express');
const bodyParser = require('body-parser'); // extracts the body of an incoming request
const multer = require('multer'); // image upload library, getting formdata from requests
const path = require('path');
const fs = require('fs');
const sqlite = require('sqlite');

const server = express();
let g_db = null;

server.set('view engine', 'pug');
server.use(bodyParser.urlencoded({extended: false}));
server.use('/uploads', express.static('./uploads'));

server.get('/', (req, res) => {
  res.render('main');
});

const storage = multer.diskStorage({ // handles where uploads are stored
  destination: (req, file, callback) => {
    callback(null, './uploads') // actual folder on disk where uploads are stored
  },
  filename: (req, file, callback) => {
    console.log(file)
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // filename with date now 
  }
});

const upload = multer({
  storage: multer.diskStorage({
    // ..
  })
})

server.post('/smoelenboek', upload.single('userFile'), async (req, res) => {
      await g_db.run("INSERT INTO photos ( file_extname, dog_name, date_opened ) VALUES ( $file_extname, $dog_name, DATETIME('now') )", {
          $file_extname: req.body.userFile,
          $dog_name: req.body.dogName
        });

    res.end('File is uploaded');
  }
);

server.use(bodyParser.urlencoded({ extended: true }));

server.get('/smoelenboek', async (req, res) => {
  fs.readdir('./uploads', function (err, files) {
    const imageFiles = files.filter(f => !f.startsWith("."));
    // grab the database
    //const dogNameInfo = await g_db.all("SELECT id, file_extname, dog_name, date_opened FROM photos")
    res.render('snoeten', {
      images: imageFiles,
      //dogNameInfo
    });
  });
});

sqlite.open("./photos.sqlite").then(db => {
  g_db = db;
  server.listen(8080);
})