const fs = require("fs");
const path = require("path");
const PROFILE = JSON.parse(fs.readFileSync(process.env.PROFILE || path.join(__dirname, "profile.json"), "utf8"));
// TARGET=<company> builds a tailored cut from targets/<company>.json. Unset = the general one-pager.
const TARGET = process.env.TARGET
  ? JSON.parse(fs.readFileSync(path.join(__dirname, "targets", process.env.TARGET + ".json"), "utf8"))
  : null;
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
    spacing: { before: 120, after: 50 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 21, color: ACCENT, font: "Calibri" })],
  });
}

function roleLine(title, dates) {
  return new Paragraph({
    spacing: { before: 70, after: 15 },
    children: [
      new TextRun({ text: title, bold: true, size: 20 }),
      new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: "margin", leader: PositionalTabLeader.NONE })] }),
      new TextRun({ text: dates, size: 19, color: GRAY }),
    ],
  });
}

function subLine(text) {
  return new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({ text, italics: true, size: 19, color: GRAY })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 20 },
    children: [new TextRun({ text, size: 19 })],
  });
}

function bodyText(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 30 },
    children: runs.map(r => new TextRun({ size: 19, ...r })),
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 19 }, paragraph: { spacing: { line: 228 } } } },
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.22), hanging: convertInchesToTwip(0.14) } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: convertInchesToTwip(0.5), bottom: convertInchesToTwip(0.5), left: convertInchesToTwip(0.65), right: convertInchesToTwip(0.65) },
      },
    },
    children: [
      // ===== Header =====
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [new TextRun({ text: PROFILE.fullName, bold: true, size: 34, color: ACCENT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [new TextRun({
          text: [PROFILE.contactLine, PROFILE.credentialLine].filter(Boolean).join("  •  "),
          size: 19, color: GRAY,
        })],
      }),

      // ===== Summary (2 lines, frames the pivot) =====
      bodyText([{ text: TARGET ? TARGET.summary : "Computer science student at Old Dominion University (expected May 2028) and U.S. Air Force veteran with nine years sustaining the ground equipment behind F-16 flight operations. Targeting software development internship and junior developer roles — I build AI-assisted tools daily and keep a written record of every decision." }], { after: 40 }),

      // ===== Education (above experience — degree is the strongest signal) =====
      sectionHeading("Education"),
      roleLine("B.S. Computer Science — Old Dominion University, Norfolk, VA", "Aug 2025 – Expected May 2028"),
      bullet("Coursework to date: Java programming with JUnit testing, Unix/Linux, data structures and algorithms, computer architecture. Built an object-oriented inventory system verified by a full JUnit test suite."),
      roleLine("A.A.S. Aerospace Ground Equipment Technology — Community College of the Air Force", "2022"),
      bullet("GPA 3.9. Electrical, hydraulic, and mechanical systems diagnostics."),

      // ===== Skills =====
      sectionHeading("Technical Skills"),
      ...(TARGET ? TARGET.skills.map(([label, val]) => bodyText([{ text: label, bold: true }, { text: val }]))
        : [
          bodyText([{ text: "Programming:  ", bold: true }, { text: "Java (OO design, JUnit), JavaScript and Node.js, Python, HTML and CSS" }]),
          bodyText([{ text: "Practices:  ", bold: true }, { text: "Git and GitHub, automated testing and release gates, code review, decision logging, Unix/Linux" }]),
          bodyText([{ text: "AI-assisted development:  ", bold: true }, { text: "directing, reviewing, and verifying agent-built software end to end" }]),
        ]),

      // ===== Experience =====
      sectionHeading("Experience"),

      roleLine("Independent Software Projects — self-directed, AI-assisted", "Jun 2026 – Present"),
      subLine("Personal projects, not employment. I set the requirements, review every change, and gate releases on automated checks."),
      bullet("Built a Node.js pipeline that generates and validates practice materials for two ODU Japanese courses — 37 packs, worksheets, and slide decks delivered to both instructors and revised against faculty review."),
      bullet("Created a veterans-benefits calculator that turns certified credit hours into training time and payment amounts, every rule cited to the federal regulation behind it."),
      bullet("Built Kurikaeshi, a live spaced-repetition web app for ODU Japanese courses, released only through automated checks; maintain a decision log of 150+ dated entries so every release traces to what was decided and why."),

      roleLine("Software Development Apprentice — AllegiantVets (DoD SkillBridge)", "Nov 2024 – Jun 2025"),
      bullet("Full-time DoD SkillBridge placement — released from unit duties for the final eight months of service — covering front-end and back-end web development (HTML/CSS, JavaScript, Node.js) and concluding with a full-stack capstone; earned the Meta Front-End Developer certification, Jan 2025."),

      roleLine("Training Manager — U.S. Air Force, Anchorage, AK", "Jun 2024 – Nov 2024"),
      bullet("Ran training operations for a 90-person aircraft maintenance unit; built a tracking and reporting tool that flagged overdue training automatically, cutting the backlog from 350 items to 150."),
      bullet("Reorganized the unit's 580+ training tasks into 10 clear groups; mentored 5 junior technicians."),

      roleLine("Ground Equipment Mechanic / Production Lead — U.S. Air Force", "May 2016 – Jun 2024"),
      subLine("Shaw Air Force Base, SC and Joint Base Elmendorf-Richardson, AK"),
      bullet("Maintained the generators, hydraulic systems, and support equipment that fighter-jet operations depend on; as production lead, directed a 14-person team behind 7,100 flights in a single year."),
      bullet("Managed a 528-piece equipment fleet valued at $36 million; coordinated a 72-hour relocation of 95 pieces of equipment with zero incidents."),

      // ===== Footer line =====
      new Paragraph({
        spacing: { before: 90 },
        children: [
          new TextRun({ text: "ADDITIONAL:  ", bold: true, size: 19 }),
          new TextRun({ text: "Air Force leadership schools (2020, 2023)  •  Japanese (intermediate)  •  Honorable discharge, 2025", size: 19 }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2];
  fs.writeFileSync(out, buf);
  console.log("Wrote", out, buf.length, "bytes");
});
