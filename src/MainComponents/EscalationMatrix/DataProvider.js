import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageEscalationMatrix(model, type) {
        //
        let url = '';
        switch (type) {
            case 'C':
                url = `Property/EscalationMatrix/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'U':
                url = `Property/EscalationMatrix/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Property/EscalationMatrix/Delete/${model[0].EscalationMatrixId}/${type} `
                return srv.CallPostService(url);
                break;
            case 'R':                
                url = 'Property/EscalationMatrix/ListAll/'
                    + model[0].SearchValue + '/' + model[0].PageSize + '/'
                    + model[0].PageNumber + '/' + type + '/' + model[0].PropertyId
                return srv.get(url);
                break;
            case 'T':
                url = 'Property/EscalationMatrix/ListAll/'
                    + model[0].SearchValue + '/' + model[0].PageSize + '/'
                    + model[0].PageNumber + '/' + 'R /' + model[0].PropertyId
                return srv.get(url);
                break;
            case 'S':
                url = 'Property/EscalationMatrixAssignments/ListAll/'
                    + model[0].StatementType + '/' + model[0].EscalationMatrixId
                return srv.get(url);
                break;
            default:
        }
    }

    getDropdownData(type, PropertyId) {
        let url = `Property/EscalationMatrixDropdown/${type}/${PropertyId}`
        return srv.get(url);
    }

}
export default DataProvider;