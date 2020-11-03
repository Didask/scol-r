import { scormVersions } from '.'

export class Sco {
  scoID: string
  scoTitle: string
  author: string
  learningTime: number
  resources: string[]

  constructor(scoID: string, scoTitle: string, author: string, learningTime: number, resources?: string[]) {
    this.scoID = scoID
    this.scoTitle = scoTitle
    this.author = author
    this.learningTime = learningTime
    this.resources = resources || []
  }
}

const formatLearningTime = (learningTime: number) => {
  const intHours = Math.floor(learningTime/60)
  const hours = intHours > 10 ? intHours : `0${intHours}`
  const intMinutes = intHours > 0 ? learningTime - intHours * 60 : learningTime
  const minutes = intMinutes > 10 ? intMinutes : `0${intMinutes}`
  return `${hours}:${minutes}:00`
}

export interface ManifestGeneratorProps {
  courseId: string;
  courseTitle: string;
  courseAuthor: string;
  scoList?: Sco[];
  sharedResources?: string[];
  totalLearningTime?: number;
  dataFromLms?: string;
  scormVersion?: typeof scormVersions[number];
}


export function ManifestGenerator(props: ManifestGeneratorProps) {
  const { 
    courseId, courseTitle, courseAuthor, 
    scoList = [], sharedResources = [], 
    totalLearningTime = 0, dataFromLms,
    scormVersion = '1.2'
  } = props
  const courseGlobalLearningTime = scoList.length ? scoList.reduce((acc, sco) => acc + sco.learningTime, 0) : totalLearningTime

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <manifest xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" identifier="${courseId}" version="1.0" xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
      <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>${scormVersion}</schemaversion>
        <imsmd:lom xmlns="http://ltsc.ieee.org/xsd/LOM">
          <imsmd:general>
            <imsmd:identifier>${courseId}</imsmd:identifier>
          </imsmd:general>
          <imsmd:lifecycle>
            <imsmd:contribute>
              <imsmd:role>
                <imsmd:source>
                  <imsmd:langstring xml:lang="fr">LOMv1.0</imsmd:langstring>
                </imsmd:source>
                <imsmd:value>
                  <imsmd:langstring xml:lang="fr">Author</imsmd:langstring>
                </imsmd:value>
              </imsmd:role>
              <imsmd:centity>
                <imsmd:vcard>
                  begin:vcard
                  fn:${courseAuthor}
                  end:vcard
                </imsmd:vcard>
              </imsmd:centity>
            </imsmd:contribute>
          </imsmd:lifecycle>
          <imsmd:educational>
            <imsmd:typicallearningtime>
              <imsmd:datetime>${formatLearningTime(courseGlobalLearningTime)}</imsmd:datetime>
            </imsmd:typicallearningtime>
          </imsmd:educational>
        </imsmd:lom>
      </metadata>
      <organizations default="Org1">
        <organization identifier="Org1">
          <title>${courseTitle}</title>
          ${scoList.map(sco => {
            return (
              `<item identifier="item_${sco.scoID}" identifierref="resource_${sco.scoID}" isvisible="true">
                <title>${sco.scoTitle}</title>
                <adlcp:dataFromLMS>${dataFromLms ?? (courseId + ':' + sco.scoID)}</adlcp:dataFromLMS>
                <metadata>
                  <imsmd:lom xmlns="http://ltsc.ieee.org/xsd/LOM">
                    <imsmd:general>
                    <imsmd:identifier>${sco.scoID}</imsmd:identifier>
                    </imsmd:general>
                    <imsmd:lifecycle>
                    <imsmd:contribute>
                      <imsmd:role>
                      <imsmd:source>
                        <imsmd:langstring xml:lang="fr">LOMv1.0</imsmd:langstring>
                      </imsmd:source>
                      <imsmd:value>
                        <imsmd:langstring xml:lang="fr">Author</imsmd:langstring>
                      </imsmd:value>
                      </imsmd:role>
                      <imsmd:centity>
                        <imsmd:vcard>
                          begin:vcard
                          fn:${sco.author}
                          end:vcard
                        </imsmd:vcard>
                      </imsmd:centity>
                    </imsmd:contribute>
                    </imsmd:lifecycle>
                    <imsmd:educational>
                    <imsmd:typicallearningtime>
                      <imsmd:datetime>${formatLearningTime(sco.learningTime)}</imsmd:datetime>
                    </imsmd:typicallearningtime>
                    </imsmd:educational>
                  </imsmd:lom>
                </metadata>
              </item>`
            )
          }).join('\n')}
        </organization>
      </organizations>
      <resources>
      ${sharedResources?.length ? (
          `<resource adlcp:scormtype="asset" type="webcontent" identifier="shared_resources">
            ${sharedResources.map(resource => {
              return `<file href="${resource}"/>`
            }).join('\n')}
          </resource>`
        ) : ''
      }
      ${scoList.map(sco => {
        return (
          `<resource adlcp:scormtype="sco" type="webcontent" identifier="resource_${sco.scoID}" href="./${sco.scoID}/index.html">
            ${sharedResources?.length ? '<dependency identifierref="shared_resources"/>' : ''}
            ${sco.resources.map(resource => {
              return `<file href="${resource}"/>`
            }).join('\n')}
          </resource>`
        )
      }).join('\n')}
      </resources>
    </manifest>`
  )
}
