import React from 'react'
class DropDownloadList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }
    render() {
        return (
            <select className="form-control select2 select2-hidden-accessible"
             style={{width: '100%'}} data-select2-id="1" tabindex="-1" aria-hidden="true">
{this.option.Data.max}
                    <option selected="selected" data-select2-id="3">Alabama</option>
                    <option data-select2-id="40">Alaska</option>
                    <option data-select2-id="41">California</option>
                    <option data-select2-id="42">Delaware</option>
                    <option data-select2-id="43">Tennessee</option>
                    <option data-select2-id="44">Texas</option>
                    <option data-select2-id="45">Washington</option>
                 </select>
        );
    }
}
DropDownloadList.defaultProps = {
    Placeholder: "Drop files to attach, or Browse.",
    Data : [{}]

}
export default DropDownloadList;