var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var io = require('socket.io')(server);
import {User, Doc} from '../models/model.js'

// view engine setup

mongoose.connect(process.env.MONGODB_URI);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(cookieParser());

//registration
app.post('/register', function(req, res, next){
  console.log('register, req.body:', req.body)
  if(!(req.body.username && req.body.password && req.body.password==req.body.confirm)){
    res.json('invalid register info')
    return;
  } else {
    User.findOne({username: req.body.username})
    .then(function(user){
      if(!user){
        var newUser = new User({
          username: req.body.username,
          password: req.body.password
        })
        newUser.save()
         .then(()=>res.json('success registration'))
         .catch(()=>res.send('cant save'))
      } else {
        res.status(400).json({user, message:'user already exists'});
      }
    })
    .catch(function(){
      res.send('database error');
    })
  }
})



app.post('/login', (req, res) => {
  console.log('login req.body:', req.body)
  User.findOne({username:req.body.username, password:req.body.password}, function(err, user){
    if(err){
      console.log('error', err)
      res.status(400).json('error occured')
    } else if(user){
      console.log('found login', user)
      res.status(200).json(user)
    } else {
      res.status(400).json('incorrect username/ password')
    }
  })
})

app.post('/createDocument', function(req, res){
  console.log('req.user:', req.user)
  console.log('req.session:', req.session)
  console.log('body:', req.body)
  res.json('received document')
})

//Real time text editing collaboration
io.on('connection', function (socket) {
  console.log('connected')
  socket.emit('msg', { hello: 'world' });
  socket.on('cmd', function (data) {
    console.log(data);
  });
  socket.on('hearMe', ()=>{
    socket.emit('heard')
  })
  socket.on('editorStateChange', (editorState) => {
    console.log('hi from client:',editorState)
    socket.broadcast.emit('editorStateChanged', editorState)
  })
});


console.log('listening on port 8080')
server.listen(8080);
