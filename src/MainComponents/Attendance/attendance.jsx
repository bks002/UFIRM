import React, { useState, useEffect } from "react";
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { getAttendance, getFacilityMembers, getAllLocations, saveManualAttendance, getManualAttendanceByProperty, processManualAttendance, rejectprocessManualAttendance } from "../../Services/AttendanceService";
import * as XLSX from "xlsx";
import { useSelector } from 'react-redux';

export default function AttendanceMaster() {
    const formPayload = new FormData();
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [rejectionRemark, setRejectionRemark] = useState("");
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [globalFilter, setGlobalFilter] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedDayAttendance, setSelectedDayAttendance] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const propertyId = useSelector((state) => state.Commonreducer.puidn);
    const userId = useSelector((state) => state.Commonreducer.userId);
    const [previewImage, setPreviewImage] = useState(null);
    const [submittedData, setSubmittedData] = useState([]);
    
    // ✅ New States for Pending and Approved/Rejected dialogs
    const [pendingDialog, setPendingDialog] = useState(false);
    const [approvedRejectedDialog, setApprovedRejectedDialog] = useState(false);
    const [pendingData, setPendingData] = useState([]);
    const [approvedRejectedData, setApprovedRejectedData] = useState([]);
    
    const [createDialog, setCreateDialog] = useState(false);
    const [locations, setLocations] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [formData, setFormData] = useState({
        Id: 0,
        employee: null,
        mobile: "",
        punchDate: null,
        checkIn: null,
        checkOut: null,
        gateNo: "",
        image: "",
        location: "",
        reason: ""
    });

    // ✅ Employee fetch API call
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                if (!propertyId) return;
                const data = await getFacilityMembers(propertyId);
                const formatted = data.map(emp => ({
                    ...emp,
                    label: emp.Name,
                    value: emp
                }));
                console.log("Fetched Employees:", formatted);
                setEmployeeList(formatted);
            } catch (error) {
                console.error("Failed to load employees:", error);
            }
        };
        fetchEmployees();
    }, [propertyId]);

    const employeeMap = React.useMemo(() => {
    const map = {};
    employeeList.forEach(emp => {
        map[emp.FacilityMemberId] = emp.Name;
    });
    return map;
}, [employeeList]);


    // ✅ Location fetch API call
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await getAllLocations();
                setLocations(data);
            } catch (error) {
                console.error("Failed to load locations:", error);
            }
        };
        fetchLocations();
    }, []);

    // ✅ Fetch all manual attendance and separate pending vs approved/rejected
    useEffect(() => {
        fetchManualAttendance();
    }, [propertyId]);

    const fetchManualAttendance = async () => {
        if (!propertyId) return;
        try {
            const savedData = await getManualAttendanceByProperty(propertyId);
            
            const formattedData = savedData.map(item => ({
              
                Id: item.Id,
                EmployeeId: item.EmployeeId,
                EmployeeName: item.EmployeeName ||
    employeeMap[item.EmployeeId] ||
    `ID-${item.EmployeeId}`,
                employee: { Name: item.EmployeeName || `ID-${item.EmployeeId}` },
                mobile: item.MobileNo,
                PunchTime: item.PunchTime ? new Date(item.PunchTime) : null,
                punchDate: item.PunchTime ? new Date(item.PunchTime) : null,
                checkIn: item.PunchTime ? new Date(item.PunchTime) : null,
                PunchType: item.PunchType,
                GateNo: item.GateNo,
                CreatedBy: item.CreatedBy,
                CreatedOn: item.CreatedOn ? new Date(item.CreatedOn) : null,
                EmpId: item.EmpId,
                Status: item.Status,
                image: item.ImageFileName,
                ImageFileName: item.ImageFileName,
                location: item.LocationName || "",
                LocationName: item.LocationName || "",
                Reason: item.Reason || "",
                IsApproved: item.IsApproved || false,
                IsRejected: item.IsRejected || false,
                RejectionRemark: item.RejectionRemark || "",
                ApprovedBy: item.ApprovedBy,
                ApprovedOn: item.ApprovedOn ? new Date(item.ApprovedOn) : null
            }));

            // Separate pending from approved/rejected
            const pending = formattedData.filter(item => !item.IsApproved && !item.IsRejected);
            const processed = formattedData.filter(item => item.IsApproved || item.IsRejected);

            setPendingData(pending);
            setApprovedRejectedData(processed);
            setSubmittedData(formattedData);
        } catch (error) {
            console.error("Failed to fetch saved attendance:", error);
        }
    };

    // ✅ Approve Attendance
    const handleApprove = async (record) => {
        console.log("Approving record:", record);
        try {
            await processManualAttendance({
                id: record.Id,
                approve: true,
                actionBy: userId
            });
            
            alert("Attendance approved ✅");
            fetchManualAttendance(); // Refresh data
        } catch (error) {
            console.error(error);
            alert("Failed to approve ❌");
        }
    };

    // ✅ Reject Attendance (open dialog)
    const handleReject = (record) => {
        setSelectedAttendanceId(record.Id);
        setRejectionRemark("");
        setRejectionDialog(true);
    };

    // ✅ Submit Rejection
    const submitRejection = async () => {
        if (!rejectionRemark.trim()) {
            alert("Please enter rejection remark");
            return;
        }
        try {
            await rejectprocessManualAttendance({
                id: selectedAttendanceId,
                approve: false,
                actionBy: userId,
                rejectionRemark
            });
            
            alert("Attendance rejected ❌");
            setRejectionDialog(false);
            fetchManualAttendance(); // Refresh data
        } catch (error) {
            console.error(error);
            alert("Failed to reject ❌");
        }
    };

    // ✅ On employee select
    const handleEmployeeChange = (e) => {
        const emp = e.value;
        setFormData({
            ...formData,
            employee: emp,
            mobile: emp && emp.MobileNumber ? emp.MobileNumber : ""
        });
    };

    const onImageUpload = async (event) => {
        const file = event.files[0];
        if (!file) return;

        const toBase64 = (file) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(",")[1]);
                reader.onerror = (error) => reject(error);
            });

        try {
            const base64Image = await toBase64(file);
            setFormData({ ...formData, image: base64Image });
            setPreviewImage(URL.createObjectURL(file));
        } catch (error) {
            console.error("Error converting image to base64:", error);
        }
    };

    // ✅ Submit & Save to API
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.employee || !formData.punchDate || !formData.checkIn) {
                alert("Please fill required fields (Employee, Punch Date, Check In).");
                return;
            }

            const payload = {
                Id: '',
                EmployeeId: formData.employee.FacilityMemberId,
                PunchTime: formData.checkIn ? new Date(formData.checkIn).toISOString() : null,
                PunchType: formData.checkOut ? "Both" : "CheckIn",
                CreatedOn: new Date().toISOString(),
                GateNo: formData.gateNo || "0",
                CreatedBy: userId || 0,
                MobileNo: formData.mobile || "",
                EmpId: formData.employee.FacilityMemberId.toString(),
                Status: "Pending",
                ImageFileName: formData.image || "",
                IsApproved: false,
                IsRejected: false,
                RejectionRemark: "",
                PropertyId: propertyId || 0,
                LocationName: formData.location || "",
                Reason: formData.reason || ""
            };

            await saveManualAttendance(payload);
            alert("Manual attendance submitted successfully ✅");
            setCreateDialog(false);
            fetchManualAttendance(); // Refresh data
            
            // Reset form
            setFormData({
                Id: 0,
                employee: null,
                mobile: "",
                punchDate: null,
                checkIn: null,
                checkOut: null,
                gateNo: "",
                image: "",
                location: "",
                reason: ""
            });
            setPreviewImage(null);
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert("Error saving attendance ❌");
        }
    };

    const getAttendanceForDate = (date) => {
        const dateStr = date.toISOString().slice(0, 10);
        return attendanceData.filter(record => {
            const recordDate = new Date(record.PunchDate);
            return recordDate.toISOString().slice(0, 10) === dateStr;
        });
    };

    const getDayStatusSummary = (dayAttendance) => {
        if (!dayAttendance || dayAttendance.length === 0) return null;
        return dayAttendance.every(r => r.Status === "Holiday") ? "Holiday" : "WorkingDay";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Present": return "green";
            case "Holiday": return "#0d6efd";
            case "Leave": return "#fd7e14";
            default: return "red";
        }
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
            if (!propertyId) return;
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const fromDate = new Date(year, month, 1);
            const toDate = new Date(year, month + 1, 0);
            const formatDate = (date) => date.toLocaleDateString('en-CA');

            try {
                const data = await getAttendance(propertyId, formatDate(fromDate), formatDate(toDate));
                setAttendanceData(data);
            } catch (error) {
                console.error("Failed to fetch attendance:", error);
            }
        };
        fetchData();
    }, [propertyId, currentDate]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const calendarDays = generateCalendarDays();

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

    const exportMonthToCSV = (attendanceData, currentDate) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const allDates = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d, 12, 0, 0);
            const key = dateObj.toISOString().slice(0, 10);
            allDates.push(key);
        }

        const employees = {};
        attendanceData.forEach(record => {
            const emp = record.EmployeeName;
            const recordDateObj = new Date(record.PunchDate);
            recordDateObj.setHours(12, 0, 0, 0);
            const dateKey = recordDateObj.toISOString().slice(0, 10);
            if (!employees[emp]) employees[emp] = {};
            employees[emp][dateKey] = {
                CheckIn: record.MinCheckIn || "--",
                CheckOut: record.MaxCheckOut || "--",
                WorkingTime: record.TotalWorkingTime || "0h",
                Status: record.Status || "Absent"
            };
        });

        let ws_data = [];
        Object.entries(employees).forEach(([emp, attMap]) => {
            let present = 0, absent = 0, weekOff = 0, totalWTmin = 0;

            allDates.forEach(dateKey => {
                const rec = attMap[dateKey];
                let status = rec ? rec.Status : "Absent";
                if (status === "Present") present++;
                else if (status === "WeekOff") weekOff++;
                else absent++;

                if (rec && rec.WorkingTime && rec.WorkingTime !== "0h") {
                    let parts = rec.WorkingTime.split(":");
                    let h = parseInt(parts[0]) || 0;
                    let m = parseInt(parts[1]) || 0;
                    totalWTmin += h * 60 + m;
                }
            });

            const totalHours = `${Math.floor(totalWTmin / 60)}h ${totalWTmin % 60}m`;

            ws_data.push([`Employee: ${emp}`]);
            ws_data.push([
                `Present: ${present}`,
                `Absent: ${absent}`,
                `WeekOff: ${weekOff}`,
                `Working Hours: ${totalHours}`
            ]);
            ws_data.push([]);

            const displayDates = allDates.map(dateKey => {
                const [y, m, d] = dateKey.split("-");
                return `${d}-${m}-${y}`;
            });
            ws_data.push(["Date", ...displayDates]);
            ws_data.push(["In", ...allDates.map(d => attMap[d] ? attMap[d].CheckIn : "--")]);
            ws_data.push(["Out", ...allDates.map(d => attMap[d] ? attMap[d].CheckOut : "--")]);
            ws_data.push(["WT", ...allDates.map(d => attMap[d] ? attMap[d].WorkingTime : "0h")]);
            ws_data.push(["Status", ...allDates.map(d => attMap[d] ? attMap[d].Status : "Absent")]);
            ws_data.push([]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_${month + 1}_${year}.xlsx`);
    };

    const exportMonthToCSV_Horizontal = (attendanceData, currentDate) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const allDates = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d, 12, 0, 0);
            const key = dateObj.toISOString().slice(0, 10);
            const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            allDates.push({ key, label: `Day ${d} (${dayName})` });
        }

        const employees = {};
        attendanceData.forEach(record => {
            const emp = record.EmployeeName;
            const recordDateObj = new Date(record.PunchDate);
            recordDateObj.setHours(12, 0, 0, 0);
            const dateKey = recordDateObj.toISOString().slice(0, 10);
            if (!employees[emp]) employees[emp] = {};
            employees[emp][dateKey] = {
                WorkingTime: record.TotalWorkingTime || "00:00:00",
                Status: record.Status || "A"
            };
        });

        let ws_data = [];
        ws_data.push([
            "Employee Name",
            ...allDates.map(d => d.label),
            "Total P",
            "Total A",
            "Total WO",
            "Payable Days",
            "Total WT"
        ]);

        const sumTimes = (times) => {
            let totalSeconds = times.reduce((acc, t) => {
                const [h, m, s] = t.split(':').map(Number);
                return acc + h * 3600 + m * 60 + s;
            }, 0);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        Object.entries(employees).forEach(([emp, attMap]) => {
            let row = [emp];
            let totalP = 0, totalA = 0, totalWO = 0;
            let dailyTimes = [];

            allDates.forEach(({ key }) => {
                const att = attMap[key];
                if (att) {
                    row.push(`Status: ${att.Status} WT: ${att.WorkingTime}`);
                    if (att.Status === "P") totalP++;
                    else if (att.Status === "A") totalA++;
                    else if (att.Status === "WO") totalWO++;
                    if (att.WorkingTime && att.WorkingTime !== "--") dailyTimes.push(att.WorkingTime);
                } else {
                    row.push("Status: A WT: --");
                    totalA++;
                }
            });

            const payableDays = totalP + totalWO;
            const totalWT = dailyTimes.length ? sumTimes(dailyTimes) : "00:00:00";
            row.push(totalP, totalA, totalWO, payableDays, totalWT);
            ws_data.push(row);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_${month + 1}_${year}.xlsx`);
    };

    const exportDailyToCSV = (attendanceList, selectedDay) => {
        if (!attendanceList || attendanceList.length === 0) {
            alert("No attendance data available for export.");
            return;
        }

        const columns = ["Employee Name", "Check In", "Check Out", "Working Time", "Status"];
        const rows = attendanceList.map(record => [
            record.EmployeeName || "",
            record.MinCheckIn || "",
            record.MaxCheckOut || "",
            record.TotalWorkingTime || "",
            record.Status || ""
        ]);

        const wsData = [
            [`Attendance for: ${selectedDay ? selectedDay.toLocaleDateString() : ""}`],
            columns,
            ...rows,
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Daily Attendance");
        const fileName = `Attendance_${selectedDay ? selectedDay.toISOString().slice(0, 10) : "date"}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const customHeader = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{selectedDay ? `Attendance Details - ${selectedDay.toLocaleDateString()}` : 'Attendance Details'}</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Button
                    label="Export to Daily"
                    icon="pi pi-file-excel"
                    className="p-button-success"
                    onClick={() => exportDailyToCSV(selectedDayAttendance, selectedDay)}
                    disabled={!selectedDayAttendance || selectedDayAttendance.length === 0}
                />
                <InputText
                    placeholder="Search..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    style={{ height: '30px', fontSize: '0.8rem', padding: '2px 6px' }}
                />
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px',paddingLeft: '80px',  fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '10px'
            }}>
                <div></div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                    <select
                        value={currentDate.getMonth()}
                        onChange={handleMonthChange}
                        style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        {monthNames.map((name, idx) => (
                            <option key={idx} value={idx}>{name}</option>
                        ))}
                    </select>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentDate.getFullYear()}</span>
                    <Button
                        label="Export to CSV"
                        icon="pi pi-file-excel"
                        className="p-button-success"
                        onClick={() => {
                            if (propertyId == 27) {
                                exportMonthToCSV(attendanceData, currentDate);
                            } else {
                                exportMonthToCSV_Horizontal(attendanceData, currentDate);
                            }
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <Button
                        label="Pending"
                        icon="pi pi-clock"
                        className="p-button-warning"
                        onClick={() => setPendingDialog(true)}
                        badge={pendingData.length.toString()}
                    />
                    <Button
                        label="Approved/Rejected"
                        icon="pi pi-check-circle"
                        className="p-button-info"
                        onClick={() => setApprovedRejectedDialog(true)}
                    />
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '5px',
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '8px'
            }}>
                {dayNames.map((day, idx) => (
                    <div key={idx} style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        padding: '10px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px'
                    }}>
                        {day}
                    </div>
                ))}

                {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                    Array.from({ length: 7 }, (_, dayIndex) => {
                        const dayNumber = calendarDays[weekIndex * 7 + dayIndex];
                        const dateForDay = dayNumber ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber) : null;
                        const isSunday = dayIndex === 6;
                        const dayAttendance = dateForDay && !isSunday ? getAttendanceForDate(dateForDay) : [];
                        const presentCount = dayAttendance.filter(record => record.Status === 'Present').length;
                        const leaveCount = dayAttendance.filter(record => record.Status === 'Leave').length;
                        const absentCount = dayAttendance.filter(record => record.Status === 'Absent').length;
                        const dayStatus = getDayStatusSummary(dayAttendance);

                        return (
                            <div
                                key={`${weekIndex}-${dayIndex}`}
                                onClick={() => handleDayClick(dayNumber, dayIndex)}
                                style={{
                                    minHeight: '80px',
                                    padding: '10px',
                                    backgroundColor: isSunday ? '#ffe6e6' : (dayNumber ? '#fff' : 'transparent'),
                                    border: dayNumber ? '1px solid #dee2e6' : 'none',
                                    borderRadius: '4px',
                                    cursor: dayNumber && !isSunday ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (dayNumber && !isSunday) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    if (dayNumber && !isSunday) e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {dayNumber && (
                                    <>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>
                                            {dayNumber}
                                        </div>
                                        {!isSunday && dayAttendance.length > 0 && (
                                            dayStatus === "Holiday" ? (
                                                <div style={{
                                                    fontSize: '12px',
                                                    padding: '4px',
                                                    backgroundColor: '#0d6efd',
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    textAlign: 'center'
                                                }}>
                                                    🎉 Holiday 🎉
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '11px' }}>
                                                    <div style={{ color: 'green' }}>✓ Present: {presentCount}</div>
                                                    <div style={{ color: '#fd7e14' }}>⊘ Leave: {leaveCount}</div>
                                                    <div style={{ color: 'red' }}>✗ Absent: {absentCount}</div>
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })
                )).flat()}
            </div>

            {/* Dialog for day details */}
            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={customHeader}
                style={{ width: '80vw' }}
                modal
            >
                <DataTable value={selectedDayAttendance} globalFilter={globalFilter} paginator rows={10}>
                    <Column field="EmployeeName" header="Employee Name" sortable />
                    <Column field="MinCheckIn" header="Check In" sortable />
                    <Column field="MaxCheckOut" header="Check Out" sortable />
                    <Column field="TotalWorkingTime" header="Working Time" sortable />
                    <Column
                        field="Status"
                        header="Status"
                        sortable
                        body={(rowData) => (
                            <span style={{ color: getStatusColor(rowData.Status), fontWeight: 'bold' }}>
                                {rowData.Status}
                            </span>
                        )}
                    />
                </DataTable>
            </Dialog>

            
            {/* ✅ Manual Attendance Pending Dialog */}
            <Dialog
                visible={pendingDialog}
                onHide={() => setPendingDialog(false)}
                header={`Manual Attendance Pending (${pendingData.length})`}
                style={{ width: '90vw' }}
                modal
            >
                {pendingData.length > 0 ? (
                    <DataTable value={pendingData} paginator rows={10} globalFilter={globalFilter}>
                        <Column field="Id" header="ID" sortable style={{ width: '80px' }} />
                        <Column 
                            field="EmployeeName" 
                            header="Employee Name" 
                            sortable 
                        />
                        {/* <Column 
                            field="mobile" 
                            header="Mobile" 
                            sortable 
                        /> */}
                        <Column
                            field="PunchTime"
                            header="Punch Time"
                            sortable
                            body={(rowData) => rowData.PunchTime ? new Date(rowData.PunchTime).toLocaleString() : ""}
                        />
                        <Column 
                            field="PunchType" 
                            header="Punch Type" 
                            sortable 
                        />
                     
                        <Column 
                            field="LocationName" 
                            header="Location" 
                            sortable 
                        />
                        <Column 
                            field="Reason" 
                            header="Reason" 
                            sortable 
                        />
                        <Column
                            field="Status"
                            header="Status"
                            sortable
                            body={(rowData) => (
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#ffc107',
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    {rowData.Status}
                                </span>
                            )}
                        />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <Button
                                        icon="pi pi-check"
                                        className="p-button-success p-button-sm"
                                        onClick={() => handleApprove(rowData)}
                                        tooltip="Approve"
                                    />
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-danger p-button-sm"
                                        onClick={() => handleReject(rowData)}
                                        tooltip="Reject"
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No pending records available
                    </div>
                )}
            </Dialog>

            {/* ✅ Manual Attendance Approved/Rejected Dialog */}
            <Dialog
                visible={approvedRejectedDialog}
                onHide={() => setApprovedRejectedDialog(false)}
                header={`Manual Attendance History (${approvedRejectedData.length})`}
                style={{ width: '90vw' }}
                modal
            >
                {approvedRejectedData.length > 0 ? (
                    <DataTable value={approvedRejectedData} paginator rows={10} globalFilter={globalFilter}>
                        <Column field="Id" header="ID" sortable style={{ width: '80px' }} />
                        <Column 
                            field="EmployeeName" 
                            header="Employee Name" 
                            sortable 
                        />
                        {/* <Column 
                            field="mobile" 
                            header="Mobile" 
                            sortable 
                        /> */}
                        <Column
                            field="PunchTime"
                            header="Punch Time"
                            sortable
                            body={(rowData) => rowData.PunchTime ? new Date(rowData.PunchTime).toLocaleString() : ""}
                        />
                        <Column 
                            field="PunchType" 
                            header="Punch Type" 
                            sortable 
                        />
                        
                        <Column 
                            field="LocationName" 
                            header="Location" 
                            sortable 
                        />
                        <Column 
                            field="Reason" 
                            header="Reason" 
                            sortable 
                        />
                       
                        <Column
                            field="ApprovedOn"
                            header="Processed On"
                            sortable
                            body={(rowData) => rowData.ApprovedOn ? new Date(rowData.ApprovedOn).toLocaleString() : ""}
                        />
                        <Column
                            header="Status"
                            body={(rowData) => (
                                <div>
                                    {rowData.IsApproved && (
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            ✓ Approved
                                        </span>
                                    )}
                                    {rowData.IsRejected && (
                                        <div>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>
                                                ✗ Rejected
                                            </span>
                                            {rowData.RejectionRemark && (
                                                <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                                                    Remark: {rowData.RejectionRemark}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </DataTable>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        No processed records available
                    </div>
                )}
            </Dialog>

            {/* ✅ Rejection Remark Dialog */}
            <Dialog
                visible={rejectionDialog}
                onHide={() => setRejectionDialog(false)}
                header="Reject Manual Attendance"
                style={{ width: '400px' }}
                modal
            >
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Remark
                    </label>
                    <InputText
                        value={rejectionRemark}
                        onChange={(e) => setRejectionRemark(e.target.value)}
                        placeholder="Enter rejection remark"
                        className="w-full"
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button
                        label="Cancel"
                        icon="pi pi-times"
                        onClick={() => setRejectionDialog(false)}
                        className="p-button-secondary"
                    />
                    <Button
                        label="Submit"
                        icon="pi pi-check"
                        onClick={submitRejection}
                        className="p-button-danger"
                    />
                </div>
            </Dialog>
        </div>
    );
}