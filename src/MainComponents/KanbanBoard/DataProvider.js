import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageTickets(model, type) {
        let url = '';
        // debugger
        switch (type) {
            case 'R':
                url = `Ticket/TicketSystem`
                return srv.CallPostService(url, model[0]);
                break;
            case 'AU':
                url = `Ticket/AssignedUser`
                return srv.CallPostService(url, model[0]);
                break;
            case 'TNUM':
                url = `Ticket/TicketNumbers`
                return srv.CallPostService(url, model[0]);
                break;
            case 'C':
                url = `Ticket/GenerateTicket`
                return srv.CallPostService(url, model[0]);
                break;
            case 'UT':
                url = `Ticket/UpdateTicket`
                return srv.CallPostService(url, model[0]);
                break;
            case 'TOH':
                url = `Ticket/HoldTicket`
                return srv.CallPostService(url, model[0]);
                break;
            case 'TRO':
                url = `Ticket/Reopen`
                return srv.CallPostService(url, model[0]);
                break;
            case 'TC':
                url = `Ticket/CreateTicketComment`
                return srv.CallPostService(url, model[0]);
                break;
            // Ticket log
            case 'CTL':
                url = `Ticket/CreateTicketlog`
                return srv.CallPostService(url, model[0]);
                break;
            case 'Excel':
                url = `Ticket/DownlaodTicketExcel`
                return srv.CallPostService(url, model[0]);
                break;
            default:
        }
    }
    ChangeTicketStatustype(StatementType, TicketId, StatusTypeId, log) {
        // debugger
        let url = `Ticket/ChangeTicketType/${StatementType}/${TicketId}/${StatusTypeId}/${log}`
        return srv.CallPostService(url);
    }
    GetCategory() {
        // debugger
        let url = `Ticket/AllTicketType`
        return srv.get(url);
    }
    // Category wise staff
    GetTeamMember(StatementType, Category, PropertyId) {
        //debugger
        let url = `Ticket/CategoryWiseAssignedMember/${StatementType}/${Category}/${PropertyId}`
        return srv.get(url);
    }

    GetDropdownData(StatementType, PropertyId, PropertyDetailsId, PropertyTowerId) {
        // debugger
        let url = `Ticket/CreateTicketDropdownVal/${StatementType}/${PropertyId}/${PropertyDetailsId}/${PropertyTowerId}`
        return srv.get(url);
    }
    GetEditTicketDropdownData(StatementType, TicketId) {
        // debugger
        let url = `Ticket/EditTicketDropdownVal/${StatementType}/${TicketId}`
        return srv.get(url);
    }
    GetticketAttachments(TicketId) {
        //debugger
        let url = `Ticket/TicketAttachments/${TicketId}`
        return srv.get(url);
    }
    GetticketComment(TicketId) {
        //debugger
        let url = `Ticket/TicketComments/${TicketId}`
        return srv.get(url);
    }

    GetPropertyManager(PropertyId) {
        //debugger
        let url = `Property/PropertyManager/${PropertyId}`
        return srv.get(url);
    }
}
export default DataProvider;