import fs from 'fs'
import path from 'path'
import { parseString, Builder } from 'xml2js'

export class Sco {
  scoID: string
  scoTitle: string
  author: string
  learningTime: number

  constructor(scoID: string, scoTitle: string, author: string, learningTime: number) {
    this.scoID = scoID
    this.scoTitle = scoTitle
    this.author = author
    this.learningTime = learningTime
  }
}

const formatLearningTime = (learningTime: number) => {
  const intHours = Math.floor(learningTime/60)
  const hours = intHours > 10 ? '' + intHours : '0' + intHours
  const minutes = intHours > 0 ? learningTime - intHours * 60 : learningTime
  return hours + ':' + (minutes > 0 ? minutes : '00') + ':00'
}


export default function ManifestGenerator(courseId: string, courseTitle: string, courseAuthor: string, scoList: Sco[]) {
  const courseGlobalLearningTime = scoList.reduce((acc, sco) => acc + sco.learningTime, 0)
  let manifest = fs.readFileSync(path.resolve(path.dirname(require.resolve('./SCORMAdapter')), '../static/imsmanifest.xml'), 'utf-8')
  manifest = manifest.replace(/\[\[course-identifier\]\]/g, courseId)
  manifest = manifest.replace(/\[\[course-title\]\]/g, courseTitle)
  manifest = manifest.replace(/\[\[course-author\]\]/g, courseAuthor)
  manifest = manifest.replace(/\[\[course-global-learning-time\]\]/g, formatLearningTime(courseGlobalLearningTime))
  
  parseString(manifest, (err, data) => {
    if (err) console.error(err)

    const resourceTemplate = JSON.stringify(data.manifest.resources[0].resource[0])
    data.manifest.resources[0].resource = []

    const itemTemplate = JSON.stringify(data.manifest.organizations[0].organization[0].item[0])
    data.manifest.organizations[0].organization[0].item = []

    let scoResource, scoItem
    scoList.forEach((sco) => {
      scoResource = resourceTemplate.replace(/\[\[sco-identifier\]\]/g, sco.scoID)
      data.manifest.resources[0].resource.push(JSON.parse(scoResource))

      scoItem = itemTemplate.replace(/\[\[sco-identifier\]\]/g, sco.scoID)
      scoItem = scoItem.replace(/\[\[sco-title\]\]/g, sco.scoTitle)
      scoItem = scoItem.replace(/\[\[sco-author\]\]/g, sco.author)
      scoItem = scoItem.replace(/\[\[sco-typical-learning-time\]\]/g, formatLearningTime(sco.learningTime))
      data.manifest.organizations[0].organization[0].item.push(JSON.parse(scoItem))
    })

    manifest = new Builder().buildObject(data)
  })

  return manifest
}