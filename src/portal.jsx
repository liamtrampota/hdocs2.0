import React from 'react';
import io from 'socket.io-client';
import Document from './document';
import AppBar from 'material-ui/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Toolbar from '@material-ui/core/Toolbar';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';

class Portal extends React.Component{
  constructor(props){
    super(props);
    this.socket = io('http://10.1.10.41:8080');
    this.state={
      newDocTitle:'',
      mode: 'portal', //portal, document
      docs:[],
      idSwitch:false
    }

  }

  getDocs(){
    this.socket.emit('getDocs', this.props.user._id, (docs)=>{
      console.log('Docs Received ', docs);
      this.setState({docs:docs})
    })
  }

  componentDidMount() {

    this.socket.on('connect', () => {
      this.socket.on('msg', (data) => {
        console.log('ws msg:', data);
        console.log(this.props)
        this.socket.emit('userId',  this.props.user._id)
      });
      this.getDocs();
      // this.socket.emit('getDocs', this.props.user._id, (docs)=>{
      //   console.log('Docs Received ', docs);
      //   this.setState({docs:docs})
      // }
    });
    this.socket.on('disconnect', () => {
      console.log('diconnected');
      this.props.changeToLogin()
    });
  }

  handleChange(e){
    this.setState({newDocTitle:e.target.value})
  }

  handleClick(){
    console.log('handling create doc click...')
    this.socket.emit('createDocument', this.state.newDocTitle, (doc)=>{
      console.log('document created received')
      this.setState({mode:'document', currentDoc:doc})
    })
  }
  goToDocument(e,doc){
    console.log('currentDoc:' )
    this.setState({mode:'document', currentDoc:doc})
    this.socket.emit('joinDocument', doc._id)
  }
  goToPortal(e){
    // console.log('currentDoc:' )
    // var result=prompt('are you sure yes/no')
    // if(result===yes){
    this.setState({mode:'portal'})
    //}
  }
  getShared(id){
    this.setState({currentId:id, idSwitch:!this.state.idSwitch})
  }
  handleIdChange(e){
    this.setState({docId:e.target.value})
  }
  handleIdClick(){
    this.socket.emit('addCollaboration', this.state.docId, (data)=>{
      if(data){
        console.log('data:', data);
        var newDocs=this.state.docs.concat([data])
        console.log('newDocs:', newDocs);
        this.setState({docs:newDocs, docId:''})
      }
    })
  }

  deleteDoc(docId){
      if(confirm("Are you sure you want to delete?")){
        this.socket.emit('deleteDoc', docId , (data)=>{
          var index;
          this.state.docs.forEach(function(doc, ind){
            if(doc._id === docId){
              index=ind
            }
          })
          var newDocs = this.state.docs.slice()
          newDocs.splice(index, 1)
          this.setState({docs:newDocs})
        })
      }
  }

  render(){
    if(this.state.mode==='portal'){
      var title = 'ML Portal - ' + this.props.user.username
      return (
        <div>
          <AppBar showMenuIconButton={false} title={title} style={{alignItems:'center'}}>
              <Typography variant='subheading' onMouseDown={()=>this.props.changeToLogin()} style={{cursor:'pointer'}}>
                Logout
              </Typography>
          </AppBar>
            <div style={{marginTop:'5px', marginLeft:'5px'}}>
              <TextField hintText="Document Title" value={this.state.newDocTitle} onChange={e => this.handleChange(e)} />
              <RaisedButton onMouseDown={e => this.handleClick(e)} label='Create document' primary={true} />

              <Typography style={{fontWeight:'bold', fontSize:'20px'}}>My Docs</Typography>
              {this.state.docs.map((doc)=>{
                console.log('user:', this.props.user)
                console.log('doc:', doc)
                if(this.props.user._id===doc.author){
                return(
                <div style={{display:'flex', alignItems:'center', margin:'5px'}}>
                <button onClick={(e)=>this.goToDocument(e,doc)} style={{cursor:'pointer'}}>                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button><Typography style={{marginLeft:'5px', marginRight:'5px', fontSize:'20px'}}>{doc.title}</Typography>
                <button style={{marginRight:'5px', backgroundColor:'red',}} onClick={()=>this.deleteDoc(doc._id)}><Typography style={{color:'white'}}>X</Typography></button>
                <button onClick={()=>this.getShared(doc._id)}><Typography>Toggle Share Id</Typography></button>
                {this.state.idSwitch && this.state.currentId===doc._id ? <Typography> {this.state.currentId}</Typography> : ''}</div>)}})}

              <Typography style={{fontWeight:'bold', fontSize:'20px'}}>Shared To Me</Typography>
              {this.state.docs.map((doc)=>{
                if(this.props.user._id!==doc.author){
                return(
                <div style={{display:'flex', alignItems:'center', margin:'5px'}}>
                <button onClick={(e)=>this.goToDocument(e,doc)} style={{cursor:'pointer'}}>                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button><Typography style={{marginLeft:'5px', marginRight:'5px', fontSize:'20px'}}>{doc.title}</Typography><button onClick={()=>this.getShared(doc._id)}>
                  <button style={{marginRight:'5px', backgroundColor:'red',}} onClick={()=>this.deleteDoc(doc._id)}><Typography style={{color:'white'}}>X</Typography></button>
                  <Typography>Toggle Share Id</Typography></button>
                {this.state.idSwitch && this.state.currentId===doc._id ? <Typography> {this.state.currentId}</Typography> : ''}</div>)}})}


              <br></br>
              <TextField hintText='Document Share Id' value={this.state.docId} onChange={(e)=>this.handleIdChange(e)}/>
              <RaisedButton onMouseDown={()=>this.handleIdClick()} label='Start Collab'/>
            </div>
        </div>
      )
    } else {
      console.log('currentDoc :',this.state.currentDoc);
      return(
        <Document doc={this.state.currentDoc} socket={this.socket} goToPortal={(e)=>this.goToPortal(e)} getDocs={this.getDocs}/>
      )
    }
  }
}



export default Portal;
