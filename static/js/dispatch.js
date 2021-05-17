/**
 * This class will be a respresentation of a dispatch made by a 
 * dispatcher
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date May 16 2021
 */

class Dispatch {

    /**
     * This is the constructor of the Dispatch class
     * @param {Operators} ops Array containing Operator Objects 
     * @param dumpLocation location load will be dumped
     * @param loadLocation loaction where truck will be loaded
     * @param contractor who the job is for 
     * @param notes notes for the whole job. Eg: Call me after first load. 
     */
    constructor(ops, dumpLocation, loadLocation, contractor, notes) {
        this.operators = ops;
        this.dumpLoc = dumpLocation;
        this.loadLoc = loadLocation;
        this.builder = contractor;
        this.ntes = notes;
    }

    /**
     * Gets the operators assigned to this dispatch 
     * @return A list of operators assigned to this job.  
     */
    get ops() {
        return this.operators;
    }

    /**
     * Gets the Dump Location of this dispatch. 
     * @return Addres of the Dump Location
     */
    get dumpLocation() {
        return this.dumpLoc;
    }

    /**
     * Gets the Load Location of this dispatch.
     * @return Address of the Load Location
     */
    get loadLocation() {
        return this.loadLoc;
    }

    /**
     * Gets the Contractor of this dispatch. 
     * @return dispatch contractor
     */
    get contractor() {
        return this.builder;
    }

    /**
     * Gets the notes assigned to this dispatch 
     * @return Notes assigned to this dispatch
     */
    get notes() {
        return this.ntes;
    }
}