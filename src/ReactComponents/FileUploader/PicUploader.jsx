import React from 'react';
import FileUploaderjs from "./Fileuploader.js";
const $ = window.$;

class PicUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentWillMount(){
       
    }
    componentDidMount() {
        
        let uploader = new FileUploaderjs();
        uploader.Initializeuploader();
        $("#pic-dropzone").dropzone({ url: this.props.Action });
    }

    render() {
        return (
            <div className="pr-fullwidth">
                <div className="pr-paneltable-body">
                    <div id="pr-filedrag">
                        <form action={this.props.Action} id="pic-dropzone"
                            className="dropzone"
                            method="post">
                            <div className="dz-default dz-message">
                                <span>
                                    {this.props.Placeholder}
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

PicUploader.defaultProps = {
    Placeholder: "Drop files to attach, or Browse.",

    Action : ""

}
export default PicUploader;