var express = require("express");
const path = require('path');
const fs = require('fs')
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
var {PythonShell} = require('python-shell');
const cors = require('cors');
const exec  = require('child_process').exec;
const port = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set('views', './views');

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
  optionsSuccessStatus: 200
}));
app.options('*',cors())
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('./index.ejs')
})

app.get('/top', (req, res) => {
  res.render('./top.ejs')
})

app.get('/second', (req, res) => {
  res.render('./second.ejs')
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

app.all('/openfile/:filepath', (req, res) => {
  filepath = req.params["filepath"].replace(/-/g,'/')
  var data = fs.readFileSync(`${__dirname}/${filepath}`);
  res.contentType("application/pdf");
  res.send(data);
})

app.all('/open/:appName', (req, res) => {
  var appName = req.params["appName"].replace(/-/g,'\ ')
  // ex)
  // Microsoft\ Excel
  // Microsoft\ Word
  openApp = exec(`open -a "${appName}"`, (err, stdout, stderr) => {
    if (err) {
      console.log(`stderr: ${stderr}`)
      return
    } 
    console.log(`stdout: ${stdout}`)
  })
})

app.all('/open/:appName/:filePath', (req, res) => {
  var appName = req.params["appName"].replace(/-/g,'\ ')
  var filePath = req.params["filePath"].replace(/-/g,'/')
  // ex)
  // Microsoft\ Excel
  // Microsoft\ Word
  openApp = exec(`open -a "${appName}" ${filePath}`, (err, stdout, stderr) => {
    if (err) {
      console.log(`stderr: ${stderr}`)
      return
    } 
    console.log(`stdout: ${stdout}`)
  })
})

app.get('/knowledge', (req, res) => {
  res.render('./knowledge.ejs')
})

app.get('/knowledge/:id', (req, res) => {
  id = req.params["id"]
  actionURI = req.query.actionURI
  res.render('./knowledge'+id+'.ejs',{actionURI: actionURI})
})

app.get('/engineer/:id', (req, res) => {
  id = req.params["id"]
  res.render('./engineer'+id+'.ejs')
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
