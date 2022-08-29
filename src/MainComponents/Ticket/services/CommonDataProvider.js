import ServiceProvider from "./ServiceProvider";


class CommonDataProvider {

    // Ravindra May 08 2020
    // To Send Mail for Missing Information
    geto1TicketPastDue() {
        let url = "api/Ticket/TicketPastDue";
        let data = new ServiceProvider().get(url);
        return data;
    }
    geto1NewTicketsToday() {
        let url = "api/Ticket/NewTicketsToday";
        let data = new ServiceProvider().get(url);
        return data;
    }
    geto1TicketsClosedToday() {
        let url = "api/Ticket/TicketClosedToday";
        let data = new ServiceProvider().get(url);
        return data;
    }
    geto2TicketPastDue() {
        let url = "api/Ticket/TicketPastDue";
        let data = new ServiceProvider().get(url);
        return data;
    }
    geto2NewTicketsToday() {
        let url = "api/Ticket/NewTicketsToday";
        let data = new ServiceProvider().get(url);
        return data;
    }
    geto2TicketsClosedToday() {
        let url = "api/Ticket/TicketClosedToday";
        let data = new ServiceProvider().get(url);
        return data;
    }
    getTicketDueTimes() {
        let url = "api/Ticket/TicketDueTimes";
        let data = new ServiceProvider().get(url);
        return data;
    }
    getOpenTickets() {
        let url = "api/Ticket/TicketPriority";
        let data = new ServiceProvider().get(url);
        return data;
    }
    getTickeSourceWise() {
        let url = "api/Ticket/TickeSourceWise";
        let data = new ServiceProvider().get(url);
        return data;
    }
    getTotalTicketCT() {
        let url = "api/Ticket/TickeTotalNClose";
        let data = new ServiceProvider().get(url);
        return data;
    }
}
export default CommonDataProvider;