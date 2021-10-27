const Ticket = require("../Ticket");

class BillTicket extends Ticket {
    #type;
    constructor(args) {
        super(args);
        this.startTime = args.startTime;
        this.startTime = args.stopTime;
    }
}

class MaterialTicket extends BillTicket {
    constructor(args) {
        super(args);
        this.loadLocation = args.loadLocation;
        this.dumpLocation = args.dumpLocation;
        this.material = args.material;
    }
}

class HourlyTicket extends BillTicket {
    constructor(args) {
        super(arga);
        this.totalHours = args.totalHours;
        this.#type = "hourly";
    }
}

class StandbyTicket extends BillTicket {
    constructor(args) {
        super(args);
        this.totalHours = args.totalHours;
        this.#type = "standby";
    }
}

class TonnageTicket extends MaterialTicket {
    constructor(args) {
        super(args);
        this.#type = "tonnage";
        this.tonnage = args.tonnage;
    }
}

class LoadTicket extends MaterialTicket {
    constructor(args) {
        super(args);
        this.#type = "load";
    }
}
