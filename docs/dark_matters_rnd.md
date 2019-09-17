# Dark Matters R&D Info

**Only supports `once` jobs right now**

This datagen processor will generate information about this fictional company's R&D projects. Specifically created for the CIS 405 team project, it will generate BI records with 2 key facts and 3 key dimensions (technically 4 if you include the `project_uuid`). Each record represents a specific R&D project (assuming a unique uuid in the dataset), and will contain the following information:  

- `project_uuid`: Project ID. Will be determined randomly to differentiate project records and is limited to alphanumericals for compatibility with Excel.  
- `project_cost` (fact 1): Overall cost (in $1k's) of the R&D project including labor, materials, production, etc.  
- `savings` (fact 2): Overall reduction of manufacturing, maintenance, and operational expenses for our next 100 launches in $1k's  
- `location` (dimension 1): Facility location for the R&D project by US state (This generator assumes you provided a valid array of two-digit state names and will break if not...)  
- `funding_agency` (dimension 2): Agency/organization funding the R&D project  
- `subsystem` (dimension 3): List of subsystems the R&D projects will span  

# Options

## `size`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Any number your computer can handle | `1000` | N |  

Overall size of the dataset since this only supports `once` jobs. Minimum record count for the class is 50, but 500-1k should likely be enough to get meaningful trends in the data.

## `cost_max`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Any number equal to or greater than 1 | `1` | N |  

Maximum R&D project cost in $1k.

## `savings_factor_max`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Any number equal to or greater than 1 | `1` | N |  

Cost savings factor (including manufacturing, maintenance, and operational expenses) for the next 100 launches as a direct result of the particular R&D project. Will be multiplied the `cost_max` parameter, so this should probably be something less than 10 or so (10 would be a 10x saving for a given project cost)

## `uuid_length`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Any positive number | `7` | N |  

This will be passed through `Math.floor()` to determine the project uuid length


## `locations`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Array of state abbreviations | `['AZ', 'CA', 'WA', 'FL']` | N |  

Array of facility locations by state in two-letter format. There's no filtering  right now, so invalid state abbreviations WILL RESULT IN A BROKEN DATASET.


## `funding_agencies`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Any array | `['NASA', 'DoD', 'DoE']` | N |  

This is a free market, so any array of entities/organizations will be allowed. Must include at least one funding source since money does not randomly appear for projects.


## `subsystems`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Any array | `['propulsion', 'avionics', 'comms']` | N |  

Pretty much just a list of rocket subsystems or subcomponents.


## `formatted_field_names`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Boolean | `false` | N |  

Determines whether or not to lowercase the field names and replace spaces with `_`


## `biasing`

| Valid Options | Default | Required |
| ----------- | ------- | -------- |
| Object describing biasing relations | '' | Y |  

This isn't filtered right now, so invalid configs will result in broken jobs. With the following example, a funding agency will be randomly selected and used to alter the probability of selecting different locations. (`biasing_probability` influences the likeliness of dimension biasing, so a `0` means there will be no dimension biasing, and a `1` means that there will always be dimension biasing.) After randomly generating a project cost and project savings, the location will be used to either increase or decrease the cost, and the subsystem will be used to increase or decrease the savings.  

```
{
    "biasing_dimension": "funding_agencies",
    "biased_dimension": "locations",
    "biasing_probability": .5,
    "fact_biasing": {
        "cost": "locations",
        "savings": "subsystems"
    }
}
```

# Sample Job

```
{
  "name": "Dark Matters RnD Generator",
  "lifecycle": "once",
  "workers": 1,
  "operations": [
    {
      "_op": "dark_matters_rnd",
      "size": 10000,
      "cost_max": 500,
      "savings_factor_max": 6,
      "locations": ["AZ", "CA", "WA", "FL", "MI", "TX", "NV", "NM"]
      "funding_agencies": ["ASU", "UofA", "DoD", "Internal", "DoA", "UAE", "NASA", "JAXA"]
      "subsystems": ["propulsion", "avionics", "comms", "mission ops", "stage separation", "payload", "fuel tanks", "recovery"],
      "biasing": {
          "biasing_dimension": "funding_agencies",
          "biased_dimension": "locations",
          "biasing_probability": .5,
          "fact_biasing": {
              "cost": "locations",
              "savings": "subsystems"
          }
      }
    },
    {
      "_op": "stdout"
    }
  ],
  "assets": [
      "classets"
  ]
}
```

# Sample Record

Paired with the [`file`-assets](https://github.com/terascope/file-assets), this processor could be used to generate a CSV dataset.

```
{
    "Project ID": "5a414a2"
    "Project Cost": 385,
    "Project Savings": 1925,
    "Location": "AZ",
    "Funding Agency": "ASU",
    "Subsystem": "propulsion"
}
```
