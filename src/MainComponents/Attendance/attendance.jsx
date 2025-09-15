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
    const [viewDialog, setViewDialog] = useState(false);

    // ✅ States
    const [createDialog, setCreateDialog] = useState(false);
    const [locations, setLocations] = useState([]);
    const [employeeList, setEmployeeList] = useState([]); 
    const [formData, setFormData] = useState({
        Id:0,
        employee: null,
        mobile: "",
        punchDate: null,
        checkIn: null,
        checkOut: null,
        gateNo: "",
        image: "",
        location: ""
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

    useEffect(() => {
        const fetchSavedAttendance = async () => {
            if (!propertyId) return;
            try {
                const savedData = await getManualAttendanceByProperty(propertyId);
                const formattedData = savedData.map(item => ({
                    Id: item.Id,
                    employee: { Name: item.EmployeeName || `ID-${item.EmployeeId}` },
                    mobile: item.MobileNo,
                    punchDate: item.CheckInTime ? new Date(item.CheckInTime) : null,
                    checkIn: item.CheckInTime ? new Date(item.CheckInTime) : null,
                    checkOut: item.CheckOutTime ? new Date(item.CheckOutTime) : null,
                    gateNo: item.GateNo,
                    image: item.ImageFileName,
                    location: item.LocationName || "",
                    IsApproved: item.IsApproved || false,
                    IsRejected: item.IsRejected || false,
                    RejectionRemark: item.RejectionRemark || ""
                }));

                setSubmittedData(formattedData);
            } catch (error) {
                console.error("Failed to fetch saved attendance:", error);
            }
        };
        fetchSavedAttendance();
    }, [propertyId]);

    // ✅ Approve Attendance
    const handleApprove = async (record) => {
        console.log("Approving record:", record);
        try {
            await processManualAttendance({ id: record.Id, approve: true });
            setSubmittedData(prev =>
                prev.map(item =>
                    item.Id === record.Id ? { ...item, IsApproved: true, IsRejected: false } : item
                )
            );
            alert("Attendance approved ✅");
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
            await rejectprocessManualAttendance({ id: selectedAttendanceId, approve: false, rejectionRemark });
            setSubmittedData(prev =>
                prev.map(item =>
                    item.Id === selectedAttendanceId
                        ? { ...item, IsApproved: false, IsRejected: true, rejectionRemark: rejectionRemark }
                        : item
                )
            );
            alert("Attendance rejected ❌");
            setRejectionDialog(false);
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
                CheckInTime: formData.checkIn ? new Date(formData.checkIn).toISOString() : null,
                CheckOutTime: formData.checkOut ? new Date(formData.checkOut).toISOString() : null,
                CreatedOn: new Date().toISOString(),
                GateNo: formData.gateNo || 0,
                CreatedBy: userId || 0, 
                MobileNo: formData.mobile || "",
                EmpId: formData.employee.FacilityMemberId,               
                Status: "Present",
                ImageFileName: formData.image ,
                IsApproved: true,
                IsRejected: false,
                RejectionRemark: "",
                PropertyId: propertyId || 0,
                LocationName: formData.location || ""
            };
            await saveManualAttendance(payload);
            alert("Attendance saved successfully ✅");
            setCreateDialog(false);
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
            const toDate = new Date(year, month + 1, 0); // last day of month

            const formatDate = (date) => date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

            console.log("From:", formatDate(fromDate), "To:", formatDate(toDate));

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

    // ✅ New: Export to CSV (Vertical format)


const exportMonthToCSV = (attendanceData, currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Dates of the month
  const allDates = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    allDates.push(key);
  }

  // Employees grouping
  const employees = {};
  attendanceData.forEach(record => {
    const emp = record.EmployeeName;
    const dateKey = new Date(record.PunchDate).toISOString().split("T")[0];
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

    // Count summary
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

    // Employee Summary Row
    ws_data.push([`Employee: ${emp}`]);
    ws_data.push([
      `Present: ${present}`,
      `Absent: ${absent}`,
      `WeekOff: ${weekOff}`,
      `Working Hours: ${totalHours}`
    ]);
    ws_data.push([]);

    // Header Row (Dates)
    const displayDates = allDates.map(dateKey => {
      const [y, m, d] = dateKey.split("-");
      return `${d}-${m}-${y}`;
    });
    ws_data.push(["Date", ...displayDates]);

   // In Row
ws_data.push(["In", ...allDates.map(d => attMap[d] ? attMap[d].CheckIn : "--")]);

// Out Row
ws_data.push(["Out", ...allDates.map(d => attMap[d] ? attMap[d].CheckOut : "--")]);

// WT Row
ws_data.push(["WT", ...allDates.map(d => attMap[d] ? attMap[d].WorkingTime : "0h")]);

// Status Row
ws_data.push(["Status", ...allDates.map(d => attMap[d] ? attMap[d].Status : "Absent")]);

    ws_data.push([]); // spacing before next employee
  });

  // Export to Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, `Attendance_${month + 1}_${year}.xlsx`);
};




    const customHeader = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>
                {selectedDay ? `Attendance Details - ${selectedDay.toLocaleDateString()}` : 'Attendance Details'}
            </h4>
            {console.log("Selected date:", selectedDay)}
            {console.log("Attendance for selected date:", selectedDayAttendance)}
<button
  className="btn btn-success btn-sm ms-4"
  onClick={() => exportMonthToCSV(attendanceData, currentDate)}
  disabled={attendanceData.filter(record => {
    const recordDate = new Date(record.PunchDate);
    return (
      recordDate.getFullYear() === currentDate.getFullYear() &&
      recordDate.getMonth() === currentDate.getMonth()
    );
  }).length === 0}
>
  Export to CSV
</button>





            
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

    return (
        <div className="content-wrapper " style={{ minHeight: '100vh' }}>

            <div className="card" style={{ maxWidth: 1280, margin: '0 auto' }}>
               {/* Header */}
<div className="card-header d-flex align-items-center justify-content-between p-3 mb-0 pb-0">
  
  {/* Empty left side (placeholder) */}
  <div style={{ width: "200px" }}></div>

  {/* 🔹 Center part: Month, Year, Export CSV */}
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
    <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>
      {currentDate.getFullYear()}
    </span>
    <button
      className="btn btn-success btn-sm ms-4"
      onClick={() => exportMonthToCSV(attendanceData, currentDate)}
      disabled={attendanceData.filter(record => {
        const recordDate = new Date(record.PunchDate);
        return (
          recordDate.getFullYear() === currentDate.getFullYear() &&
          recordDate.getMonth() === currentDate.getMonth()
        );
      }).length === 0}
    >
      Export to CSV
    </button>
  </div>

  {/* 🔹 Right part: Create + View */}
  <div className="d-flex ">
    <Button
      label="Create Mannual Attendance"
      className="btn btn-success btn-sm ms-4"
       style={{ fontWeight: 500 }}
      onClick={() => setCreateDialog(true)}
    />
    <Button
      label="View Mannual Attendance"
      className="btn btn-success btn-sm ms-4"
      style={{ fontWeight: 500 }}
      onClick={() => setViewDialog(true)}
    />
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
             {/* ✅ Create Attendance Dialog */}
            <Dialog
                header="Create Attendance Entry"
                visible={createDialog}
                style={{ width: "40vw" }}
                onHide={() => setCreateDialog(false)}
                modal
            >
                 <div className="p-fluid">
          <div className="p-field mb-3">
            <label>Employee Name</label>
            <Dropdown
              value={formData.employee}
              options={employeeList}
              onChange={handleEmployeeChange}
              placeholder="Select Employee"
              optionLabel="Name"
              
              showClear
            />
          </div>

                    <div className="p-field mb-3">
                        <label>Mobile Number</label>
                        <InputText value={formData.mobile} readOnly />
                    </div>

                     <div className="p-field">
                            <label htmlFor="location">Location</label>
                            <Dropdown
                            id="location"
                            name="location"
                            value={formData.location}
                            options={locations.map((loc) => ({ label: loc, value: loc }))}
                            onChange={(e) => setFormData({ ...formData, location: e.value })}
                            placeholder="Select Location"
                            className="w-full"
                            />
                        </div>
                    <div className="p-field mb-3">
                        <label>Punch Date</label>
                        <Calendar value={formData.punchDate} onChange={(e) => setFormData({ ...formData, punchDate: e.value })} dateFormat="yy-mm-dd" showIcon />
                    </div>

                    <div className="p-field mb-3">
                        <label>Check In</label>
                        <Calendar value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.value })} showTime showIcon />
                    </div>

                    <div className="p-field mb-3">
                        <label>Check Out</label>
                        <Calendar value={formData.checkOut} onChange={(e) => setFormData({ ...formData, checkOut: e.value })} showTime showIcon />
                    </div>

                    <div className="p-field mb-3">
                        <label>Gate No</label>
                        <InputText value={formData.gateNo} onChange={(e) => setFormData({ ...formData, gateNo: e.target.value })} />
                    </div>

                    <div className="p-field mb-3">
                        <label>Upload Image</label>
                        <FileUpload mode="basic" name="image" accept="image/*" maxFileSize={1000000} customUpload uploadHandler={onImageUpload} auto />
                        {previewImage && (
  <div className="mt-2">
    <img src={previewImage} alt="Preview" style={{ width: "120px", borderRadius: "8px" }} />
  </div>
)}
                    </div>

                    <div className="p-field text-right">
                        <Button label="Submit" icon="pi pi-check" onClick={handleSubmit} />
                    </div>
                </div>
            </Dialog>
           {/* ✅ View Attendance Dialog */}
<Dialog
  header="View Attendance Data"
  visible={viewDialog}
  style={{ width: "70vw" }}
  onHide={() => setViewDialog(false)}
  modal
>
  {submittedData.length > 0 ? (
    <DataTable value={submittedData} paginator rows={5} responsiveLayout="scroll" stripedRows>
      <Column field="employee.Name" header="Employee" />
      <Column field="mobile" header="Mobile" />
      <Column
        field="punchDate"
        header="Punch Date"
        body={(rowData) => rowData.punchDate ? new Date(rowData.punchDate).toLocaleDateString() : ""}
      />
      <Column
        field="checkIn"
        header="Check In"
        body={(rowData) => rowData.checkIn ? new Date(rowData.checkIn).toLocaleString() : ""}
      />
      <Column
        field="checkOut"
        header="Check Out"
        body={(rowData) => rowData.checkOut ? new Date(rowData.checkOut).toLocaleString() : ""}
      />
      <Column field="gateNo" header="Gate No" />
      <Column
        header="Image"
        body={(rowData) => {
            if (!rowData.image) return "No Image";
            const base64String = rowData.image.startsWith("data:") 
                ? rowData.image 
                : `data:image/jpeg;base64,${rowData.image}`;
            return <img src={base64String} alt="Attendance" style={{ width: "50px", borderRadius: "6px" }} />;
        }}
      />
      
     {/* ✅ Action Column */}
<Column
  header="Action"
  body={(rowData) => (
    <div className="flex gap-2 align-items-center">
      {!rowData.IsApproved && !rowData.IsRejected && (
        <>
          <Button
            icon="fa fa-check"
            className="p-button-success p-button-sm rounded"
            onClick={() => handleApprove(rowData)}
            disabled={rowData.IsRejected}
          />
          <Button
            icon="fa fa-times"
            className="p-button-danger p-button-sm rounded"
            onClick={() => handleReject(rowData)}
            disabled={rowData.IsApproved}
          />
        </>
      )}

      {rowData.IsApproved && (
        <span className="text-success fw-bold">Approved</span>
      )}

      {rowData.IsRejected && (
        <div className="text-danger fw-bold">
          Rejected
          {rowData.RejectionRemark && (
            <span
              style={{
                marginLeft: "6px",
                fontStyle: "italic",
                color: "#b02a37",
              }}
            >
              ({rowData.RejectionRemark})
            </span>
          )}
        </div>
      )}
    </div>
  )}
/>


    </DataTable>
  ) : (
    <p>No records available</p>
  )}
</Dialog>

{/* ✅ Rejection Remark Dialog */}
<Dialog
    header="Enter Rejection Remark"
    visible={rejectionDialog}
    style={{ width: '30vw' }}
    onHide={() => setRejectionDialog(false)}
    modal
>
    <div className="p-field">
        <label>Remark</label>
        <InputText
            value={rejectionRemark}
            onChange={(e) => setRejectionRemark(e.target.value)}
            placeholder="Enter remark"
        />
    </div>
    <div className="text-right mt-3">
        <Button label="Submit" icon="pi pi-check" onClick={submitRejection} className="p-button-danger" />
    </div>
</Dialog>




           

        </div>
    );
}