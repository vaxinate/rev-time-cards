## Installation

Clone this repo
```
npm install
```

## Usage

From the root dir of the repo:

```
# generate a time sheet with pre-dated entries for each business day in a date range. 
$ npm run gen 02/01/2020 02/10/2020 ./destination/file.json

# process a time sheet and upload entries to rev-time 
$ export REVTIME_USERID=<your rev-time user id>
$ export REVTIME_APITOKEN=<your rev-time api token>
$ npm run proc ./path/to/timecard.json

NOTE: Date format is mm/dd/yyyy and path names should be absolute
```
