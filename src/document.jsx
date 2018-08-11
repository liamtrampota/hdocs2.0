import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Toolbar from 'material-ui/Toolbar';
import Typography from '@material-ui/core/Typography';
import AppBar from 'material-ui/AppBar';
import createStyles from 'draft-js-custom-styles'
import {FormatBold, FormatAlignCenter, FormatAlignRight, FormatAlignLeft, FormatItalic, FormatUnderlined, FormatColorText, FormatSize, TextFormat, FormatListBulleted, FormatListNumbered, MenuIcon, AccountCircle, Home, Save } from 'material-ui-icons';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';

const customStyleMap = {

}

/* Have draft-js-custom-styles build help functions for toggling font-size, color */
const {
  styles,
  customStyleFn,
} = createStyles(['font-size', 'color'], customStyleMap)

function isBlockStyle(style) {
  if(style.indexOf('text-align-') === 0) return true
  return false
}

function getBlockStyle(block) {
  const type = block.getType()
  return isBlockStyle(type) ? type : null
}

class Document extends React.Component {
  constructor(props) {
    super(props);
    var editorState;
    this.state = {
      editorState: EditorState.createEmpty(),
       anchorEl: null,
       sizeSwitch:null,
       formatSwitch:null,
       personalSwitch:null
    };
    this.onChange = (editorState) => {
      console.log('on Change')
      this.setState({editorState}, ()=>{
        var selection = editorState.getSelection()
        console.log('selection start:', selection.getStartKey(), selection.getStartOffset())
        console.log('selection end:', selection.getEndOffset())
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
    this.props.socket.emit('saveDoc', convertToRaw(contentState), ()=>{
      this.props.getDocs()
    })
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
  handleClick (event)  {
    if(!this.state.anchorEl){
      console.log(event.currentTarget)

      this.setState({
        anchorEl: event.currentTarget,
      });
    }else{
      this.setState({
        anchorEl: null,
      });
    }
  };
  handleFormat(event){
    if(!this.state.formatSwitch){
      console.log(event.currentTarget)

      this.setState({
        formatSwitch: event.currentTarget,
      });
    }else{
      this.setState({
        formatSwitch: null,
      });
    }
  }
  handleSize (event){
    if(!this.state.sizeSwitch){
      console.log(event.currentTarget)
      this.setState({
        sizeSwitch: event.currentTarget,
      });
    }else{
      this.setState({
        sizeSwitch: null,
      });
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
    this.setState({ anchorEl: null, });
  }
  changeSize(size){
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, size));
    this.setState({ sizeSwitch: null, });
  }
  bulletedList(e){
    e.preventDefault()
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item'));
  }

  numberedList(e){
    e.preventDefault()
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'ordered-list-item'));
  }
  handleClose() {
   this.setState({ anchorEl: null });
 }
  changeFont(value){
    console.log("FONT", value);
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, value));
    this.setState({ formatSwitch: null, });
  }
  handleMenu (event){
   this.setState({ personalSwitch: event.currentTarget });
 };
 handleClose () {
    this.setState({ personalSwitch: null });
  };
  alignText(e,type){
    e.preventDefault();
    console.log('type:',type)
    if(type==='Left'){
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'text-align-left'))
    }
    if(type==='Right'){
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'text-align-right'))
    }
    if(type==='Center'){
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'text-align-center'))
    }
  }





  render(){
    return(
      <div>
        <AppBar showMenuIconButton={false} position="static" style={{alignItems:'center'}} className="document">
            <IconButton className='menu-button' onMouseDown= {()=>this.props.goToPortal()}>
              <Home />
            </IconButton>
            <Typography style={{flexGrow:1, marginLeft:"40px", fontFamily: 'Arial', fontSize:'28px'}}>
              {this.props.doc.title}
            </Typography>
              <IconButton
                aria-label='menu-bar'
                onClick={(e)=>this.handleMenu(e)}
              >
                <AccountCircle />
              </IconButton>
              <Popover
                open={Boolean(this.state.personalSwitch)}
                anchorEl={this.state.personalSwitch}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
              <Menu>
                <MenuItem onClick={()=>this.handleClose()}>Profile</MenuItem>
                <MenuItem onClick={()=>this.handleClose()}>My account</MenuItem>
                <MenuItem onClick={()=>this.handleClose()}>Logout</MenuItem>
              </Menu>
            </Popover>
        </AppBar>



        <IconButton aria-label="Bold" className='bold button' onMouseDown={(e) => this.handleType(e,'bold')}>
         <FormatBold />
        </IconButton>

        <IconButton aria-label="Italic" onMouseDown={(e) => this.handleType(e,'italic')}>
         <FormatItalic />
        </IconButton>

        <IconButton aria-label="Underline"  onMouseDown={(e) => this.handleType(e,'underline')}>
         <FormatUnderlined />
        </IconButton>

        <IconButton aria-label="color-menu" onMouseDown={(e)=>this.handleClick(e)}>
        <FormatColorText />
        </IconButton>

        <Popover
          open={Boolean(this.state.anchorEl)}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
        <Menu >
          <MenuItem  onMouseDown= {() => this.changeColor('red')} style = {{backgroundColor: 'red'}}>Red</MenuItem>
          <MenuItem  onMouseDown={() => this.changeColor('orange')} style = {{backgroundColor: 'orange'}}>Orange</MenuItem>
          <MenuItem  onMouseDown={() => this.changeColor('yellow')} style = {{backgroundColor: 'yellow'}}>Yellow</MenuItem>
        </Menu>
        </Popover>

        <IconButton aria-label="size-menu" onMouseDown={(e)=>this.handleSize(e)}>
        <FormatSize />
        </IconButton>
        <Popover
          open={Boolean(this.state.sizeSwitch)}
          anchorEl={this.state.sizeSwitch}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
        <Menu>
          <MenuItem onMouseDown={() => this.changeSize('TWELVE')}>12</MenuItem>
          <MenuItem onMouseDown={() => this.changeSize('FOURTEEN')}>14</MenuItem>
          <MenuItem  onMouseDown={() => this.changeSize('SIXTEEN')}>16</MenuItem>
          <MenuItem onMouseDown={() => this.changeSize('EIGHTEEN')}>18</MenuItem>
          <MenuItem onMouseDown={() => this.changeSize('TWENTY')}>20</MenuItem>
        </Menu>
        </Popover>

        <IconButton aria-label="size-menu" onMouseDown={(e)=>this.handleFormat(e)}>
        <TextFormat />
        </IconButton>
        <Popover
          open={Boolean(this.state.formatSwitch)}
          anchorEl={this.state.formatSwitch}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
        <Menu>
          <MenuItem onMouseDown={() => this.changeFont('Helvetica')} style = {{fontFamily: 'Helvetica'}}>Helvetica</MenuItem>
          <MenuItem onMouseDown={() => this.changeFont('Times New Roman')} style = {{fontFamily: 'Times New Roman'}}>Times New Roman</MenuItem>
          <MenuItem  onMouseDown={() => this.changeFont('Arial')} style = {{fontFamily: 'Arial'}}>Arial</MenuItem>
          <MenuItem onMouseDown={() => this.changeFont('Comic Sans')} style = {{fontFamily: 'Comic Sans'}}>Comic Sans</MenuItem>
        </Menu>
        </Popover>
        <IconButton aria-label="bullet" className='bullet button' onMouseDown={(e) => this.bulletedList(e)}>
         <FormatListBulleted />
        </IconButton>
        <IconButton aria-label="number" onMouseDown={(e) => this.numberedList(e)}>
         <FormatListNumbered />
        </IconButton>
        <IconButton aria-label="left" onMouseDown={(e) => this.alignText(e,'Left')}>
         <FormatAlignLeft />
        </IconButton>
        <IconButton aria-label="Center" onMouseDown={(e) => this.alignText(e,'Center')}>
         <FormatAlignCenter />
        </IconButton>
        <IconButton aria-label="right" onMouseDown={(e) => this.alignText(e,'Right')}>
         <FormatAlignRight/>
        </IconButton>
        <IconButton aria-label="save" onMouseDown={()=>this.save()}>
          <Save />
        </IconButton>
      <div style={{width:"80%",
        height:"350px",
        marginLeft:"10px",
        border:" 1px solid grey",
        backgroundColor:"lightred"}}>
        <Editor
          customStyleMap={styleMap}
          editorState={this.state.editorState}
          onChange={this.onChange}
          customStyleFn={customStyleFn}
          blockStyleFn={getBlockStyle}
        />
      </div>
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
  },
}

export default Document;
