const fs = require("fs");
const path = require("path");
const PROFILE = JSON.parse(fs.readFileSync(process.env.PROFILE || path.join(__dirname, "profile.json"), "utf8"));
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat,
  PositionalTab, PositionalTabAlignment, PositionalTabLeader,
  BorderStyle, convertInchesToTwip,
} = require("docx");

const INK = "1A1A1A";
// Accent: black by default. ACCENT=1F3864 builds the human-eyes-only handout cut.
// Never used on an ATS upload (MC-8 v2.1: no documented upside, conservative-sector norm runs against it).
const ACCENT = process.env.ACCENT || INK;
const GRAY = "444444";

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 150, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: ACCENT, font: "Calibri" })],
  });
}

function roleLine(title, dates) {
  return new Paragraph({
    spacing: { before: 90, after: 20 },
    children: [
      new TextRun({ text: title, bold: true, size: 21 }),
      new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: "margin", leader: PositionalTabLeader.NONE })] }),
      new TextRun({ text: dates, size: 20, color: GRAY }),
    ],
  });
}

function subLine(text) {
  return new Paragraph({
    spacing: { after: 30 },
    children: [new TextRun({ text, italics: true, size: 20, color: GRAY })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 30 },
    children: [new TextRun({ text, size: 20 })],
  });
}

function bodyText(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 40 },
    children: runs.map(r => new TextRun({ size: 20, ...r })),
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 20 }, paragraph: { spacing: { line: 240 } } } },
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.15) } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.7), right: convertInchesToTwip(0.7) },
      },
    },
    children: [
      // ===== Header =====
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [new TextRun({ text: PROFILE.fullName, bold: true, size: 38, color: ACCENT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [new TextRun({
          text: [PROFILE.contactLine, PROFILE.credentialLine].filter(Boolean).join("  •  "),
          size: 20, color: GRAY,
        })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "DoD Secret clearance held 2017 – 2025", size: 20, color: GRAY })],
      }),

      // ===== Summary =====
      sectionHeading("Summary"),
      bodyText([{
        text: "Computer science student at Old Dominion University (expected May 2028) after nine years leading U.S. Air Force maintenance teams. Targeting software development internship and junior developer roles — I build AI-assisted tools daily and keep a written record of every decision.",
      }]),

      // ===== Technical Skills =====
      sectionHeading("Technical Skills"),
      bodyText([{ text: "Programming:  ", bold: true }, { text: "Java (object-oriented design, JUnit testing), JavaScript and Node.js, Python, HTML and CSS" }]),
      bodyText([{ text: "Practices:  ", bold: true }, { text: "Git and GitHub, automated testing and release gates, code review, decision logging, Unix/Linux" }]),
      bodyText([{ text: "AI-assisted development:  ", bold: true }, { text: "directing, reviewing, and verifying agent-built software end to end" }]),
      bodyText([{ text: "Currently studying:  ", bold: true }, { text: "Data Structures and Algorithms, Computer Architecture  •  Japanese (intermediate)" }]),

      // ===== Experience =====
      sectionHeading("Experience"),

      roleLine("Software Developer (Independent Practice) — Workshop", "Jun 2026 – Present"),
      subLine("Solo practice, AI-assisted; every build is human-directed, reviewed, and gated before release"),
      bullet("Built a Node.js pipeline that generates and validates Japanese study materials that make learning easier for university students — 37 finished products (practice packs, worksheets, slide decks) in use at Old Dominion University, refined through instructor feedback."),
      bullet("Created a veterans-benefits calculator that turns certified credit hours into training time and payment amounts, every rule cited to the federal regulation it comes from; now in review with a VA counselor and a campus benefits office."),
      bullet("Developing a mobile companion app (TypeScript, React Native) with an automated quality gate — assertions, compilation, and fixture checks — that must pass before each milestone."),
      bullet("Keep a decision log of 150+ dated entries and integrity-checked product manifests, so every release traces back to what was decided and why."),

      roleLine("Software Development Apprentice — AllegiantVets (DoD SkillBridge)", "Nov 2024 – Jun 2025"),
      subLine("Remote  |  Full-time apprenticeship during final months of military service"),
      bullet("Completed an eight-month program covering front-end and back-end web development, including a full-stack capstone project."),
      bullet("Earned the Meta Front-End Developer certification (Jan 2025)."),

      roleLine("Training Manager — U.S. Air Force", "Jun 2024 – Jun 2025"),
      subLine("Anchorage, AK"),
      bullet("Ran training operations for a 90-person aircraft maintenance unit, tracking qualifications across four shops."),
      bullet("Built a tracking and reporting tool that flagged overdue training automatically, cutting the backlog from 350 items to 150."),
      bullet("Reorganized the unit's 580+ training tasks into 10 clear groups; mentored 5 junior technicians."),

      roleLine("Ground Equipment Mechanic / Production Lead — U.S. Air Force", "May 2016 – Jun 2024"),
      subLine("Shaw Air Force Base, SC and Joint Base Elmendorf-Richardson, AK"),
      bullet("Maintained the generators, hydraulic systems, and support equipment that fighter-jet operations depend on; as production lead, directed a 14-person team behind 7,100 flights in a single year."),
      bullet("Managed a 528-piece equipment fleet valued at $36 million across two bases."),
      bullet("Coordinated a 72-hour relocation of 95 pieces of equipment with zero incidents; trained 17 officers on equipment operations."),

      // ===== Education =====
      sectionHeading("Education"),
      roleLine("B.S. Computer Science — Old Dominion University, Norfolk, VA", "Expected May 2028"),
      bullet("Coursework to date: Java programming with JUnit testing, Unix/Linux, data structures and algorithms, computer architecture. Built an object-oriented inventory system with a full JUnit test suite."),
      roleLine("A.A.S. Aerospace Ground Equipment Technology — Community College of the Air Force", "2022"),
      bullet("GPA 3.9. Electrical, hydraulic, and mechanical systems diagnostics."),

      // ===== Certifications =====
      sectionHeading("Certifications & Recognition"),
      bullet("Meta Front-End Developer — Meta, Jan 2025"),
      bullet("U.S. Air Force leadership schools — supervisory leadership (2020) and joint-service leadership (2023)"),
      bullet("Honorable service, U.S. Air Force, 2016 – 2025"),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2];
  fs.writeFileSync(out, buf);
  console.log("Wrote", out, buf.length, "bytes");
});
