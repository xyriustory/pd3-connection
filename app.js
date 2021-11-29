var express = require("express");
const path = require('path');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
var {PythonShell} = require('python-shell');
const  cors = require('cors');
const exec  = require('child_process').exec;
const port = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set('views', './views');

app.use(cors());
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
  PythonShell.run('xml_to_rdf.py', options, function (err, result) {
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

app.all('/open/:appName', (req, res) => {
  var appName = req.params["appName"].replace(/_/g,'\ ')
  console.log(appName)
  // ex)
  // Microsoft\ Excel
  // Microsoft\ Word
  openApp = exec(`open -a "${appName}"`, (err, stdout, stderr) => {
    if (err) {
      console.log(`stderr: ${stderr}`)
      res.redirect('/')
      return
    } 
    console.log(`stdout: ${stdout}`)
    res.redirect('/')
  })
})

app.all('/open/:appName/:filePath', (req, res) => {
  var appName = req.params["appName"].replace(/_/g,'\ ')
  var filePath = req.params["filePath"].replace(/_/g,'/')
  console.log(appName)
  // ex)
  // Microsoft\ Excel
  // Microsoft\ Word
  openApp = exec(`open -a "${appName}" ${filePath}`, (err, stdout, stderr) => {
    if (err) {
      console.log(`stderr: ${stderr}`)
      res.redirect('/')
      return
    } 
    console.log(`stdout: ${stdout}`)
    res.redirect('/')
  })
})

app.get('/knowledge/:id', (req, res) => {
  id = req.params["id"]
  res.render('./knowledge'+id+'.ejs')
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
