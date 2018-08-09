import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import io from 'socket.io-client';
import axios from 'axios';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode:'login', //login, portal,
      currentDoc: ''
    };
    this.changeToLogin=this.changeToLogin.bind(this)
  }

  changeToPortal(user){
    this.setState({mode:'portal', user:user[0]})
  }

  changeToLogin(){
    this.setState({mode:'login', user:''})
  }

  openDocument(id){
    this.setState({mode:'document', currentDoc:id})
  }

  render() {
    if(this.state.mode==='login'){
      return (
        <div>
          <LoginAndRegister changeToPortal={(username)=>this.changeToPortal(username)}/>
        </div>);
    } else {
        return(
          <Portal openDocument={(id)=>this.openDocument(id)} user={this.state.user} changeToLogin={this.changeToLogin}/>
        )
      }
    }
}

class LoginAndRegister extends React.Component {
  constructor(props){
    super(props)
    this.state={
      loginMode:true, //true:login, false:register
      username: '',
      password: '',
      repeatPassword: ''
    }
  }

  handleClick(e, type){
    console.log('type : ' + type)
    console.log(this.state.username, this.state.password)
    if(type==="login"){
      console.log('handling login click...')
      fetch('http://10.1.10.41:8080/login', {
        method: "POST",
        headers: {
          Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        }),
      })
        .then((response) => {
          console.log(response)
          return response.json()
        })
        .then((responseJson) => {
          if(responseJson){
            console.log(responseJson)
            this.props.changeToPortal(responseJson)
          }
        })
        .catch((error) => {
          console.log(error);
        })

      this.setState({username:'', password:'', onSwitch:!this.state.onSwitch})
      //change onSwitch socket.emit('login')
      //if success chanage the state
    }
    if(type==="register"){
      console.log('handling register click...')
      fetch('http://10.1.10.41:8080/register', {
        method: "POST",
        headers: {
          Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
          confirm: this.state.repeatPassword
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if(responseJson){
            console.log(responseJson)
            this.setState({username:'', password:'', repeatPassword:'', loginMode:true})
          }
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }

  handleChange(e,type){
    if(type==="username"){
      this.setState({username:e.target.value})
    }
    if(type==="password"){
      this.setState({password:e.target.value})
    }
    if(type==="repeat"){
      this.setState({repeatPassword:e.target.value})
    }
  }

  change(){
    console.log('toggle login/register:', this.state.loginMode)
    this.setState({loginMode:(!this.state.loginMode)})
  }


  render(){
    return(
      <div>
        {(this.state.loginMode) ?
        <button onClick={()=>this.change()}>Register</button> :
        <button onClick={()=>this.change()}>Login</button>}

        <h1>Welcome to TLM Docs</h1>

        <input type="text" name="username" placeholder="Username" value={this.state.username} onChange={(e)=>this.handleChange(e, 'username')} /><br/>
        <input type="password" name="password" placeholder="Password" value={this.state.password} onChange={(e)=>this.handleChange(e, 'password')}/><br/>
        {(this.state.loginMode===false) ?
        <input style = {{display: 'block'}} type="password" name="repeatPassword" placeholder="repeat your password" value={this.state.repeatPassword} onChange={(e)=>this.handleChange(e, 'repeat')}/> : <div></div>}
        {this.state.loginMode ? <button onClick={(e)=>{this.handleClick(e, 'login'); console.log('running')}}>Login</button> : <button onClick={(e)=> this.handleClick(e, 'register')}>Register</button>}
      </div>
    )
  }
}












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












class Document extends React.Component {
  constructor(props) {
    super(props);
    var editorState;
    this.state = {
      editorState: EditorState.createEmpty(),
    };
    this.onChange = (editorState) => {
      console.log('on Change')
      this.setState({editorState}, ()=>{
        const contentState = editorState.getCurrentContent()
        console.log('sending to server:', convertToRaw(contentState))
        this.props.socket.emit('editorStateChange', convertToRaw(contentState))
      })
    };
  }

  componentDidMount(){
    console.log('props', this.props)
    if(this.props.doc.body){
      console.log('body to convert:', this.props.doc.body)
      var body=JSON.parse(this.props.doc.body)
      var contentState=convertFromRaw(body);
      this.setState({editorState:EditorState.createWithContent(contentState)})
    }
    console.log('props',this.props)
    this.props.socket.on('editorStateChanged', (data)=>{
      console.log('raw data', data)
      var contentState = convertFromRaw(data)
      console.log('hello from sever:', contentState)
      this.setState({editorState:EditorState.createWithContent(contentState)})
    })
    this.props.socket.emit('updateDoc');
    this.props.socket.on('requestUpdate',()=>{
      const contentState = this.state.editorState.getCurrentContent()
      console.log('sending to server:', convertToRaw(contentState))
      this.props.socket.emit('editorStateChange', convertToRaw(contentState))
    })

  }
  save(){
    const contentState = this.state.editorState.getCurrentContent()
    console.log('saving to server:', convertToRaw(contentState))
    this.props.socket.emit('saveDoc', convertToRaw(contentState))
  }
  handleType(e, type) {
    e.preventDefault()
    if(type=='bold'){
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
    }
    if(type=='italic'){
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
    }
    if(type=='underline'){
      this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
    }
  }
  showColorMenu(){
    if (this.state.display === 'none'){
      this.setState({
        display: 'block'
      })
    } else {
      this.setState({
        display: 'none'
      })
    }
  }

  changeColor(newColor) {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, newColor));
  }

  changeSize(size){
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, size));
  }

  bulletedList(e){
    e.preventDefault()
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item'));
  }

  numberedList(e){
    e.preventDefault()
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'ordered-list-item'));
  }


  changeFont(value){
    console.log("FONT", value);
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, value));
  }


  render(){
    return(
      <div>
        <button onMouseDown={(e) => this.handleType(e,'bold')}>BOLD</button>
        <button onMouseDown={(e) => this.handleType(e,'italic')}>ITALIC</button>
        <button onMouseDown={(e) => this.handleType(e,'underline')}>UNDERLINE</button>
        <button onMouseDown={() => this.showColorMenu()} className="dropbtn">COLOR</button>
          <div className="dropdown-content" style = {{
            display: this.state.display,
            position: 'absolute',
            backgroundColor: '#f1f1f1',
            minWidth: '100px',
            boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
            zIndex: 1
          }}>
            <button onMouseDown= {() => this.changeColor('red')} style = {{display: 'block', backgroundColor: 'red', width: '100px'}}>Red</button>
            <button onMouseDown={() => this.changeColor('orange')} style = {{display: 'block', backgroundColor: 'orange', width: '100px'}}>Orange</button>
            <button onMouseDown={() => this.changeColor('yellow')} style = {{display: 'block', backgroundColor: 'yellow', width: '100px'}}>Yellow</button>
            <button onMouseDown={() => this.changeColor('green')} style = {{display: 'block', backgroundColor: 'green', width: '100px'}}>Green</button>
            <button onMouseDown={() => this.changeColor('blue')} style = {{display: 'block', backgroundColor: 'blue', width: '100px'}}>Blue</button>
            <button onMouseDown={() => this.changeColor('purple')} style = {{display: 'block', backgroundColor: 'purple', width: '100px'}}>Purple</button>
          </div>
        <button onMouseDown= {() => this.changeSize('TWELVE')}>12</button>
        <button onMouseDown={() => this.changeSize('FOURTEEN')}>14</button>
        <button onMouseDown={() => this.changeSize('SIXTEEN')}>16</button>
        <button onMouseDown={() => this.changeSize('EIGHTEEN')}>18</button>
        <button onMouseDown={() => this.changeSize('EIGHTEEN')}>20</button>
        <button onMouseDown={() => this.changeFont('Helvetica')} style = {{fontFamily: 'Helvetica'}}>Helvetica</button>
        <button onMouseDown={() => this.changeFont('Times New Roman')} style = {{fontFamily: 'Times New Roman'}}>Times New Roman</button>
        <button onMouseDown={() => this.changeFont('Arial')} style = {{fontFamily: 'Arial'}}>Arial</button>
        <button onMouseDown={() => this.changeFont('Comic Sans')} style = {{fontFamily: 'Comic Sans'}}>Comic Sans</button>
        <button onMouseDown={() => this.changeFont('Impact')} style = {{fontFamily: 'Impact'}}>Impact</button>
        <button onMouseDown={(e) => this.bulletedList(e)}>Bulleted List</button>
        <button onMouseDown={(e) => this.numberedList(e)}>Numbered List</button>
        <button onMouseDown= {()=>this.save()}>Save</button>
        <button onMouseDown= {()=>this.props.goToPortal()}>Go to portal</button>
      <Editor
        customStyleMap={styleMap}
        editorState={this.state.editorState}
        onChange={this.onChange}
      />
    </div>
    )
  }
}

const styleMap = {
  'TWELVE': {
    fontSize: 12
  },
  'FOURTEEN': {
    fontSize: 14
  },
  'SIXTEEN': {
    fontSize: 16
  },
  'EIGHTEEN': {
    fontSize: 18
  },
  'TWENTY': {
    fontSize: 20
  },
  'red': {
    color: 'red'
  },
  'orange': {
    color: 'orange'
  },
  'yellow': {
    color: 'yellow'
  },
  'green': {
    color: 'green'
  },
  'blue': {
    color: 'blue'
  },
  'purple': {
    color: 'purple'
  },
  'Helvetica': {
    fontFamily: 'Helvetica'
  },
  'Arial': {
    fontFamily: 'Arial'
  },
  'Times New Roman': {
    fontFamily: 'Times New Roman'
  },
  'Comic Sans': {
    fontFamily: 'Comic Sans'
  },
  Impact: {
    fontFamily: 'Impact'
  }
}
