var express = require("express");
const path = require('path');
const exec  = require('child_process').exec;
var app = express();
var {PythonShell} = require('python-shell');
const  cors = require('cors');

app.set("view engine", "ejs");
app.set('views', './views');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('./index.ejs')
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
  // openApp = exec('open -a Autodesk\\ Fusion\\ 360', (err, stdout, stderr) => {
  //     if (err) {
  //       console.log(`stderr: ${stderr}`)
  //       res.redirect('/index.html')
  //       return
  //     } 
  //     console.log(`stdout: ${stdout}`)
  //     res.redirect('/index.html')
  //   })
})

app.get('/knowledge', (req, res) => {
  res.render('./knowledge.ejs')
})

app.get('/engineer', (req, res) => {
  res.render('./engineer.ejs')
})

const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port: " + port);