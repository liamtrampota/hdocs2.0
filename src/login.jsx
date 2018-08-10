import React from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';


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
      <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
        <Typography variant="display2">ML Docs</Typography>
        <div style={{display:'flex',  flexDirection:'column', justifyContent:'center', alignItems:'center', marginTop:'10px'}}>
          <TextField hintText="Username" onChange={e => this.handleChange(e, 'username')} /><br />
          <TextField hintText="Password" onChange={e => this.handleChange(e, 'password')} /><br />
          {(this.state.loginMode===false) ?
          <TextField hintText="Repeat Password" onChange={e => this.handleChange(e, 'prepeat')} /> :
          <div></div>}
          {this.state.loginMode ?
            <div style={{display:'flex', flexDirection:'column',  justifyContent:'center'}}>
              <RaisedButton label='Login' onMouseDown={e => this.handleClick(e, 'login')} primary={true}  style={{width:'80px', alignSelf:'center'}}/> <br />
              <a onMouseDown={(e)=>this.change(e)} style={{textDecoration:'underline', cursor:'pointer'}}>
              <Typography variant='caption' gutterBottom>Don't have an account? Register.</Typography> </a></div>:
            <div style={{display:'flex', flexDirection:'column',  justifyContent:'center', marginTop:'10px'}}>
              <RaisedButton label='Register' onMouseDown={e => this.handleClick(e, 'register')} primary={true} style={{alignSelf:'center'}}/> <br />
              <a onMouseDown={(e)=>this.change(e)} style={{textDecoration:'underline', cursor:'pointer', alignSelf:'center'}}>
              <Typography variant='caption' gutterBottom>Switch to login.</Typography> </a></div>}
        </div>
      </div>
    )
  }
}


export default LoginAndRegister;
