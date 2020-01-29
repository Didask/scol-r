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

export interface ManifestGeneratorProps {
  courseId: string;
  courseTitle: string;
  courseAuthor: string;
  scoList?: Sco[];
  sharedResources?: string[];
  totalLearningTime?: number;
  dataFromLms?: string;
}


export default function ManifestGenerator(props: ManifestGeneratorProps) {
  const { 
    courseId, courseTitle, courseAuthor, 
    scoList = [], sharedResources = [], 
    totalLearningTime = 0, dataFromLms
  } = props
  
  const courseGlobalLearningTime = scoList.length ? scoList.reduce((acc, sco) => acc + sco.learningTime, 0) : totalLearningTime
  let manifest = require('../static/imsmanifest').default as string
  manifest = manifest.replace(/\[\[course-identifier\]\]/g, courseId)
  manifest = manifest.replace(/\[\[course-title\]\]/g, courseTitle)
  manifest = manifest.replace(/\[\[course-author\]\]/g, courseAuthor)
  manifest = manifest.replace(/\[\[course-global-learning-time\]\]/g, formatLearningTime(courseGlobalLearningTime))
  
  if (!scoList.length) {
    manifest = manifest.replace(/\[\[sco-identifier\]\]/g, courseId)
    manifest = manifest.replace(/\[\[sco-title\]\]/g, courseTitle)
    manifest = manifest.replace(/\[\[sco-author\]\]/g, courseAuthor)
    manifest = manifest.replace(/\[\[data-from-lms\]\]/g,  dataFromLms ? dataFromLms : courseId)
    manifest = manifest.replace(/\[\[sco-typical-learning-time\]\]/g, formatLearningTime(courseGlobalLearningTime))

    return manifest
  }
  
  parseString(manifest, (err, data) => {
    if (err) console.error(err)

    const resourceTemplate = JSON.stringify(data.manifest.resources[0].resource[0])
    data.manifest.resources[0].resource = []

    const itemTemplate = JSON.stringify(data.manifest.organizations[0].organization[0].item[0])
    data.manifest.organizations[0].organization[0].item = []

    let scoResource, scoItem
    scoList.forEach((sco) => {
      scoResource = resourceTemplate.replace(/\[\[sco-identifier\]\]/g, sco.scoID)
      scoResource = scoResource.replace(/\[\[data-from-lms\]\]/g,  dataFromLms ? dataFromLms : (courseId + ':' + sco.scoID))
      scoResource = JSON.parse(scoResource)
      sharedResources.forEach( resStr => scoResource.file.push( { '$': { href: resStr } }) )
      data.manifest.resources[0].resource.push(scoResource)

      scoItem = itemTemplate.replace(/\[\[sco-identifier\]\]/g, sco.scoID)
      scoItem = scoItem.replace(/\[\[sco-title\]\]/g, sco.scoTitle)
      scoItem = scoItem.replace(/\[\[sco-author\]\]/g, sco.author)
      scoItem = scoItem.replace(/\[\[sco-typical-learning-time\]\]/g, formatLearningTime(sco.learningTime))
      data.manifest.organizations[0].organization[0].item.push(JSON.parse(scoItem))
    })

    manifest = new Builder().buildObject(data)
  })

  return manifest.trim()
}