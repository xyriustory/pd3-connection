var express = require("express");
const path = require('path');
var app = express();


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) =>{
  res.sendFile('/index.html')
})

app.get('/knowledge', (req, res) => {
  res.sendFile('/knowledge.html')
})

const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port: " + port);