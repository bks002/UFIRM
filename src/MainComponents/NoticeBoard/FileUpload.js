import React, { Component } from 'react';
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(','));
    // reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

class FileUpload extends Component {
    constructor(props) {
        super(props);

    }

    async onFileChange(event) {
        if (event.target.files[0] !== undefined && event.target.files[0] !== null) {

            let UpFile = event.target.files[0];
            var imgbytes = UpFile.size; // Size returned in bytes.        
            var imgkbytes = Math.round(parseInt(imgbytes) / 1024); // Size returned in KB.    
            let fileD = await toBase64(UpFile);
            let extension = UpFile.name.substring(UpFile.name.lastIndexOf('.') + 1);
            let res = {
                filename: UpFile.name,
                filepath: fileD[1],
                sizeinKb: imgkbytes,
                fileType: fileD[0],
                extension: extension.toLowerCase()
            }
            this.props.onChange(res);
        }
    };
    render() {
        return (
            <div className="custom-file">
                <input
                    type="file"
                    className={this.props.className}
                    id={this.props.id}
                    onChange={this.onFileChange.bind(this)}
                />
                <label className="custom-file-label" htmlFor={this.props.id}>Choose file</label>
            </div>
        );
    }
}

export default FileUpload;