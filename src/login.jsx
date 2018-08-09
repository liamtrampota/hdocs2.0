import React from 'react';
import axios from 'axios';


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

export default LoginAndRegister;
