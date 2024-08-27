import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyEmployees(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'R':
                url = `Property/Employees/${model[0].PropertyId}/${model[0].StatementType}/${model[0].Status}`;
                return srv.get(url);
            case 'C':
                url = `Property/Employees/CreateEmployee/${model[0].PropertyId}/${model[0].Users}/${model[0].StatementType}`;
                return srv.CallPostService(url);
            case 'D':
                url = `Property/Employees/Delete/${model[0].userPropertyAssignmentId}/${model[0].StatementType}`;
                return srv.CallPostService(url);
            case 'UL':
                url = `Property/Employees/Users/${model[0].PropertyId}/${model[0].StatementType}`;
                return srv.get(url);
            default:
        }
    }
}
export default DataProvider;