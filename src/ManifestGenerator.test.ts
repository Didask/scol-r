import { ManifestGenerator, Sco } from "./ManifestGenerator";

const baseProps = {
  courseId: "course123",
  courseTitle: "Animer ses cours",
  courseAuthor: "Sciconum",
  scoList: [
    new Sco({
      scoID: "sco123",
      scoTitle: "Animer ses cours",
      author: "Sciconum",
      learningTime: 120,
      scoHref: "./sco123/index.html",
      resources: ["./sco123/index.html"],
    }),
  ],
  sharedResources: ["./lib/SCORMAdapter.js"],
};

describe("ManifestGenerator — SCORM 2004", () => {
  const manifest = ManifestGenerator({
    ...baseProps,
    scormVersion: "2004 4th Edition",
  });

  test("uses the 2004 namespaces, not the 1.2 ones", () => {
    expect(manifest).toContain(
      'xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"'
    );
    expect(manifest).toContain(
      'xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"'
    );
    expect(manifest).toContain('xmlns:imsss="http://www.imsglobal.org/xsd/imsss"');
    expect(manifest).not.toContain("imscp_rootv1p1p2");
    expect(manifest).not.toContain("adlcp_rootv1p2");
    expect(manifest).not.toContain("ADL SCORM 1.2");
  });

  test("declares no measure-based satisfaction by default (status governs)", () => {
    expect(manifest).not.toContain("<imsss:sequencing>");
    expect(manifest).not.toContain("satisfiedByMeasure");
    expect(manifest).not.toContain("minNormalizedMeasure");
  });

  test("emits the 2004-cased scormType on resources", () => {
    expect(manifest).toContain('adlcp:scormType="sco"');
    expect(manifest).not.toContain("adlcp:scormtype");
  });

  test("keeps the declared schemaversion", () => {
    expect(manifest).toContain("<schemaversion>2004 4th Edition</schemaversion>");
  });
});

describe("ManifestGenerator — SCORM 1.2", () => {
  test("still emits the 1.2 structure and no sequencing", () => {
    const manifest = ManifestGenerator({ ...baseProps, scormVersion: "1.2" });
    expect(manifest).toContain("imscp_rootv1p1p2");
    expect(manifest).toContain('adlcp:scormtype="sco"');
    expect(manifest).toContain("<schemaversion>1.2</schemaversion>");
    expect(manifest).not.toContain("imsss");
    expect(manifest).not.toContain("minNormalizedMeasure");
  });

  test("defaults to 1.2 when no version is given", () => {
    const manifest = ManifestGenerator(baseProps);
    expect(manifest).toContain("<schemaversion>1.2</schemaversion>");
    expect(manifest).not.toContain("imsss");
  });
});
