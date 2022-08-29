export default class EventDetailsModel {
    eventId = 0;
    subEventId = 0;
    categoryId = 0;
    title = "";
    type = "";
    assigneeId = 0;
    color = null;
    isAllday = false;
    notificationBefore = null;
    repeat = null;
    startDate = null;
    startTime = null;
    endDate = null;
    endTime = null;
    editorState = null;
    repeateEndBy = null;
    completedBy = 0;
    eventNumebr = '';
    isDeleteRequest = 0;
    status = '';
    constructor() {
        this.eventId = 0;
        this.categoryId = 0;
        this.title = "";
        this.type = "";
        this.assigneeId = 0;
        this.color = null;
        this.isAllday = false;
        this.notificationBefore = null;
        this.repeat = null;
        this.startDate = null;
        this.startTime = null;
        this.endDate = null;
        this.endTime = null;
        this.editorState = null;
        this.repeateEndBy = null;
        this.subEventId = 0;
        this.completedBy = 0;
        this.eventNumebr = 0;
        this.isDeleteRequest = 0;
        this.status = '';
    }

    setEventId(eventId) {
        this.eventId = eventId;
    }
    setStatusRequest(status) {
        this.status = status;
    }
    setEventNumber(eventNumebr) {
        this.eventNumebr = eventNumebr;
    }
    setSubEventId(subEventId) {
        this.subEventId = subEventId;
    }
    setIsDeleteRequest(isDeleteRequest) {
        this.isDeleteRequest = isDeleteRequest;
    }
    setCategoryId(categoryId) {
        this.categoryId = categoryId;
    }
    setTitle(title) {
        this.title = title;
    }
    setType(type) {
        this.type = type;
    }
    setAssignee(assigneeId) {
        this.assigneeId = assigneeId;
    }
    setColor(color) {
        this.color = color;
    }
    setisAllday(isAllday) {
        this.isAllday = isAllday;
    }
    setNotificationBefore(notificationBefore) {
        this.notificationBefore = notificationBefore;
    }
    setRepeat(repeat) {
        this.repeat = repeat;
    }
    setStartDate(startDate) {
        this.startDate = startDate;
    }
    setStartTime(startTime) {
        this.startTime = startTime;
    }
    setEndDate(endDate) {
        this.endDate = endDate;
    }
    setEndTime(endTime) {
        this.endTime = endTime;
    }
    setDescription(editorState) {
        this.editorState = editorState;
    }
    setRepeateEndBy(repeateEndBy) {
        this.repeateEndBy = repeateEndBy;
    }
    setCompletedBy(completedBy) {
        this.completedBy = completedBy;
    }
}