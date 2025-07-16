import React, { useState, useEffect } from "react";
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext'; 
import { getAttendance } from '../../Services/AttendanceService';
import { useSelector } from 'react-redux';

export default function AttendanceMaster() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [globalFilter, setGlobalFilter] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedDayAttendance, setSelectedDayAttendance] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
   

    const getAttendanceForDate = (date) => {
        const dateStr = date.toISOString().slice(0, 10);
        return attendanceData.filter(record => {
            const recordDate = new Date(record.PunchDate);
            return recordDate.toISOString().slice(0, 10) === dateStr;
        });
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        for (let i = 1; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (propertyId) {
                const data = await getAttendance(propertyId);
                setAttendanceData(data);
            }
        };
        fetchData();
    }, [ propertyId]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const calendarDays = generateCalendarDays();

    // Month dropdown change handler
    const handleMonthChange = (e) => {
        const newMonth = parseInt(e.target.value, 10);
        setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
    };

    const handleDayClick = (dayNumber, dayIndex) => {
        if (!dayNumber || dayIndex === 6) return;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
        const attendance = getAttendanceForDate(date);
        setSelectedDayAttendance(attendance);
        setSelectedDay(date);
        setDialogVisible(true);
    };

    const customHeader = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>
                {selectedDay ? `Attendance Details - ${selectedDay.toLocaleDateString()}` : 'Attendance Details'}
            </h4>
            <span className="p-inputgroup" style={{ maxWidth: 200 }}>
                <InputText
                    placeholder="By Employee Name"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    style={{
                        height: '30px',       
                        fontSize: '0.8rem',   
                        padding: '2px 6px'    
                    }}
                />
            </span>
        </div>
    );

    // Export to CSV function for the whole month (summary per employee)
    const exportMonthToCSV = () => {
        // Get all records for the current month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthAttendance = attendanceData.filter(record => {
            const recordDate = new Date(record.PunchDate);
            return recordDate.getFullYear() === year && recordDate.getMonth() === month;
        });
        if (!monthAttendance || monthAttendance.length === 0) return;

        // Group by EmployeeName and count Present/Absent
        const summary = {};
        monthAttendance.forEach(record => {
            const name = record.EmployeeName;
            if (!summary[name]) {
                summary[name] = { Present: 0, Absent: 0 };
            }
            if (record.Status === 'Present') summary[name].Present += 1;
            if (record.Status === 'Absent') summary[name].Absent += 1;
        });

        // Prepare CSV rows
        const header = ["EmployeeName", "Present", "Absent", "TotalWorkingDays"];
        const rows = Object.entries(summary).map(([name, counts]) =>
            [name, counts.Present, counts.Absent, counts.Present + counts.Absent]
        );
        const csv = [
            header.join(','),
            ...rows.map(row => row.join(','))
        ].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AttendanceSummary_${year}-${String(month+1).padStart(2,'0')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="content-wrapper " style={{ minHeight: '100vh' }}>

            <div className="card" style={{ maxWidth: 1280, margin: '0 auto' }}>
                {/* Header */}
                <div className="card-header d-flex justify-content-center align-items-center p-3 mb-0 pb-0">
                    <div className="d-flex align-items-center">
                        <select
                            className="form-select me-2"
                            style={{ width: 160, display: 'inline-block' }}
                            value={currentDate.getMonth()}
                            onChange={handleMonthChange}
                        >
                            {monthNames.map((name, idx) => (
                                <option value={idx} key={name}>{name}</option>
                            ))}
                        </select>
                        <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>{currentDate.getFullYear()}</span>
                        <button
                            className="btn btn-success btn-sm ms-4"
                            style={{ marginLeft: 25 }}
                            onClick={exportMonthToCSV}
                            disabled={attendanceData.filter(record => {
                                const recordDate = new Date(record.PunchDate);
                                return recordDate.getFullYear() === currentDate.getFullYear() && recordDate.getMonth() === currentDate.getMonth();
                            }).length === 0}
                        >
                            Export to CSV
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="card-body p-0 mt-0 pt-0">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                            <thead className="table-light">
                                <tr>
                                    {dayNames.map((day, idx) => (
                                        <th key={day} className={`text-center py-3 ${idx === 6 ? 'bg-light text-secondary' : ''}`} style={{ width: '14.28%' }}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                                    <tr key={weekIndex}>
                                        {Array.from({ length: 7 }, (_, dayIndex) => {
                                            const dayNumber = calendarDays[weekIndex * 7 + dayIndex];
                                            const dateForDay = dayNumber ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber) : null;
                                            const isSunday = dayIndex === 6;
                                            const dayAttendance = dateForDay && !isSunday ? getAttendanceForDate(dateForDay) : [];
                                            const presentCount = dayAttendance.filter(record => record.Status === 'Present').length;
                                            const absentCount = dayAttendance.filter(record => record.Status === 'Absent').length;
                                            return (
                                                <td
                                                    key={dayIndex}
                                                    className={`text-center align-top ${dayNumber && !isSunday ? 'cursor-pointer' : ''} ${isSunday ? 'bg-light text-secondary' : ''}`}
                                                    style={{
                                                        height: '90px',
                                                        verticalAlign: 'top',
                                                        background: isSunday ? '#f3f4f6' : '#fff',
                                                        color: isSunday ? '#adb5bd' : '#22223b',
                                                        pointerEvents: isSunday ? 'none' : 'auto',
                                                        opacity: isSunday ? 0.7 : 1,
                                                        fontWeight: 500,
                                                        fontSize: '1.1rem',
                                                    }}
                                                    onClick={() => handleDayClick(dayNumber, dayIndex)}
                                                >
                                                    {dayNumber && (
                                                        <div>
                                                            <div className="mb-1">{dayNumber}</div>
                                                            {!isSunday && dayAttendance.length > 0 && (
                                                                <div style={{ fontSize: '0.95rem' }}>
                                                                    <div className="text-success">Present: {presentCount}</div>
                                                                    <div className="text-danger">Absent: {absentCount}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Dialog for day details */}
            <Dialog
                header={customHeader}
                visible={dialogVisible}
                style={{ width: '70vw' }}
                onHide={() => setDialogVisible(false)}
                modal
            >
                <DataTable
                    value={selectedDayAttendance}
                    emptyMessage="No attendance records for this day."
                    responsiveLayout="scroll"
                    paginator
                    rows={15}
                    loading={false}
                    stripedRows
                    globalFilter={globalFilter}
                    filterDisplay="row"
                >
                    <Column
                        field="EmployeeName"
                        header="Employee Name"
                    />
                    <Column field="MinCheckIn" header="Check In" />
                    <Column field="MaxCheckOut" header="Check Out" />
                    <Column field="TotalWorkingTime" header="Working Time" />
                    <Column
                        field="Status"
                        header="Status"
                        body={(rowData) => (
                            <span
                                style={{
                                    color: rowData.Status === 'Present' ? 'green' : 'red',
                                    fontWeight: 'bold'
                                }}
                            >
                                {rowData.Status}
                            </span>
                        )}
                    />
                </DataTable>
            </Dialog>
        </div>
    );
}