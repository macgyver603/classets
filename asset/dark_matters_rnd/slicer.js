'use strict';

const { Slicer } = require('@terascope/job-components');

class DmSlicer extends Slicer {
    constructor(context, opConfig, executionConfig) {
        super(context, opConfig, executionConfig);
        this._doneSlicing = false;
        this.randomization = {
            biasingDims: {},
            costs: {},
            savings: {},
            standaloneDim: ''
        };
        // Pull this out of the opConfig to make shorten the reference in the fetcher
        this.biasingProb = this.opConfig.biasing.biasing_probability;
    }

    // initialize() {
    // }

    getRandomizations() {
        // Start with the biasing/biased dimension relations
        // shorten the names for readability
        const biasingDim = this.opConfig.biasing.biasing_dimension;
        const biasedDim = this.opConfig.biasing.biased_dimension;
        const biasingDimLength = this.opConfig[biasingDim].length;
        this.opConfig[biasedDim].forEach((dimension) => {
            // console.log(`assigning ${dimension}`)
            // Assign to a random biasing dimension. There is a chance certain biasing dimensions
            // will not be present in this list
            const targetDim = this.opConfig[biasingDim][
                Math.floor(Math.random() * biasingDimLength)
            ];
            // console.log(`target dimension is ${targetDim}`)
            // Initialize for first cases
            if (!this.randomization.biasingDims[targetDim]) {
                this.randomization.biasingDims[targetDim] = [];
            }
            this.randomization.biasingDims[targetDim].push(dimension);
        });

        // Assign random cost variation to the `cost` fact biasing dimensions. This will basically
        //
        const costDim = this.opConfig.biasing.fact_biasing.cost;
        this.opConfig[costDim].forEach((dimension) => {
            this.randomization.costs[dimension] = Math.random();
        });

        // Assign random savings variation to the `savings` fact biasing dimensions
        const savDim = this.opConfig.biasing.fact_biasing.savings;
        this.opConfig[savDim].forEach((dimension) => {
            // Round to a whole number for cleaner numbers
            this.randomization.savings[dimension] = Math.random();
        });

        // Figure out which dimension isn't one of the biasing or biased dimensions. Again, assumes
        // biasing parameter is formatted correctly
        const dimensions = ['locations', 'subsystems', 'funding_agencies'];
        dimensions.forEach((dim) => {
            if (dim !== biasingDim && dim !== biasedDim) {
                this.randomization.standaloneDim = dim;
            }
        });
    }

    async slice() {
        // Assumes we only want a single slice
        if (!this._doneSlicing) {
            // This will definitely need to be moved to `this.initialize()` to support multiple
            // slices
            this.getRandomizations();
            this._doneSlicing = true;
            return {
                size: this.opConfig.size,
                randomization: this.randomization,
                biasingProb: this.biasingProb
            };
        }
        return null;
    }
}

module.exports = DmSlicer;
