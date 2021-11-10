const Ticket = require("../tickets/Ticket");
const Job = require("../../models/job");
const ValidationErrors = require("../ValidationErrors");


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

    /**
     * Returns the valid tonnage load locations.
     * If the rates are per load or tonnage it goes through
     * the array of rates and gets the unique load locations. 
     * @returns and array of loadLocations
     */
    getPerLoadLocations() {
        let loadLoc = []
        let obj = {}
        if (this.rates.hourly) {
            loadLoc[0] = this.startLocation;
        } else {
            for (let i = 0; i < this.rates.perLoad.length; i++) {
                if (!obj[this.rates.perLoad[i].l]) {
                    obj[this.rates.perLoad[i].l] = 0;
                }
            }
            return Object.keys(keys);
        }
        return loadLoc;
    }

    /**
     * Returns the valid perLoad load locations.
     * If the rates are per load or tonnage it goes through
     * the array of rates and gets the unique load locations. 
     * @returns and array of loadLocations
     */
    getTonnageLoadLocations() {
        let loadLoc = []
        if (this.rates.hourly) {
            loadLoc[0] = this.dumpLocation;
        } else {
            for (let i = 0; i < this.rates.tonnage.length; i++) {
                if (!obj[this.rates.tonnage[i].d]) {
                    obj[this.rates.tonnage[i].d] = 0;
                }
            }
            return Object.keys(keys);
        }
        return loadLoc;
    }

    #newJobModel() {
        return new Job({
            dispatch: this.dispatchId,
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

    /**
     * @param { String } queryType dispatch or job
     * @param { String } dispatchId
     * @return { Promies } res jobs if a job tikcets are found otherwise 
     * undefined 
     */
    static getJobTicketAndOperator(id, type) {
        return new Promise((res, rej) => {
            const JOB = "job";
            const DISPATCH = "dispatch";
            if (type === DISPATCH) {
                Job.find({
                        dispatch: id
                    })
                    .populate('operator')
                    .then(jobs => {
                        if (jobs) {
                            res(jobs)
                        }
                        res(undefined)
                    })
            } else if (type === JOB) {
                Job.findOne({
                        _id: id
                    })
                    .populate('operator')
                    .then(jobs => {
                        if (jobs) {
                            res(jobs)
                        }
                        res(undefined)
                    })
            } else {
                rej(new ValidationErrors.InvalidInputError("Invalid type passed into getJobTicketAndOperator"));
            }
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

    /**
     * Geta non complete job tickets with dispatch, and dispatcher joined.
     * @param { String } userId 
     * @returns jobs if any exist, otherwise undefined
     */
    static getNonCompleteJobTicketsWithDispatch(userId) {
        return new Promise((res, rej) => {
            Job.find({
                    $and: [{
                            operator: userId
                        },
                        {
                            $or: [{
                                status: "sent"
                            }, {
                                status: "confirmed"
                            }, {
                                status: "active"
                            }]
                        }
                    ]
                })
                .populate({
                    path: 'dispatch',
                    model: "Dispatch",
                    populate: {
                        path: "dispatcher",
                        model: "User"
                    },
                })
                .then((jobs) => {
                    if (jobs) {
                        res(jobs);
                    } else {
                        rej();
                    }
                })
        })
    }

    /**
     * Gets a single job ticket with dispatch, and dispatcher joined.
     * @param { String } jobId jobId 
     * @returns jobs if any exist, otherwise undefined
     */
    static getJobTicketWithDispatch(jobId) {
        return new Promise((res, rej) => {
            Job.findOne({
                    _id: jobId
                })
                .populate({
                    path: 'dispatch',
                    model: "Dispatch",
                    populate: {
                        path: "dispatcher",
                        model: "User"
                    },
                })
                .then((jobs) => {
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