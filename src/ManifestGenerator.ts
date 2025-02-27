import { scormVersions } from ".";

export class Sco {
  scoID: string;
  scoTitle: string;
  scoHref: `./${string}`;
  author: string;
  learningTime: number;
  resources: string[];

  constructor(props: {
    scoID: string;
    scoTitle: string;
    author: string;
    learningTime: number;
    scoHref: `./${string}`;
    resources: string[];
  }) {
    this.scoID = props.scoID;
    this.scoTitle = props.scoTitle;
    this.author = props.author;
    this.learningTime = props.learningTime;
    this.resources = props.resources;
    this.scoHref = props.scoHref;
  }
}

const formatLearningTime = (learningTime: number) => {
  const intHours = Math.floor(learningTime / 60);
  const hours = intHours > 10 ? intHours : `0${intHours}`;
  const intMinutes = intHours > 0 ? learningTime - intHours * 60 : learningTime;
  const minutes = intMinutes > 10 ? intMinutes : `0${intMinutes}`;
  return `${hours}:${minutes}:00`;
};

export interface ManifestGeneratorProps {
  courseId: string;
  courseTitle: string;
  courseAuthor: string;
  scoList?: Sco[];
  sharedResources?: string[];
  totalLearningTime?: number;
  dataFromLms?: string;
  scormVersion?: (typeof scormVersions)[number];
}

const removeSpecialChars = <T extends object>(obj: T): T =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.replace(/&/g, "-"),
    }),
    {} as T
  );

export function ManifestGenerator({
  courseId,
  scoList = [],
  sharedResources = [],
  totalLearningTime = 0,
  dataFromLms,
  scormVersion = "1.2",
  ...props
}: ManifestGeneratorProps) {
  const { courseTitle, courseAuthor } =
    removeSpecialChars<Partial<ManifestGeneratorProps>>(props);
  const courseGlobalLearningTime = scoList.length
    ? scoList.reduce((acc, sco) => acc + sco.learningTime, 0)
    : totalLearningTime;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <manifest xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" identifier="${courseId}" version="1.0" xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
      <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>${scormVersion}</schemaversion>
        <imsmd:lom xmlns="http://ltsc.ieee.org/xsd/LOM">
          <imsmd:general>
            <imsmd:identifier>${courseId}</imsmd:identifier>
            <imsmd:title>
              <imsmd:langstring xml:lang="fr">${courseTitle}</imsmd:langstring>
            </imsmd:title>
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
          <imsmd:metametadata>
            <imsmd:metadatascheme>ADL SCORM 1.2</imsmd:metadatascheme>
          </imsmd:metametadata>
          <imsmd:rights>
            <imsmd:cost>
              <imsmd:source>
                <imsmd:langstring xml:lang="fr">LOMv1.0</imsmd:langstring>
              </imsmd:source>
              <imsmd:value>
                <imsmd:langstring xml:lang="fr">yes</imsmd:langstring>
              </imsmd:value>
            </imsmd:cost>
            <imsmd:copyrightandotherrestrictions>
              <imsmd:source>
                <imsmd:langstring xml:lang="fr">LOMv1.0</imsmd:langstring>
              </imsmd:source>
              <imsmd:value>
                <imsmd:langstring xml:lang="fr">yes</imsmd:langstring>
              </imsmd:value>
            </imsmd:copyrightandotherrestrictions>
          </imsmd:rights>
          <imsmd:educational>
            <imsmd:typicallearningtime>
              <imsmd:datetime>${formatLearningTime(
                courseGlobalLearningTime
              )}</imsmd:datetime>
            </imsmd:typicallearningtime>
          </imsmd:educational>
        </imsmd:lom>
      </metadata>
      <organizations default="Org1">
        <organization identifier="Org1">
          <title>${courseTitle}</title>
          ${scoList
            .map(({ scoID, learningTime, resources, ...props }) => {
              const { scoTitle, author } =
                removeSpecialChars<Partial<Sco>>(props);
              return `<item identifier="${scoTitle}" identifierref="resource_${scoID}" isvisible="true">
                <title>${scoTitle}</title>
                <adlcp:dataFromLMS>${
                  dataFromLms ?? courseId + ":" + scoID
                }</adlcp:dataFromLMS>
                <metadata>
                  <imsmd:lom xmlns="http://ltsc.ieee.org/xsd/LOM">
                    <imsmd:general>
                    <imsmd:identifier>${scoID}</imsmd:identifier>
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
                          fn:${author}
                          end:vcard
                        </imsmd:vcard>
                      </imsmd:centity>
                    </imsmd:contribute>
                    </imsmd:lifecycle>
                    <imsmd:educational>
                    <imsmd:typicallearningtime>
                      <imsmd:datetime>${formatLearningTime(
                        learningTime
                      )}</imsmd:datetime>
                    </imsmd:typicallearningtime>
                    </imsmd:educational>
                  </imsmd:lom>
                </metadata>
              </item>`;
            })
            .join("\n")}
        </organization>
      </organizations>
      <resources>
      ${
        sharedResources?.length
          ? `<resource adlcp:scormtype="asset" type="webcontent" identifier="shared_resources">
            ${sharedResources
              .map((resource) => `<file href="${resource}"/>`)
              .join("\n")}
          </resource>`
          : ""
      }
      ${scoList
        .map((sco) => {
          return `<resource adlcp:scormtype="sco" type="webcontent" identifier="resource_${
            sco.scoID
          }" href="${sco.scoHref}">
            ${
              sharedResources?.length
                ? '<dependency identifierref="shared_resources"/>'
                : ""
            }
            ${sco.resources
              .map((resource) => `<file href="${resource}"/>`)
              .join("\n")}
          </resource>`;
        })
        .join("\n")}
      </resources>
    </manifest>`;
}
