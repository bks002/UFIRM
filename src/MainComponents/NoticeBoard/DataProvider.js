import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageNoticeBoard(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'C0':
                url = `Property/NoticeBoard/Save`;
                return srv.CallPostService(url, model[0])
            case 'C':
                url = `NoticeBoardSave`;
                return srv.CallPostNewService(url, model[0])
            case 'D':
                url = `Property/NoticeBoard/Delete/${model[0].NoticeBoardId}/${model[0].StatementType}`;
                return srv.CallPostService(url)
            case 'R':
                url = `Property/NoticeBoard/ListAll/${model[0].StatementType}/${model[0].PropertyId}/${model[0].IsActive}`;
                return srv.get(url)
            case 'PD':
                url = `Property/NoticeBoard/AssignedProperties/${model[0].StatementType}/${model[0].PropertyId}/${model[0].NoticeBoardId}`;
                return srv.get(url)
            case 'NATT':
                url = `Property/NoticeBoard/Attachments/${model[0].StatementType}/${model[0].PropertyId}/${model[0].NoticeBoardId}`;
                return srv.get(url)
            default:
        }
    }
    getDropDwonData(cmdType, PropertyID) {
        let url = `Property/NoticeBoardDropdown/${cmdType}/${PropertyID}`
        return srv.get(url);
    }
}
export default DataProvider;