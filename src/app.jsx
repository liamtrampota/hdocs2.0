import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import io from 'socket.io-client';
import axios from 'axios';
import Portal from './portal'
import LoginAndRegister from './login'

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode:'portal', //login, portal,
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
