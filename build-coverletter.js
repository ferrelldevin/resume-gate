const fs = require("fs");
const path = require("path");
const PROFILE = JSON.parse(fs.readFileSync(process.env.PROFILE || path.join(__dirname, "profile.json"), "utf8"));
const LETTER = process.env.TARGET
  ? JSON.parse(fs.readFileSync(path.join(__dirname, "targets", process.env.TARGET + "-letter.json"), "utf8"))
  : null;
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, convertInchesToTwip,
} = require("docx");

const ACCENT = "1F3B57";
const GRAY = "444444";

function para(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 160 },
    alignment: opts.align,
    children: runs.map(r => new TextRun({ size: 22, font: "Calibri", ...r })),
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { line: 264 } } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: convertInchesToTwip(0.8), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [new TextRun({ text: PROFILE.fullName, bold: true, size: 36, color: ACCENT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } },
        children: [new TextRun({
          text: [PROFILE.contactLine, PROFILE.credentialLine].filter(Boolean).join("  •  "),
          size: 20, color: GRAY,
        })],
      }),

      ...(LETTER && LETTER.recipient
        ? LETTER.recipient.map((line, i) =>
            para([{ text: line }], { after: i === LETTER.recipient.length - 1 ? 240 : 0 }))
        : [para([{ text: "[Company Name]" }], { after: 240 })]),

      para([{ text: LETTER && LETTER.salutation ? LETTER.salutation : "Dear Hiring Manager," }]),

      ...(LETTER ? LETTER.paragraphs.map(t => para([{ text: t }])) : [
        para([{ text: "I am writing to apply for the [Position Name] role at [Company Name]." }]),
      ]),

      para([{ text: "Thank you for your time." }]),

      para([{ text: "Sincerely," }], { after: 40 }),
      para([{ text: PROFILE.signature || PROFILE.fullName, bold: true }]),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(process.argv[2], buf);
  console.log("Wrote", process.argv[2], buf.length, "bytes");
});
