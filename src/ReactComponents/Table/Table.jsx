import React from 'react';
import { debug } from 'util';

class Table extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        if (this.props.TableData.length > 0) {

            return (

                <div class="ic-table-cover">
                    <table id={this.props.Id} class="table">
                        <thead>
                            <tr>
                                {this.props.HeaderData.map((h, i) => (
                                    <TableHeader key={i} header={h.headerName} />
                                ))}

                            </tr>
                        </thead>
                        <tbody>
                            {this.props.TableData.map((row, i) => (
                                <TableRow key={i} Row={row} Header={this.props.HeaderData} />
                            ))}
                        </tbody>
                    </table>
                </div>

            );
        }
        else {
            return (null);
        }
    }
}
Table.defaultProps = {

}

class TableHeader extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <th>{this.props.header}</th>;
    }
}
class TableRow extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {

        return (
            <tr>
                {this.props.Header.map((tdvalue, idx) => (
                    <TableRowData key={idx} Value={this.props.Row} Column={tdvalue} />
                ))}
            </tr>
        );
    }
}

class TableRowData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        return (
            <td>{this.props.Value[this.props.Column.headerName]}</td>
        );
    }
}
export default Table;