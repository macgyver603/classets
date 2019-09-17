'use strict';

const { ConvictSchema } = require('@terascope/job-components');

class Schema extends ConvictSchema {
    build() {
        return {
            size: {
                doc: 'Dataset size',
                default: 1000,
                format(val) {
                    if (isNaN(val)) {
                        throw new Error('Dataset size must be a number!!');
                    } else if (val < 1) {
                        throw new Error('Dataset must include at least one project!!');
                    }
                }
            },
            cost_max: {
                doc: 'Max project cost in $1k USD. Must be between 1 and 1000 inclusive.',
                default: 1,
                format(val) {
                    if (isNaN(val)) {
                        throw new Error('Cost must be a number!!');
                    } else if (val < 1) {
                        throw new Error('Cost max must be equal to or greater than $1k!!');
                    } else if (val > 1000) {
                        throw new Error('Cost max must be equal to or less than $1000k!!');
                    }
                }
            },
            savings_factor_max: {
                doc: 'Maximum launch savings scaled with `Math.floor()`',
                default: 0,
                format(val) {
                    if (isNaN(val)) {
                        throw new Error('Savings factor must be a number!!');
                    } else if (val < 0) {
                        throw new Error('Savings factor must be equal to or greater than 0! All R&D at least breaks even at our company!!');
                    }
                }
            },
            uuid_length: {
                doc: 'Determins length of the project uuid. Duplicates should be considered as `project updates`!!',
                default: 7,
                format: Number
            },
            locations: {
                doc: 'List of states (two-letter format) with facility locations. Avoid invalid entires since they will break your dataset!!',
                default: ['AZ', 'CA', 'WA', 'FL'],
                format: Array
            },
            funding_agencies: {
                doc: 'Array of funding agencies/organizations. Could be anyone.',
                default: ['NASA', 'DoD', 'PETA'],
                format: Array
            },
            subsystems: {
                doc: 'For the basics, defaults to "propulsion", "avionics", and "comms", but could be extended to any possible or imaginary subsystem!!',
                default: ['propulsion', 'avionics', 'comms'],
                format: Array
            },
            formatted_field_names: {
                doc: 'Determines whether or not to lowercase the field names and replace spaces with `_`',
                default: false,
                format: Boolean
            }
            /* ,
            biasing: {
                doc: 'Biasing structure for building trends into the dataset.',
                default: null,
                format(val) {
                    if (!val) {
                        throw new Error('Must include biasing!!');
                    }
                    if (!Object(val)) {
                        throw new Error('biasing structure must be an object!!');
                    }
                }
            } */
        };
    }
}

module.exports = Schema;
