import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import io from 'socket.io-client';
import axios from 'axios';
import Portal from './portal'
import LoginAndRegister from './login'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import { createMuiTheme } from '@material-ui/core/styles';


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
    console.log('change to login')
    this.setState({mode:'login', user:''})
  }

  openDocument(id){
    this.setState({mode:'document', currentDoc:id})
  }

  render() {
    if(this.state.mode==='login'){
      return (
        <MuiThemeProvider>
          <div>
            <LoginAndRegister changeToPortal={(username)=>this.changeToPortal(username)}/>
          </div>
        </MuiThemeProvider>
      )
    } else {
        return(
          <MuiThemeProvider>
            <Portal openDocument={(id)=>this.openDocument(id)} user={this.state.user} changeToLogin={this.changeToLogin}/>
          </MuiThemeProvider>
        )
      }
    }
}
