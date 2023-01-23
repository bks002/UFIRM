import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageCategory(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'C':
                url = `Calendar/Category/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'U':
                url = `Calendar/Category/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Calendar/Category/Delete/${model[0].CatId}/${model[0].CmdType}`;
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `Calendar/Category/List/${model[0].CmdType}`;
                return srv.get(url);
                break;
            default:
        }
    }

    manageSubCategory(model, type,categoryId) {
        // 
        let url = '';
        switch (type) {
            case 'C':
                url = `CreateSubCategory`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'R':
                url = `GetCategory?categoryId=${categoryId}`;
                return srv.getComplaint(url);
                break;
            default:
        }
    }

    manageTask(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'C':
                url = `CreateTask`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'U':
                url = `Calendar/Category/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `DeleteTask?taskID=${model[0].TaskId}`;
                return srv.CallDeleteNewService(url,model[0]);
                break;
            case 'R':
                url = `TaskDetails?catID=${model[0].CategoryId}&subCatID=${model[0].SubCategoryId}&assingedtoID=${model[0].AssignedTo}&occurrence=${model[0].Occurrence}`;
                return srv.getComplaint(url);
                break;
            default:
        }
    }

    manageResidentEvents(model, type) {
        console.log(model)
        let url = '';
        switch (type) {
            case 'R':
                url = `EventTaskBooking`;
                return srv.getComplaint(url);
                break;
                case 'Approve':
                url = `ApproveEventTaskBooking?BookingId=${model[0].BookingId}`;
                return srv.CallPostNewService(url);
                break;
            default:
        }
    }

    manageTaskEvents(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'R':
                url = `TaskDetailsEvent`;
                return srv.getComplaint(url);
                break;
            default:
        }
    }

    manageAssets(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'R':
                url = `GetAssets`;
                return srv.getComplaint(url);
                break;
            default:
        }
    }

    manageAssign(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'R':
                url = `AssignToList`;
                return srv.getComplaint(url);
                break;
            default:
        }
    }

    manageQues(model, type) {
        // 
        let url = '';
        console.log(model)
        switch (type) {
            case 'C':
                url = `/CreateQuestionnaire`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'U':
                url = `/UpdateQuestionnaire`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'D':
                url = `DeleteQuestionnaire?questID=${model[0].Id}`;
                return srv.CallDeleteNewService(url,model[0]);
                break;
            case 'R':
                url=`QuestionsDetailsOfTask?taskID=${model[0].Id}`;
                return srv.getComplaint(url);
                break;
            case 'AB': //Amenites Bookings
                url=`AmenitiesBookings?PropertyID=${model[0].PropertyId}&UserID=${model[0].UserId}&DateFr=${model[0].DateFrom}&DateTo=${model[0].DateTo}`;
                return srv.getComplaint(url);
                break;
            case 'ABA': //Amenites Bookings Approve
                url=`AmenitiesBookingApprove?Id=${model[0].Id}`;
                return srv.getComplaint(url);
                break;
            default:
        }
    }

    manageAssigne(PropertyId) {
        let url = `Calendar/Assignee/${PropertyId}`;
        return srv.get(url);
    }

    manageEvents(model, type) {
        let url = '';
        switch (type) {
            case 'C':
                url = `Calendar/Event/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'U':
                url = `Calendar/Event/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Calendar/Event/Approval/Save`;
                //  url = `Calendar/Event/Delete/${model[0].id}/${model[0].cmdType}`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'E': // event list
                url = `Calendar/Event/List/${model[0].CmdType}/${model[0].PropertyId}/${model[0].EventType}/${model[0].Categories}/${model[0].Assignees}/${model[0].EventStatus}`;
                return srv.get(url);
                break;
            case 'DT': // event details
                url = `Calendar/Event/Details/${model[0].CmdType}/${model[0].PropertyId}/${model[0].EventId}/${model[0].SubEventId}`;
                return srv.get(url);
                break;
            case 'EATT': // event attachment
                url = `Calendar/Event/Attachment/${model[0].cmdType}/${model[0].id}`;
                return srv.get(url);
                break;
            case 'EST': // event SubTask
                url = `Calendar/Event/SubTask/${model[0].cmdType}/${model[0].SubEventId}`;
                return srv.get(url);
                break;
            case 'UST':
                url = `Calendar/Event/Subtask/Complete/${model[0].id}/${model[0].cmdType}/${model[0].isCompleted}`;
                return srv.CallPostService(url);
                break;
            case 'DST':
                url = `Calendar/Event/Subtask/Delete/${model[0].id}/${model[0].cmdType}`;
                return srv.CallPostService(url);
                break;
            case 'ELog': // event logs
                url = `Calendar/Event/Logs/${model[0].cmdType}/${model[0].EventId}/${model[0].SubEventId}`;
                return srv.get(url);
                break;
            case 'EComments': // get event comments 
                url = `Calendar/Event/Comments/${model[0].cmdType}/${model[0].SubEventId}/${model[0].EventId}`;
                return srv.get(url);
                break;
            case 'CComment':
                url = `Calendar/Event/Comment/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'CEVT': // mark as complete event 
                url = `Calendar/Event/Complete`;
                return srv.CallPostService(url, model[0]);
                break;
            default:
        }
    }

    getTaskStatus() {
        let url = `Calendar/Event/TaskStatus`;
        return srv.get(url);
    }

    manageEventApproval(model, type) {
        let url = '';
        switch (type) {
            case 'R': // get event approval list 
                url = `Calendar/Event/Approval/List/${model[0].cmdType}/${model[0].PropertyId}/${model[0].FilterType}/${model[0].PageSize}/${model[0].PageNumber}/${model[0].SearchValue}`;
                return srv.get(url);
                break;
            case 'U': // update approval state and made changes according event and sub event table
                url = `Calendar/Event/Approval/Response/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            default:
        }
    }

    manageKYC(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'U':
                url = `Calendar/Category/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Calendar/Category/Delete/${model[0].CatId}/${model[0].CmdType}`;
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `KycDetailsList/${model[0].CmdType}`;
                return srv.get(url);
                break;
            default:
        }
    }

}
export default DataProvider;