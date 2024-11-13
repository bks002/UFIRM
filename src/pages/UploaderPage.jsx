import React, { useState } from 'react';
import axios from 'axios';
import DocumentUploader from "../ReactComponents/FileUploader/DocumentUploader";

const UploaderPage = () => {
    const [files, setFiles] = useState({
        asset: { file: null, name: '', error: '' },
        task: { file: null, name: '', error: '' }
    });
    const [uploadStatus, setUploadStatus] = useState({ asset: '', task: '' });

    const handleFileChange = (type) => (event) => {
        const file = event.target.files[0];
        const validTypes = [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const isValidType = file ? validTypes.includes(file.type) : false;

        if (isValidType) {
            setFiles((prevState) => ({
                ...prevState,
                [type]: { file, name: file.name, error: '' }
            }));
        } else {
            setFiles((prevState) => ({
                ...prevState,
                [type]: { file: null, name: '', error: `Please upload a valid CSV or Excel file for ${type}.` }
            }));
        }
    };

    const handleUpload = async (type) => {
        const fileData = files[type];
        if (!fileData.file) {
            setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [type]: 'Please select a file to upload.'
            }));
            return;
        }

        const formData = new FormData();
        formData.append('file', fileData.file);

        try {
            setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [type]: 'Uploading...'
            }));

            const response = await fetch(`http://localhost:62929/CsvUploder`, {
                method: 'POST',
                body: formData,

            });

            // Check if the response is OK (status code in the range 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json(); // Parse the JSON response
            setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [type]: 'Upload successful: ' + responseData,
            }));
        } catch (error) {
            setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [type]: 'Upload failed: ' + error.message,
            }));
        }
    };

    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="card-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {/* Asset Upload Card */}
                    <div className="card asset-upload p-3" style={{ backgroundColor: '#e3f2fd', flex: '1', margin: '10px' }}>
                        <h2>Asset Upload</h2>
                        <div className="d-flex flex-row justify-content-between">
                            <div>
                                <DocumentUploader
                                    Class="file-input"
                                    Id="asset-file-upload"
                                    type="file"
                                    onChange={handleFileChange('asset')}
                                />
                            </div>
                            <div>
                                {/* Download Sample Button */}
                                <a href="/docs/sample_asset_list.xlsx" download>
                                    <button style={{ marginTop: '10px' }}>Download Sample Asset List</button>
                                </a>
                            </div></div>

                        {files.asset.error && <p style={{ color: 'red' }}>{files.asset.error}</p>}
                        <p>Selected File: {files.asset.name}</p>
                        <button onClick={() => handleUpload('asset')}>Upload Asset List</button>
                        {uploadStatus.asset && <p>{uploadStatus.asset}</p>}

                    </div>

                    {/* Task Upload Card */}
                    <div className="card task-upload p-3"
                         style={{backgroundColor: '#b2f6ff', flex: '1', margin: '10px'}}>
                        <h2>Task Upload</h2>
                        <div className="d-flex flex-row justify-content-between">

                            <div>
                                <DocumentUploader
                                    Class="file-input"
                                    Id="task-file-upload"
                                    type="file"
                                    onChange={handleFileChange('task')}
                                />
                            </div>
                            <div>
                                {/* Download Sample Button */}
                                <a href="/docs/sample_task_list.xlsx" download>

                                    <button style={{marginTop: '10px'}}>Download Sample Task</button>
                                </a>
                            </div>
                        </div>

                        {files.task.error && <p style={{color: 'red'}}>{files.task.error}</p>}
                        <p>Selected File: {files.task.name}</p>
                        <button onClick={() => handleUpload('task')}>Upload Task List</button>
                        {uploadStatus.task && <p>{uploadStatus.task}</p>}

                    </div>
                </div>
            </section>
        </div>
    );
};

export default UploaderPage;