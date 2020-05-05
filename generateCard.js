const fs = require('fs');
const Date = require('./lib/date')
const datefns = {
  format: require('date-fns/format'),
  parse: require('date-fns/parse'),
  differenceInBusinessDays: require('date-fns/differenceInBusinessDays'),
  addBusinessDays: require('date-fns/addBusinessDays')
}

const jsonToFile = (json, destPath) => {
  const prettyText = JSON.stringify(json, null, 2)

  fs.writeFileSync(destPath, prettyText)

  return true
}

const generateCard = (dateStart, dateEnd, fileDest)  => {
  const pStart = Date.parseDate(dateStart)
  const pEnd = Date.parseDate(dateEnd)
  const numDays = datefns.differenceInBusinessDays(pEnd, pStart)

  console.log('days: ', numDays)

  const card = []

  for (let index = 0; index <= numDays; index++) {
    const entryDate = datefns.addBusinessDays(pStart, index) 
    const entry = {
      project: 'PROJECT',
      date: Date.formatDate(entryDate),
      category: 'CATEGORY',
      hours: 'HOURS'
    }
    card.push(entry)
  }

  jsonToFile(card, fileDest)

  return true
}

const [_cmd, _script, ...args] = process.argv
const start = args[0]
const end = args[1]
const dest = args[2]

generateCard(start, end, dest);


