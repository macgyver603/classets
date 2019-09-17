'use strict';

const { Fetcher } = require('@terascope/job-components');
const { DataEntity } = require('@terascope/utils');
const nanoid = require('nanoid/async/generate');
const Promise = require('bluebird');

class DmFetcher extends Fetcher {
    constructor(context, opConfig, executionConfig) {
        super(context, opConfig, executionConfig);

        this._initialized = false;
        this._shutdown = false;
        this._idChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }

    async initialize() {
        this._initialized = true;
        return super.initialize();
    }

    async shutdown() {
        this._shutdown = true;
        return super.shutdown();
    }

    // Quick 'n dirty way to swap out various variable names
    switchName(name) {
        const nameChanges = {
            id: 'Project ID',
            cost: 'Project Cost',
            savings: 'Project Savings',
            location: 'Location',
            funding_agency: 'Funding Agency',
            funding_agencies: 'funding_agency',
            locations: 'location',
            subsystems: 'subsystem',
        };
        return nameChanges[name];
    }

    async fetch(slice) {
        // TODO: Will likely need to introduce a price delta
        // Assume only one worker with the capacity to complete a single slice..
        const chunk = Array(slice.size);
        // console.log(slice)
        return Promise.map(chunk, async () => {
            // Get base cost and savings factor and make sure they are both at least `1`. These will
            // be scaled by the fact biasing later
            const baseCost = 1 + Math.floor((this.opConfig.cost_max - 1) * Math.random());
            const baseSavFactor = 1 + Math.floor(
                (this.opConfig.savings_factor_max - 1) * Math.random()
            );

            const record = {};
            // Generate the Project ID first
            record.id = await nanoid(this._idChar, this.opConfig.uuid_length);

            // Determine whether or not to bias dimensions. This needs to be done first since either
            // fact can be double biased
            if (Math.random() < slice.biasingProb) {
                // sort to assure uniformity across records
                const biasingDims = Object.keys(slice.randomization.biasingDims).sort();
                const biasingDim = biasingDims[Math.floor(Math.random() * biasingDims.length)];
                const biasedDimEl = Math.floor(
                    Math.random() * slice.randomization.biasingDims[biasingDim].length
                );
                const biasedDim = slice.randomization.biasingDims[biasingDim][biasedDimEl];
                record[this.switchName(this.opConfig.biasing.biased_dimension)] = biasedDim;
                record[this.switchName(this.opConfig.biasing.biasing_dimension)] = biasingDim;
                // Finally, pick a random entry for the third dimension
                const { standaloneDim } = slice.randomization;
                record[this.switchName(standaloneDim)] = this.opConfig[standaloneDim][
                    Math.floor(Math.random() * this.opConfig[standaloneDim].length)
                ];
            } else {
                // Just pick all three dimensions randomly
                record.location = this.opConfig.locations[
                    Math.floor(Math.random() * this.opConfig.locations.length)
                ];
                record.funding_agency = this.opConfig.funding_agencies[
                    Math.floor(Math.random() * this.opConfig.funding_agencies.length)
                ];
                record.subsystem = this.opConfig.subsystems[
                    Math.floor(Math.random() * this.opConfig.subsystems.length)
                ];
            }
            // console.log('\n\n', record, '\n\n')

            // Get and bias a project cost. Math.floor() for clean numbers
            const costBiasDim = this.opConfig.biasing.fact_biasing.cost;
            record.cost = Math.floor(
                1 + (baseCost * slice.randomization.costs[record[this.switchName(costBiasDim)]])
            );

            // Get and bias a project savings. Math.floor() for clean numbers
            const costSavDim = this.opConfig.biasing.fact_biasing.savings;
            record.savings = Math.floor(
                record.cost + (record.cost * (baseSavFactor - 1) * (slice.randomization.savings[
                    record[this.switchName(costSavDim)]]))
            );

            if (this.opConfig.formatted_field_names) {
                const formattedRecord = {};
                formattedRecord['Project ID'] = record.id;
                formattedRecord['Project Cost'] = record.cost;
                formattedRecord['Project Savings'] = record.savings;
                formattedRecord.Location = record.location;
                formattedRecord['Funding Agency'] = record.funding_agency;
                formattedRecord.Subsystem = record.subsystem;
                return DataEntity.fromBuffer(
                    JSON.stringify(formattedRecord),
                    this.opConfig
                );
            }

            // Use DataEntities
            return DataEntity.fromBuffer(
                JSON.stringify(record),
                this.opConfig
            );
        });
    }
}

module.exports = DmFetcher;
