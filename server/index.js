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
  User.find({username:req.body.username, password:req.body.password}, function(err, user){
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

//Real time text editing collaboration
io.on('connection', function (socket) {
  console.log('connected')
  socket.emit('msg', { hello: 'world' });
  socket.userId = '';
  socket.docId = '';
  socket.on('userId', function (data) {
    socket.userId = data
    console.log('socket user set:', socket.userId)
  });
  socket.on('hearMe', ()=>{
    socket.emit('heard')
  })
  socket.to(socket.docId).on('editorStateChange', (editorState) => {
    console.log('hi from client:', editorState)
    socket.broadcast.emit('editorStateChanged', editorState)
  })
  socket.on('getDocs', (userId, next) => {
    console.log('request to getDocs')
    Doc.find({collabs:{$in:[userId]}}, (err, docs) =>{
      if(err){
        console.log('error:', err)
      } else if(docs.length>0){
        console.log('sending docs', docs)
        next(docs)
      } else {
        next([])
      }
    })
  })
  socket.on('updateDoc', ()=>{
    console.log('updating doc')
    socket.to(socket.docId).emit('requestUpdate')
    console.log('id:', socket.docId)
  })
  socket.on('saveDoc',(doc, next)=>{
    console.log('saving doc:', doc)
    console.log('stringified:', JSON.stringify(doc))
    Doc.update({_id:socket.docId}, {body:JSON.stringify(doc)}, (err, doc)=>{
      if(err){
        console.log(err)
      } else{
        console.log('saved', doc)
        next()
      }
    })
  })
  socket.on('joinDocument', (id) =>{
    console.log('joining doc:', id)
    socket.docId = id;
    socket.join(id)
  })
  socket.on('createDocument', (title, next) => {
    console.log('creating doc: ', title)
    console.log('user Id', socket.userId)
    var newDoc = new Doc({
      title: title,
      author: socket.userId,
      collabs: [socket.userId]
    })
    newDoc.save(function(err, doc){
      if(err){
        console.log('failed to save', err)
      } else {
        console.log('saved', doc)
        next(doc)
      }
    })
  })
  socket.on('deleteDoc', (docId, next)=>{
    console.log('deleting doc')
    Doc.deleteOne({_id:docId}, function(err){
      if (err) {console.log(err)}
      else next('success')
    })
  })
  socket.on('addCollaboration', (docId, next)=>{
    console.log('add collaborator')
    Doc.findByIdAndUpdate(docId, {"$push": {collabs:socket.userId}}, (err, doc)=>{
      if(err){
        console.log(err)
        next(false)
      } else if(doc){
        console.log('new doc:', doc)
        next(doc)
      } else{
        next(false)
      }
    })
  })
});


console.log('listening on port 8080')
server.listen(8080);
