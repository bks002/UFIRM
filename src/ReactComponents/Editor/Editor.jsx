import React, { Component } from 'react';
const $ = window.$;
class Editor extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var that = this; // use var that to point this class
        // Summernote
        $(`#${this.props.Id}`).summernote({
            placeholder: 'Enter Notice',
         //   tabsize: 1,
            height: 120,
            fontSizes: ['8', '9', '10', '11', '12', '14', '18'],
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather'],
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize']],
                ['para', ['ul', 'ol', 'paragraph']],
                //  ['table', ['table']],
                // ['insert', ['link', 'picture', 'video']],
                // ['view', ['fullscreen', 'codeview', 'help']]
                ['view', ['fullscreen']]
            ],
            callbacks: {
                onChange: function (contents) {
                    that.props.onChange(contents)
                }
            }
        });
    }
    componentWillUnmount() {
        $(`#${this.props.Id}`).summernote('destroy');
    }

    onChange = () => {

    }
    render() {
        return (
            <textarea
                id={this.props.Id}
                value={this.props.value}
                onChange={this.onChange}
            ></textarea>
        )
    }
}


export default Editor;