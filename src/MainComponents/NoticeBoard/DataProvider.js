import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageNoticeBoard(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'C':
                url = `Property/NoticeBoard/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Property/NoticeBoard/Delete/${model[0].NoticeBoardId}/${model[0].StatementType}`;
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `Property/NoticeBoard/ListAll/${model[0].StatementType}/${model[0].PropertyId}/${model[0].IsActive}`;
                return srv.get(url);
                break;
            case 'PD':
                url = `Property/NoticeBoard/AssignedProperties/${model[0].StatementType}/${model[0].PropertyId}/${model[0].NoticeBoardId}`;
                return srv.get(url);
                break;
            case 'NATT':
                url = `Property/NoticeBoard/Attachments/${model[0].StatementType}/${model[0].PropertyId}/${model[0].NoticeBoardId}`;
                return srv.get(url);
                break;
            default:
        }
    }
    getDropDwonData(cmdType, PropertyID) {
        let url = `Property/NoticeBoardDropdown/${cmdType}/${PropertyID}`
        return srv.get(url);
    }
}
export default DataProvider;