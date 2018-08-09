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
  }

  changeToPortal(user){
    this.setState({mode:'portal', user:user})
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
    } else if (this.state.mode==='document'){
      return (
        <Document/>
      )} else {
        return(
          <Portal openDocument={(id)=>this.openDocument(id)} user={this.state.user}/>
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
      fetch('http://localhost:8080/login', {
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
      fetch('http://localhost:8080/register', {
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
    this.socket = io('http://localhost:8080');
    this.state={
      newDocTitle:'',
      mode: 'Portal' //portal, document
    }
  }

  componentDidMount() {
    this.socket.on('connect', function(){console.log('ws connect')});
    this.socket.on('disconnect', function(){
      console.log('ws disconnect')});
    this.socket.on('msg', (data) => {
      console.log('ws msg:', data);
      this.socket.emit('cmd', {foo:123})
    });
    this.socket.on('editorStateChanged', (data)=>{
      var contentState = convertFromRaw(data)
      console.log('hello from sever:', contentState)
      this.setState({editorState:EditorState.createWithContent(contentState)})
    })
    this.socket.emit('getDocs', this.props.user._id)
  }

  handleChange(e){
    this.setState({newDocTitle:e.target.value})
  }

  handleClick(){
    console.log('handling create doc click...')
    fetch('http://localhost:8080/createDocument', {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: this.state.newDocTitle,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson){
          console.log(responseJson)
          //this.props.openDocument(responseJson)
        }
      })
      .catch((error) => {
        console.log(error);
      })
  }

  render(){
    return (
      <div>
        <h1 style={{borderBottom:'2px solid grey', backgroundColor:'lightblue',  margin:'0px', padding:'20px'}}>Username's Portal</h1>
        <div>
        <div style={{marginTop:'5px', marginLeft:'5px'}}>
          <input placeholder='new document title' value={this.state.newDocTitle} onChange={(e)=>this.handleChange(e)}/>
          <button onClick={()=>this.handleClick()}>Create Document</button>
        </div>
        </div>
      </div>
    )
  }
}


class Document extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
    };
    this.onChange = (editorState) => {
      console.log('on Change')
      this.setState({editorState}, ()=>{
        const contentState = editorState.getCurrentContent()
        console.log('sending to server:', convertToRaw(contentState))
        this.socket.emit('editorStateChange', convertToRaw(contentState))
      })
    };
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


  render(){
    return(
      <div>
      <button onMouseDown={(e) => this.handleType(e,'bold')}>BOLD</button>
      <button onMouseDown={(e) => this.handleType(e,'italic')}>ITALIC</button>
      <button onMouseDown={(e) => this.handleType(e,'underline')}>UNDERLINE</button>
      <Editor
        editorState={this.state.editorState}
        onChange={this.onChange}
      />
    </div>
    )
  }
}
