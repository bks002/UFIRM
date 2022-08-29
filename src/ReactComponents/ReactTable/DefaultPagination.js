import React, { Component } from 'react'
import Pagination from 'react-responsive-pagination';

class DefaultPagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activePage: 1
        };
    }

    handlePageChange(pageNumber) {
        // console.log(`active page is ${pageNumber}`);
        this.setState({ activePage: pageNumber }, () => this.props.onPageChange(pageNumber));
    }
    render() {
        return (
            <div className="row justify-content-between">
                <div className="col-4">
                    <p>Total Record {this.props.totalRecord}</p>
                </div>
                <div className="col-4 text-right">
                    <Pagination
                        current={this.state.activePage}
                        total={this.props.totalPage}
                        // total={this.props.totalRecord / this.props.itemPerpage}
                        onPageChange={this.handlePageChange.bind(this)}
                    />
                </div>
            </div>
        )
    }
}

DefaultPagination.defaultProps = {
    totalpage: 100,
    itemPerpage: 10
}

export default DefaultPagination;
