import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {

    mangeParkingAssignment(model) {
        let url = '';
        url = `Property/ManageParkingAssignment`;
        return srv.CallPostService(url, model[0]);
    }

    saveParkingAssignment(model) {
        let url = '';
        url = `Property/SaveParkingAssignment`;
        return srv.CallPostService(url, model[0]);
    }

    ExportToExcel(PropertyId) {
        let url = `Property/DownlaodParkingAssignmentExcel/${PropertyId}`
        return srv.get(url);
    }

}
export default DataProvider;