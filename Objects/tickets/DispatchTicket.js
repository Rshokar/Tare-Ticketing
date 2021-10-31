const Dispatch = require("../../models/dispatch");
const Ticket = require("../tickets/Ticket");
const ValidationErrors = require("../ValidationErrors");
const DispatcherObject = require("../users/Dispatcher");

class DispatchTicket extends Ticket {

    constructor(args) {
        const EMPTY_STRING = ''
        super(args);
        this.contractor = args.contractor == EMPTY_STRING ? undefined : args.contractor;
        this.startLocation = args.startLocation == EMPTY_STRING ? undefined : args.startLocation;
        this.dumpLocation = args.dumpLocation == EMPTY_STRING ? undefined : args.dumpLocation;
        this.notes = args.notes == EMPTY_STRING ? undefined : args.notes;
        this.material = args.material == EMPTY_STRING ? undefined : args.material;
        this.supplier = args.supplier == EMPTY_STRING ? undefined : args.supplier;
        this.reciever = args.reciever == EMPTY_STRING ? undefined : args.reciever;
        this.numTrucks = args.numTrucks;
        this.rates = args.rates;
        this.status = args.status;
    }

    async verifyTicket() {
        if (!this.contractor || !this.startLocation || !this.dumpLocation || !this.date) {
            throw new ValidationErrors.InvalidInputError("Cannot leave contractor, start location, dumplocation or date empty. ")
        }

        await DispatcherObject.isValidContractor(this.contractor, this.userId);

        if (this.numTrucks < 0) {
            throw new ValidationErrors.NumTrucksError("Number of trucks cannot be less than zero");
        }

        if (this.startLocation.length < 2) {
            throw new ValidationErrors.LoadLocationError("Load Location cannot be less than two characters long.");
        }

        if (this.dumpLocation.length < 2) {
            throw new ValidationErrors.DumpLocationError("Dump Location cannot be less than two characters long.")
        }

        if (this.reciever && this.reciever.length < 2) {
            throw new ValidationErrors.RecieverError("Reciever cannot be less than two characters long.")
        }

        if (this.supplier && this.supplier.length < 2) {
            throw new ValidationErrors.SupplierError("Reciever cannot be less than two characters long.")
        }

        if (this.material && this.material.length < 2) {
            throw new ValidationErrors.MaterialError("Reciever cannot be less than two characters long.")
        }
    }

    async saveTicket() {
        return new Promise((res, rej) => {
            let dispatch = this.#getTicketModel();
            dispatch.save()
                .then(() => {
                    this.id = dispatch._id;
                    res(dispatch._id)
                })
                .catch(e => {
                    console.log(e);
                    rej(e);
                })
        })
    }

    #getTicketModel() {
        return new Dispatch({
            date: this.date,
            dumpLocation: this.dumpLocation,
            startLocation: this.startLocation,
            contractor: this.contractor,
            numTrucks: this.numTrucks,
            notes: this.notes,
            material: this.material,
            supplier: this.supplier,
            reciever: this.reciever,
            dispatcher: this.userId,
        })
    }

    static getNonCompleteDispatches(userId) {
        return new Promise((res, rej) => {
            Dispatch.find({
                $and: [{ dispatcher: userId },
                    // {
                    //     $or: [
                    //         { "status.empty": { $gt: 0 } },
                    //         { "status.sent": { $gt: 0 } },
                    //         { "status.active": { $gt: 0 } },
                    //         { "status.confirmed": { $gt: 0 } }]

                    // }
                ]
            }).then(dispatches => {
                if (dispatches) {
                    res(dispatches);
                } else {
                    rej();
                }
            })
        })
    }
}

module.exports = DispatchTicket;
