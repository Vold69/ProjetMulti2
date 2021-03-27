// Dependencie
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var socketIO = require("socket.io");
var socketServeur = socketIO(http);
const bodyParser = require("body-parser");
const spriteBlack = require("./public/js/sprite.player");

// Config port Heroku
const PORT = process.env.PORT || 8080;

// Config MongoDB
const MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb+srv://johan:johan@cluster0.092gy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbName = "JeuMulti";
const coll = "Score";

// Midlleware
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/image", express.static(__dirname + "/public/image"));
app.use("/audio", express.static(__dirname + "/public/audio"));

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// Route
app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/index.html");
});

let pseudo;
app.post("/game", function (req, res, next) {
  console.log(req.body);
  pseudo = req.body.pseudo;
  res.sendFile(__dirname + "/src/game.html");
});

// Game Setup
class Player {
  constructor() {
    this.x = 800 / 2;
    this.y = 480 / 2;
    this.width = 90;
    this.height = 90;
    this.speed = 5;
    this.spriteWidth = 45;
    this.spriteHeight = 45;
    this._id = null;
    this.limit = {
      XMin: false,
      XMax: false,
      YMin: false,
      YMax: false,
    };
    this.action = {
      pressUp: false,
      pressDown: false,
      pressLeft: false,
      pressRight: false,
      pressShoot: false,
    };
    this.sprite = spriteBlack;
  }
}



const player = new Player();
let player2;
let obstaclesArray;
let score;
let life;

// Socket.io Serveur
socketServeur.on("connection", function (socket) {
  console.log("user connect");
  // Données envoyer au Front
  socket.emit("Front", { player, pseudo });
  // Données reçue par le Back
  socket.on("Back", function (data) {
    if (data.player._id != player._id) {
      life = data.life;
      score = data.score;
      player2 = data.player;
      obstaclesArray2 = data.obstaclesArray;
      socket.broadcast.emit("player2", { player2, obstaclesArray2 });
    }
  });
  // Données envoyer a MongoDB
  socket.on("score", function (data) {
    const MongoDBData = data.MongoDBData;
    MongoClient.connect(url, function (err, client) {
      if (err) throw err;
      console.log("Connected successfully to server");
      const dbo = client.db(dbName);
      const update = MongoDBData;
      dbo.collection(coll).insertOne(update, function (err, res) {
        if (err) throw err;
        console.log(`1 document inserted ${res}`);
        client.close();
      });
    });
  });
  socketServeur.on("disconnect", function () {
    console.log("user disconnect");
  });
});
// Port
var server = http.listen(PORT, function () {
  var addresseHote = server.address().address;
  var portEcoute = server.address().port;
  console.log(
    "L'application est disponible à l'adressehttp://%s:%s",
    addresseHote,
    portEcoute
  );
});
