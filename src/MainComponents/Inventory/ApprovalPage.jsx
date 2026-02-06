import React, { useState, useEffect } from 'react';

// Icons
const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#A83232" strokeWidth="2" width="16" height="16">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

const ViewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const ApproveIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const RejectIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const EmptyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6M9 15h6"/>
    </svg>
);

const CheckboxIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
);

/**
 * Reusable Approval Modal Component
 * 
 * Props:
 * - show: boolean - whether modal is visible
 * - onClose: function - close handler
 * - gridData: array - pending approval items
 * - columns: array - { key, label } for table columns
 * - entityName: string - "Vendor", "Category", "Item" etc.
 * - onEdit: function(id) - edit handler
 * - onDelete: function(id) - delete handler  
 * - onApprove: function(id) - single approve handler
 * - onView: function(id) - view handler
 * - onBulkApprove: function(ids) | null - bulk approve handler (null = in progress)
 * - onBulkReject: function(ids) | null - bulk reject handler (null = in progress)
 * - bulkApproveInProgress: boolean - show "(In Progress)" on bulk approve
 * - bulkRejectInProgress: boolean - show "(In Progress)" on bulk reject
 */
const ApprovalModal = ({
    show = false,
    onClose,
    gridData = [],
    columns = [],
    entityName = 'Item',
    onEdit,
    onDelete,
    onApprove,
    onView,
    onBulkApprove,
    onBulkReject,
    bulkApproveInProgress = false,
    bulkRejectInProgress = false,
}) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Auto-close when gridData becomes empty (after approving all)
    useEffect(() => {
        if (show && gridData.length === 0) {
            onClose();
        }
    }, [gridData.length, show, onClose]);

    // Reset selection when gridData changes
    useEffect(() => {
        setSelectedIds(prev => prev.filter(id => gridData.some(item => item.Id === id)));
    }, [gridData]);

    if (!show) return null;

    const isAllSelected = gridData.length > 0 && selectedIds.length === gridData.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < gridData.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(gridData.map(item => item.Id));
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleBulkApprove = async () => {
        if (onBulkApprove && selectedIds.length > 0) {
            setBulkLoading(true);
            try {
                await onBulkApprove(selectedIds);
                setSelectedIds([]);
            } finally {
                setBulkLoading(false);
            }
        }
    };

    const handleBulkReject = async () => {
        if (onBulkReject && selectedIds.length > 0) {
            setBulkLoading(true);
            try {
                await onBulkReject(selectedIds);
                setSelectedIds([]);
            } finally {
                setBulkLoading(false);
            }
        }
    };

    return (
        <div className="approval-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="approval-modal">
                <div className="approval-modal-header">
                    <div className="approval-modal-header-left">
                        <span className="approval-modal-title">Pending For Approval</span>
                        <span className="approval-modal-count">{gridData.length}</span>
                    </div>
                    <div className="approval-modal-header-right">
                        {selectedIds.length > 0 && (
                            <span className="approval-selected-text">
                                {selectedIds.length} selected
                            </span>
                        )}
                        <button
                            className="approval-bulk-btn approve"
                            onClick={handleBulkApprove}
                            disabled={selectedIds.length === 0 || bulkLoading}
                            title="Approve Selected"
                        >
                            <ApproveIcon />
                            Bulk Approve{bulkApproveInProgress ? ' (In Progress)' : ''}
                        </button>
                        <button
                            className="approval-bulk-btn reject"
                            onClick={handleBulkReject}
                            disabled={selectedIds.length === 0 || bulkLoading}
                            title="Reject Selected"
                        >
                            <RejectIcon />
                            Bulk Reject{bulkRejectInProgress ? ' (In Progress)' : ''}
                        </button>
                        <button
                            className="approval-modal-close"
                            onClick={onClose}
                            title="Close"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>
                <div className="approval-modal-body">
                    <table>
                        <thead>
                            <tr>
                                <th className="approval-checkbox-col">
                                    <label className="approval-checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={input => {
                                                if (input) input.indeterminate = isSomeSelected;
                                            }}
                                            onChange={handleSelectAll}
                                        />
                                    </label>
                                </th>
                                {columns.map((col, idx) => (
                                    <th key={idx}>{col.label}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gridData.map((item) => (
                                <tr key={item.Id} className={selectedIds.includes(item.Id) ? 'selected' : ''}>
                                    <td className="approval-checkbox-col">
                                        <label className="approval-checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.Id)}
                                                onChange={() => handleSelect(item.Id)}
                                            />
                                        </label>
                                    </td>
                                    {columns.map((col, idx) => (
                                        <td key={idx}>{item[col.key] ?? '-'}</td>
                                    ))}
                                    <td>
                                        <div className="approval-pending-actions">
                                            {onEdit && (
                                                <button
                                                    className="approval-action-btn edit"
                                                    onClick={() => { onClose(); onEdit(item.Id); }}
                                                    title="Edit"
                                                >
                                                    <EditIcon />
                                                </button>
                                            )}
                                            {onView && (
                                                <button
                                                    className="approval-action-btn view"
                                                    onClick={() => { onClose(); onView(item.Id); }}
                                                    title="View"
                                                >
                                                    <ViewIcon />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    className="approval-action-btn delete"
                                                    onClick={() => onDelete(item.Id)}
                                                    title="Delete"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            )}
                                            {onApprove && (
                                                <button
                                                    className="approval-action-btn approve"
                                                    onClick={() => onApprove(item.Id)}
                                                    title="Approve"
                                                >
                                                    <ApproveIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/**
 * Approval Trigger Button Component
 * Shows the "Pending Approval" button with count badge
 */
export const ApprovalTriggerButton = ({ count = 0, onClick }) => (
    <button className="approval-trigger-btn" onClick={onClick}>
        <CheckboxIcon />
        Pending Approval
        <span className="approval-trigger-count">{count}</span>
    </button>
);

export default ApprovalModal;
