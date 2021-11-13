var express = require("express");
const path = require('path');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
var {PythonShell} = require('python-shell');
const  cors = require('cors');
const port = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set('views', './views');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('./index.ejs')
})

app.get('/chat', (req, res) => {
  res.render('./chat.ejs')
})

app.get('/tordf', (req, res) => {
  xmlString = decodeURI(req.query.file);
  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    args:[xmlString]
  };
  PythonShell.run('xml_to_rdf_new.py', options, function (err, result) {
    if (err) throw err;
    res.format({
      'text/turtle': function (){
        res.send(result);
      }
    })
  });
})

app.get('/action', (req, res) => {
  var pd3 = req.query.name.replace(' ', '')
  res.render('./action.ejs', {pd3: pd3})
})

app.get('/search', (req, res) =>{
  res.render('./search.ejs')
})

app.all('/open', (req, res) => {
  res.render('./open.ejs')
})

app.get('/knowledge', (req, res) => {
  res.render('./knowledge.ejs')
})

app.get('/engineer', (req, res) => {
  res.render('./engineer.ejs')
})

app.get('/hello', (req, res) => {
  console.log('hello');
  return 'hello'
})

io.on('connection', (socket) => {
  socket.on('setUserName', function (userName) {
    console.log(userName);
    if(!userName) userName = '匿名';
    socket.userName = userName;
  });
  socket.on('message',function(msg){
    console.log('message: ' + msg);
    io.emit('message', socket.userName + ': ' + msg);
  });
})

http.listen(port, () => {
  console.log('server listening. port:' + port);
})
