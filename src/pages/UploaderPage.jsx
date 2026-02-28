import React, { useState } from 'react';
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

        if (file && validTypes.includes(file.type)) {
            setFiles((prev) => ({
                ...prev,
                [type]: { file, name: file.name, error: '' }
            }));
        } else {
            setFiles((prev) => ({
                ...prev,
                [type]: { file: null, name: '', error: `Please upload a valid CSV or Excel file for ${type}.` }
            }));
        }
    };

    const handleUpload = async (type) => {
        const fileData = files[type];

        if (!fileData.file) {
            setUploadStatus((prev) => ({
                ...prev,
                [type]: 'Please select a file to upload.'
            }));
            return;
        }

        const formData = new FormData();
        formData.append("file", fileData.file); // MUST MATCH .NET HttpPostedFile **key name**

        const endpoint =
            type === "asset"
                ? "https://api.urest.in:8096/Uploadasset"
                : "https://api.urest.in:8096/Uploadtask";

        try {
            setUploadStatus((prev) => ({
                ...prev,
                [type]: "Uploading..."
            }));

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server error ${response.status}: ${text}`);
            }

            const json = await response.json();

            setUploadStatus((prev) => ({
                ...prev,
                [type]: "Upload successful: " + (json?.message || json)
            }));
        } catch (error) {
            setUploadStatus((prev) => ({
                ...prev,
                [type]: "Upload failed: " + error.message
            }));
        }
    };

    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="card-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    
                    {/* Asset Upload Card */}
                    <div className="card asset-upload p-3" style={{ backgroundColor: '#e3f2fd', flex: 1, margin: '10px' }}>
                        <h2>Asset Upload</h2>

                        <div className="d-flex flex-row justify-content-between">
                            <DocumentUploader
                                Class="file-input"
                                Id="asset-file-upload"
                                type="file"
                                onChange={handleFileChange("asset")}
                            />

                            <a href="/docs/sample_asset_list.xlsx" download>
                                <button style={{ marginTop: '10px' }}>Download Sample Asset List</button>
                            </a>
                        </div>

                        {files.asset.error && <p style={{ color: 'red' }}>{files.asset.error}</p>}
                        <p>Selected File: {files.asset.name}</p>

                        <button onClick={() => handleUpload("asset")}>Upload Asset List</button>
                        {uploadStatus.asset && <p>{uploadStatus.asset}</p>}
                    </div>

                    {/* Task Upload Card */}
                    <div className="card task-upload p-3" style={{ backgroundColor: '#b2f6ff', flex: 1, margin: '10px' }}>
                        <h2>Task Upload</h2>

                        <div className="d-flex flex-row justify-content-between">
                            <DocumentUploader
                                Class="file-input"
                                Id="task-file-upload"
                                type="file"
                                onChange={handleFileChange("task")}
                            />

                            <a href="/docs/sample_task_list.xlsx" download>
                                <button style={{ marginTop: '10px' }}>Download Sample Task List</button>
                            </a>
                        </div>

                        {files.task.error && <p style={{ color: 'red' }}>{files.task.error}</p>}
                        <p>Selected File: {files.task.name}</p>

                        <button onClick={() => handleUpload("task")}>Upload Task List</button>
                        {uploadStatus.task && <p>{uploadStatus.task}</p>}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UploaderPage;
