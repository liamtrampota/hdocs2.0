import React from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';


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

export default Document;
