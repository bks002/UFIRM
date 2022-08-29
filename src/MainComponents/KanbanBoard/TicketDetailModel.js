export default class TicketDetailModel {
    priority = 0;
    visisbilty = '';
    ticketstatus = 0;
    category = null;
    assignee = null;
    isHoldTicket = 0;
    isReopenTicket = 0;
    complainById = 0;
    complainLocation = null;
    ticketstatusColor = '';

    constructor() {
        this.priority = 0;
        this.visisbilty = '';
        this.ticketstatus = 0;
        this.category = null;
        this.assignee = null;
        this.isHoldTicket = 0;
        this.isReopenTicket = 0;
        this.complainById = 0;
        this.complainLocation = null;
        this.ticketstatusColor = '';
    }

    setPriority(priority) {
        this.priority = priority;
    }
    setVisisbilty(visisbilty) {
        this.visisbilty = visisbilty;
    }
    setTicketStatus(ticketstatus) {
        this.ticketstatus = ticketstatus;
    }
    setCategory(category) {
        this.category = category;
    }
    setStaff(assignee) {
        this.assignee = assignee;
    }
    setHold(isHoldTicket) {
        this.isHoldTicket = isHoldTicket;
    }
    setReopen(isReopenTicket) {
        this.isReopenTicket = isReopenTicket;
    }
    setComplainBy(complainById) {
        this.complainById = complainById;
    }
    setComplainLocation(complainLocation) {
        this.complainLocation = complainLocation;
    }

    setTicketstatusColor(ticketstatusColor) {
        this.ticketstatusColor = ticketstatusColor;
    }
}