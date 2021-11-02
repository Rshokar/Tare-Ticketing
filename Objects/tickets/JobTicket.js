const Ticket = require("../tickets/Ticket");
const Job = require("../../models/job");

class JobTicket extends Ticket {
    constructor(args) {
        let EMPTY_STRING = '';
        super(args);
        this.contractor = args.contractor == EMPTY_STRING ? undefined : args.contractor;
        this.startLocation = args.startLocation == EMPTY_STRING ? undefined : args.startLocation;
        this.finishLocation = args.dumpLocation == EMPTY_STRING ? undefined : args.dumpLocation;
        this.material = args.material == EMPTY_STRING ? undefined : args.material;
        this.supplier = args.supplier == EMPTY_STRING ? undefined : args.supplier;
        this.reciever = args.reciever == EMPTY_STRING ? undefined : args.reciever;
        this.rates = args.rates;
        this.status = args.status;
        this.dispatchId = args.dispatchId;
        this.billingTickets = args.billingTickets;
        this.equipment = args.equipment;
        this.startTime = args.startTime;
        this.finishTime = args.finishTime;
    }

    saveTicket() {
        return new Promise((res, rej) => {
            let job = this.#newJobModel();
            job.save()
                .then(() => {
                    res(job._id);
                })
                .catch(e => {
                    console.log(e);
                    rej(e);
                })
        })
    }

    #newJobModel() {
        return new Job({
            dispatchId: this.dispatchId,
            operator: this.userId,
            data: this.date,
            startTime: this.startTime,
            finishTime: this.finishTime,
            startLocation: this.startLocation,
            finishLocation: this.finishLocation,
            contractor: this.contractor,
            equipment: this.equipment,
            material: this.material,
            supplier: this.supplier,
            reciever: this.reciever,
            billingTickets: this.billingTickets,
            rates: this.rates,
            status: this.status
        })
    }

    static deleteAllJobs() {
        return new Promise(async res => {
            Job.deleteMany({}, function (err) {
                if (err) {
                    rej(new Error("Error deleting many job tickets"));
                }
                console.log('Deleted All job tickets');
                res();
            })
        })
    }

    static getNonCompleteJobTickets(userId) {
        return new Promise((res, rej) => {
            Job.find({
                $and: [{
                        operator: userId
                    },
                    // { $or: [{ status: "sent" }, { status: "confirmed" }, { status: "active" }] }
                ]
            }).then((jobs) => {
                if (jobs) {
                    res(jobs);
                } else {
                    rej();
                }
            })
        })
    }
}

module.exports = JobTicket;