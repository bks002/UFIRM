import React from 'react';

class TextAreaBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inputValue: ''
        }
    }
    componentDidMount() {
        //let d = this.props;
        if (this.props.Value != '' & this.props.Value != null & this.props.Value != undefined) {
            this.setState({ inputValue: this.props.Value });
        }
    }
    handleChangeForAll(evt) {
        this.props.onChange(evt.target.value);
        this.setState({ inputValue: evt.target.value })
    }

    componentWillReceiveProps(props) {
        if (props.Value != '' & props.Value != null & props.Value != undefined) {
            this.setState({ inputValue: props.Value });
        }
        else {
            if (props.HandleClear == 'True')
                this.setState({ inputValue: '' });
        }
    }

    componentDidUpdate() {
        // 
        // let d = this.props;
    }

    render() {
        return (
            <textarea name={this.props.Name} onChange={this.handleChangeForAll.bind(this)}
                id={this.props.Id}
                value={this.state.inputValue} className={this.props.ClassName} placeholder={this.props.PlaceHolder}>
            </textarea>
        );
    }
}

TextAreaBox.defaultProps = {
    Name: "",
    ClassName: "pr-textarea",
    Id: "",
    PlaceHolder: "",
    Content: "",
    Value: "",
}



export default TextAreaBox;

