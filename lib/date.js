const datefns = {
  format: require('date-fns/format'),
  parse: require('date-fns/parse')
}

const format = 'MM/dd/yyyy'

const parseDate = (date) => {
  const format = 'MM/dd/yyyy'
  return datefns.parse(date, format, new Date())
}

const formatDate = (date) => {
  const format = 'MM/dd/yyyy'
  return datefns.format(date, format)
}

module.exports = {parseDate, formatDate}
