import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const $ = window.$;

export const ShowPdfModal = (props) => {

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function Next() {
        if (pageNumber < numPages) {
            let page = pageNumber + 1;
            setPageNumber(page);
        }
    }

    function Previous() {
        if (pageNumber != 1) {
            let page = pageNumber - 1;
            setPageNumber(page);
        }
    }

    function onClose() {
        $(`#${props.Id}`).modal('hide')
    }

    return (
        <div className="row">
            <div className="modal fade" id={props.Id} data-keyboard="false" data-backdrop="static">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content" style={{ top: "20px" }}>
                        <div className="modal-header">
                            <h4 className="modal-title">{props.titile}</h4>
                            <button type="button"
                                className="close"
                                // data-dismiss="modal"
                                aria-label="Close"
                                onClick={onClose}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {
                                props.showImagefile !== undefined ?
                                    props.showImagefile !== "" && props.showImagefiletype !== null ?
                                        <div className="row">
                                            <div className="col-md-4">
                                                <button onClick={Previous} className="btn btn-default">Previous</button>
                                                <button onClick={Next} className="btn btn-default">Next</button>
                                            </div>
                                            <div className="col-md-4">
                                                <p>Page {pageNumber} of {numPages}</p>
                                            </div>

                                            <div className="col-md-12">
                                                <div style={{ border: "1px solid black", width: "100%", height: "600px", overflow: "scroll" }}>
                                                    <Document
                                                        file={`${props.showImagefiletype},${props.showImagefile}`}
                                                        // file="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf"
                                                        onLoadSuccess={onDocumentLoadSuccess}
                                                        onLoadError={console.error}
                                                        loading="Loading..."
                                                    >
                                                        <Page pageNumber={pageNumber} />
                                                        {/* {Array.apply(null, Array(numPages))
                                                        .map((x, i) => i + 1)
                                                        .map(page => <Page pageNumber={page} />)} */}
                                                    </Document>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div className="row">
                                            <div className="col-md-4">
                                                <button onClick={Previous} className="btn btn-default">Previous</button>
                                                <button onClick={Next} className="btn btn-default">Next</button>
                                            </div>
                                            <div className="col-md-4">
                                                <p>Page {pageNumber} of {numPages}</p>
                                            </div>

                                            <div className="col-md-12">
                                                <div style={{ border: "1px solid black", width: "100%", height: "600px", overflow: "scroll" }}>
                                                    <Document
                                                        file={`${props.showImagefile}`}
                                                        // file="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf"
                                                        onLoadSuccess={onDocumentLoadSuccess}
                                                        onLoadError={console.error}
                                                        loading="Loading..."
                                                    >
                                                        <Page pageNumber={pageNumber} />
                                                        {/* {Array.apply(null, Array(numPages))
                                                    .map((x, i) => i + 1)
                                                    .map(page => <Page pageNumber={page} />)} */}
                                                    </Document>
                                                </div>
                                            </div>
                                        </div>
                                    : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}