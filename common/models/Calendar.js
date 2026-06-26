export class Calendar {
    constructor({ serviceId, monday, tuesday, wednesday, thursday, friday, saturday, sunday, startDate, endDate }) {
        this.serviceId = serviceId;
        this.monday = monday;
        this.tuesday = tuesday;
        this.wednesday = wednesday;
        this.thursday = thursday;
        this.friday = friday;
        this.saturday = saturday;
        this.sunday = sunday;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    static fromJson(json) {
        return new Calendar({
            serviceId: json.serviceId ?? json.service_id,
            monday: json.monday ?? json.monday,
            tuesday: json.tuesday ?? json.tuesday,
            wednesday: json.wednesday ?? json.wednesday,
            thursday: json.thursday ?? json.thursday,
            friday: json.friday ?? json.friday,
            saturday: json.saturday ?? json.saturday,
            sunday: json.sunday ?? json.sunday,
            startDate: json.startDate ?? json.start_date,
            endDate: json.endDate ?? json.end_date
        });
    }

    toJson() {
        return {
            serviceId: this.serviceId,
            monday: this.monday,
            tuesday: this.tuesday,
            wednesday: this.wednesday,
            thursday: this.thursday,
            friday: this.friday,
            saturday: this.saturday,
            sunday: this.sunday,
            startDate: this.startDate,
            endDate: this.endDate
        };
    }
}