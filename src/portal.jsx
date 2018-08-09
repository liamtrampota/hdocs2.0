import React from 'react';
import io from 'socket.io-client';
import Document from './document';
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

  componentDidMount() {

    this.socket.on('connect', () => {
      this.socket.on('msg', (data) => {
        console.log('ws msg:', data);
        console.log(this.props)
        this.socket.emit('userId',  this.props.user._id)
      });

      this.socket.emit('getDocs', this.props.user._id, (docs)=>{
        console.log('Docs Received ', docs);
        this.setState({docs:docs})
      }
    )
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
    this.setState({currentId:id, idSwitch:true})
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
        this.setState({docs:newDocs})
      }
    })
  }

  render(){
    if(this.state.mode==='portal'){
      return (
        <div>
          <h1 style={{borderBottom:'2px solid grey', backgroundColor:'lightblue',  margin:'0px', padding:'20px'}}>Username's Portal</h1>
          <div>
          <div style={{marginTop:'5px', marginLeft:'5px'}}>
            <input placeholder='new document title' value={this.state.newDocTitle} onChange={(e)=>this.handleChange(e)}/>
            <button onClick={()=>this.handleClick()}>Create Document</button>
            {this.state.docs.map((doc)=><div><button onClick={(e)=>this.goToDocument(e,doc)}>X</button><spam>{doc.title}</spam><button onClick={()=>this.getShared(doc._id)}>get shared id</button></div>)}
            {this.state.idSwitch ? <spam>the id to use:{this.state.currentId}</spam> : ''}
            <input placeholder='new document title' value={this.state.docId} onChange={(e)=>this.handleIdChange(e)}/>
            <button onClick={()=>this.handleIdClick()}>Create Document</button>
          </div>
          </div>
        </div>
      )
    } else {
      console.log('currentDoc :',this.state.currentDoc);
      return(
        <Document doc={this.state.currentDoc} socket={this.socket} goToPortal={(e)=>this.goToPortal(e)}/>
      )
    }
  }
}

export default Portal;
