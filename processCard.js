// usage:
// timecard <json file path>
// ex: REVTIME_USERID=1 REVTIME_APITOKEN=token timecard $HOME/time.json

// lifted from https://www.consolelog.io/group-by-in-javascript/
Array.prototype.groupBy = function (prop) {
  return this.reduce(function (groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}

const Date = require('./lib/date')
const util = require('util')
const { execSync } = require('child_process')
const fetch = require('node-fetch')
const datefns = {
  parse: require('date-fns/parse'),
  add: require('date-fns/add')
}

const args = process.argv.slice(2)
const punches = require(args[0])
const userId = process.env.REVTIME_USERID
const apiToken = process.env.REVTIME_APITOKEN
const baseUrl = 'https://time.revelry.co/api/v1/'
const authHeaders = { authorization: `Bearer ${apiToken}` }

let cache = {}

const getAll = async (path) => {
  if (cache[path]) {
    return cache[path]
  }

  // init totalPages to 1 since we'll always request at least 1 page. we will
  // update it with the real value after we get the total number of pages from the
  // from the first request.
  let totalPages = 1
  let pagesRecieved = 0
  let entries = []

  while (pagesRecieved < totalPages) {
    const page = pagesRecieved + 1
    const url = baseUrl + path + '?page=' + page
    const headers = {...authHeaders}
    const response = await fetch(url, {headers})
    const json = await response.json()

    entries = entries.concat(json.entries)
    totalPages = json.total_pages
    pagesRecieved = pagesRecieved + 1
  }

  cache[path] = entries

  return cache[path]
}

const getCategoryId = async (name) => {
  const categories = await getAll('categories')
  const categoryId = categories.find(cat => cat.name === name).id

  if (categoryId === undefined) {
    throw `category not found: ${name}`
  }

  return categoryId
}

const getProjectId = async (name) => {
  const projects = await getAll('projects')

  const project = projects.find(p => p.name === name)

  if (project === undefined) {
    throw `project not found: ${name}`
  }

  return project.id
}

const postTime = async (punch) => {
  const { project, date, hours, category } = punch
  const projectId = await getProjectId(project)
  const categoryId = await getCategoryId(category)
  const startTime = Date.parseDate(date)
  const endTime = datefns.add(startTime, {minutes: parseFloat(hours) * 60})
  const url = baseUrl + 'time'
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
  }
  const body = JSON.stringify({
    category_id: categoryId,
    project_id: projectId,
    start_time: startTime,
    end_time: endTime
  })
  const resp = await fetch(url, {method: 'POST', body, headers})

  return await resp.json()
}

const printTotals = (punches) => {
  const groups = Object.values(punches.groupBy('project'))
  const reducer = (accumulator, punch) => accumulator + parseFloat(punch.hours)

  groups.forEach(group => {
    console.log(group[0].project)
    //console.log(group)
    const total = group.reduce(reducer, 0)
    console.log(total)
  })
}

const doPunches = async (punches) => {
  for (let index = 0; index < punches.length; index++) {
    const element = punches[index];
    await postTime(element)
  }
}

printTotals(punches)
doPunches(punches)


////////

// const openTab = (punch) => {
//   const { project, date, hours, category } = punch
//   let url = `https://airtable.com/shrV4tXD46VGk42JM?prefill_Name=${user_id}&prefill_Project=${project}&prefill_Category=${category}&prefill_Date=${date}&prefill_Hours=${hours}`

//   if (punch.pairing) {
//     url = `${url}&prefill_Pairing=true`
//   }

//   execSync(`open '${url}'`)
// }
