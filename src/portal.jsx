import React from 'react';
import io from 'socket.io-client';
import Document from './document';
import AppBar from 'material-ui/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Icon from '@material-ui/core/Icon';
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from '@material-ui/core/Toolbar';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';

class Portal extends React.Component{
  constructor(props){
    super(props);
    this.socket = io(`http://${process.env.SERVER_URI}:8080`);
    this.state={
      newDocTitle:'',
      mode: 'portal', //portal, document
      docs:[],
      idSwitch:false
    }

  }

  getDocs(){
    console.log('asking server for docs')
    console.log(this.props)
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
      this.setState({mode:'document', currentDoc:doc, docs:this.state.docs.concat(doc)})
    })
  }
  goToDocument(e,doc){
    console.log('goto doc:', doc )
    this.socket.emit('joinDocument', doc._id, (doc)=>{
      console.log('doc received:', doc)
      this.setState({mode:'document', currentDoc:doc})
    })
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

  logout(){
    console.log('logging out')
    this.socket.disconnect();
    this.props.changeToLogin()
  }

  render(){
    if(this.state.mode==='portal'){
      var title = this.props.user.username + "'s Portal"
      return (
        <div>
          <AppBar showMenuIconButton={false} title={title} style={{alignItems:'center'}}>
              <Typography variant='subheading' onMouseDown={()=>this.logout()} style={{cursor:'pointer'}}>
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
                <Button variant="fab" color="secondary" aria-label="Edit" onMouseDown={(e)=>this.goToDocument(e, doc)} style={{width:'35px', height:'35px', boxShadow:'none'}}>
                 <Icon>edit_icon</Icon>
               </Button>
                <Typography style={{marginLeft:'5px', marginRight:'5px', fontSize:'20px'}}>{doc.title}</Typography>
                <Button variant='fab' aria-label="Delete"
                    style={{width:'35px', height:'35px', marginRight:'4px', cursor:'pointer', boxShadow:'none'}}
                   onMouseDown={()=>this.deleteDoc(doc._id)}>
                 <DeleteIcon />
               </Button>
               <Button variant='fab'
                   style={{width:'35px', height:'35px', marginRight:'4px', cursor:'pointer', backgroundColor:'lightblue', boxShadow:'none'}}
                  onMouseDown={()=>this.getShared(doc._id)}>
                <Icon>share</Icon>
              </Button>


                {this.state.idSwitch && this.state.currentId===doc._id ? <Typography> {this.state.currentId}</Typography> : ''}</div>)}})}

              <Typography style={{fontWeight:'bold', fontSize:'20px'}}>Docs Shared To Me</Typography>
              {this.state.docs.map((doc)=>{
                if(this.props.user._id!==doc.author){
                return(
                <div style={{display:'flex', alignItems:'center', margin:'5px'}}>
                  <Button variant="fab" color="secondary" aria-label="Edit" style={{width:'35px', height:'35px', boxShadow:'none'}} onMouseDown={(e)=>this.goToDocument(e, doc)}>
                   <Icon>edit_icon</Icon>
                 </Button>
                <Typography style={{marginLeft:'5px', marginRight:'5px', fontSize:'20px'}}>{doc.title}</Typography>
                <Button variant='fab' aria-label="Delete"
                    style={{width:'35px', height:'35px', marginRight:'4px', cursor:'pointer', boxShadow:'none'}}
                   onMouseDown={()=>this.deleteDoc(doc._id)}>
                 <DeleteIcon />
               </Button>
               <Button variant='fab'
                   style={{width:'35px', height:'35px', marginRight:'4px', cursor:'pointer', backgroundColor:'lightblue', boxShadow:'none'}}
                  onMouseDown={()=>this.getShared(doc._id)}>
                <Icon>share</Icon>
              </Button>
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
        <Document doc={this.state.currentDoc} socket={this.socket} goToPortal={(e)=>this.goToPortal(e)} getDocs={()=>this.getDocs()}/>
      )
    }
  }
}



export default Portal;
