import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";

const styles = {
  chatScroll: {
    maxHeight: "300px",
    overflowY: "auto",
    padding: "12px",
    background: "#f5f7fb",
    borderRadius: "8px",
    border: "1px solid #dbe6ef",
  },
  chatRow: {
    display: "flex",
    marginBottom: "8px",
  },
  chatLeft: {
    justifyContent: "flex-start",
  },
  chatRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "72%",
    padding: "9px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    boxShadow: "0 1px 2px rgba(16,24,40,.08)",
  },
  supBubble: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: "4px",
    border: "1px solid #dbe6ef",
  },
  fmBubble: {
    backgroundColor: "#dcf8c6",
    borderTopRightRadius: "4px",
    border: "1px solid #bde5a8",
  },
};

const ChatBox = ({ remarks = [], onSend, status, context, assetData }) => {
  let statusOptions = [];
  if (context === "task") statusOptions = ["Actionable", "Completed"];
  else if (context === "ticket")
    statusOptions = ["IN PROGRESS", "RESOLVED", "CLOSED", "REOPEN"];

  const [inputValue, setInputValue] = useState("");
  const [currentStatus, setCurrentStatus] = useState(
    status || statusOptions[0],
  );
  const [serviceDate, setServiceDate] = useState("");
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [serviceCost, setServiceCost] = useState("");
  const [serviceDoc, setServiceDoc] = useState(null);
  const [image, setImage] = useState(null);
  const [servicedBy, setServicedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  const chatEndRef = useRef(null);

  

  const handleSend = async () => {
    if (context === "asset") {
      // ✅ Validation
      if (!assetData.AssetId || !serviceDate || !nextServiceDate) {
        alert("Please fill Service Date, Next Service Date, and Asset ID.");
        return;
      }

      const formData = new FormData();
      formData.append("AssetId", assetData.AssetId);
      formData.append("ServiceDate", serviceDate);
      formData.append("NextServiceDate", nextServiceDate);
      formData.append("Remark", inputValue || "No remarks");
      formData.append("ServiceCost", serviceCost || "");
      formData.append("ServicedBy", servicedBy || "");
      formData.append("ApprovedBy", approvedBy || "");

      // ✅ Attach files if selected
      if (serviceDoc) formData.append("ServiceDoc", serviceDoc);
      if (image) formData.append("Image", image);

      try {
        const response = await fetch(
          "https://api.urest.in:8096/api/Asset/SaveServiceRecord",
          {
            method: "POST",
            body: formData, // FormData automatically sets multipart/form-data
          },
        );

        if (!response.ok) {
          const errText = await response.text();
          console.error("Failed to save service record:", errText);
          alert("Failed to save service record.");
          return;
        }

        alert("Service Record saved successfully!");
        setTimeout(() => {
          if (typeof assetData.apiCall === "function") assetData.apiCall();
          if (typeof assetData.onClose === "function") assetData.onClose();
        }, 500);

        // Reset fields
        setInputValue("");
        setServiceDate("");
        setNextServiceDate("");
        setServiceCost("");
        setServiceDoc(null);
        setImage(null);
        setServicedBy("");
        setApprovedBy("");
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong while saving.");
      }
    } else {
      const statusToSend = currentStatus || status;
      onSend(inputValue, statusToSend);
      setInputValue("");
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return "";

    const date = new Date(dt);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleMarkComplete = () => {
    setCurrentStatus("Completed");
    onSend(inputValue || "Marked as completed", "Completed");
    setInputValue("");
  };

  const toggleStatus = () => {
    if (statusOptions.length <= 1) return;
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    setCurrentStatus(statusOptions[nextIndex]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [remarks]);

  const stripHtml = (html) => html.replace(/<[^>]*>/g, "");

  const parseRemark = (html) => {
    if (!html) return { label: "", message: "", date: "" };

    // 1. Strip HTML
    const clean = stripHtml(html).trim();

    // 2. Extract date (YYYY-MM-DD HH:mm:ss)
    const dateMatch = clean.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    const rawDate = dateMatch ? dateMatch[0] : "";

    // 3. Remove date from text completely
    const textOnly = rawDate ? clean.replace(rawDate, "").trim() : clean;

    // 4. Split label and message
    const [label, ...msgParts] = textOnly.split(":");
    const message = msgParts.join(":").trim();

    // 5. Format date nicely
    let formattedDate = "";
    if (rawDate) {
      const d = new Date(rawDate.replace(" ", "T"));
      formattedDate = d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    return {
      label: label.trim(),
      message,
      date: formattedDate,
    };
  };

  return (
    <div className="container mt-2">
      <style>{`
        .chatbox-header {
          background: #edf5ff;
          border: 1px solid #d8e6f2;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .chatbox-status {
          font-size: 13px;
          color: #37546a;
          font-weight: 600;
        }
        .chatbox-input-row {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          align-items: center;
        }
        .chatbox-input-row input {
          border-radius: 8px !important;
          border: 1px solid #d5e3ee !important;
          height: 38px;
        }
      `}</style>
      {context !== "asset" && (
        <div className="chatbox-header">
          <span className="chatbox-status">
            Status: <strong>{currentStatus}</strong>
          </span>

          {context === "task"
            ? currentStatus === "Actionable" && (
                <Button variant="success" onClick={handleMarkComplete}>
                  Mark as Complete
                </Button>
              )
            : statusOptions.length > 1 && (
                <Button variant="secondary" onClick={toggleStatus}>
                  Change Status
                </Button>
              )}
        </div>
      )}

      <div
        className="mb-2"
        style={
          context === "asset"
            ? {}
            : {
                display: "flex",
                flexDirection: "column",
              }
        }
      >
        {context !== "asset" && (
          <div
            style={{
              ...styles.chatScroll,
              flex: 1,
            }}
          >
            {remarks.length === 0 ? (
              <p style={{ color: "#6c757d" }}>No remarks available</p>
            ) : (
              remarks.map((item, index) => {
                const isFM = item.RemarkHtml?.includes("FM:");

                return (
                  <div
                    key={index}
                    style={{
                      ...styles.chatRow,
                      ...(isFM ? styles.chatRight : styles.chatLeft),
                    }}
                  >
                    <div
                      style={{
                        ...styles.bubble,
                        ...(isFM ? styles.fmBubble : styles.supBubble),
                      }}
                    >
                      {(() => {
                        const { label, message, date } = parseRemark(
                          item.RemarkHtml,
                        );

                        // 👇 ONLY complaint uses RemarkDate
                        const finalDate =
                          context === "ticket"
                            ? formatDateTime(item.RemarkDate)
                            : date;

                        return (
                          <>
                            <div style={{ fontWeight: 600, color: "#000" }}>
                              {label}:{" "}
                              <span style={{ fontWeight: 400, color: "#000" }}>
                                {message}
                              </span>
                            </div>

                            {finalDate && (
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 400,
                                  color: "#000",
                                  marginTop: "4px",
                                }}
                              >
                                {finalDate}
                              </div>
                            )}

                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {context === "asset" ? (
          <div className="mt-3">
            <Form.Group className="mb-2">
              <Form.Label>FM Remark</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter FM remark..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Service Date</Form.Label>
              <Form.Control
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Next Service Date</Form.Label>
              <Form.Control
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Service Cost (₹)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter cost..."
                value={serviceCost}
                onChange={(e) => setServiceCost(e.target.value)}
              />
            </Form.Group>

            {/* File upload section */}
            <Form.Group className="mb-2">
              <Form.Label>Upload Service Document</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e) => setServiceDoc(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Serviced By</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter technician name..."
                value={servicedBy}
                onChange={(e) => setServicedBy(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Approved By</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter approver name..."
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleSend}>
              Save Service Record
            </Button>
          </div>
        ) : (
          <div className="chatbox-input-row">
            <Form.Control
              type="text"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="me-2"
            />
            <Button variant="primary" onClick={handleSend}>
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
