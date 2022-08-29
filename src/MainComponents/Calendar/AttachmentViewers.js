import React, { useState, useEffect } from 'react';

import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import './AttachmentViewers.css'

import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


function AttachmentViewers(props) {
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

    return (
        <Modal
            open={props.showAttachmentViewerModal}
            onClose={props.closeModal}
            center
            classNames={{
                overlay: 'customOverlay',
                modal: 'customModal',

            }}>
            {
                props.isImageORPdf === "img" ?
                    <div className='row'>
                        <div className='col-md-12'>
                            <img
                                alt={props.fileName} style={{ height: "500px", width: "714px" }}
                                src={`${props.fileData}`}
                            />
                        </div>
                    </div>
                    :
                    <div className='row'>
                        <div className="col-md-4">
                            <button onClick={Previous} className="btn btn-default">Previous</button>
                            <button onClick={Next} className="btn btn-default">Next</button>
                        </div>
                        <div className="col-md-4">
                            <p>Page {pageNumber} of {numPages}</p>
                        </div>
                        <div className='col-md-12'>
                            <div style={{ border: "1px solid black", width: "100%", height: "600px", overflow: "scroll" }}>
                                <Document
                                    file={`${props.fileData}`}
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


            }
        </Modal>

    );
}

export default AttachmentViewers;
