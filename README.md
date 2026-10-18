# resume-gate

A resume generator with a gate that fails the build when the resume claims something I can't defend.

I was writing job applications with AI assistance and noticed the obvious risk: a resume that reads
well and books an interview I can't survive is worse than no resume. So the honesty check became
part of the build, not a thing I remembered to do.

```
node build-resume.js out.docx           # black — uploads and applications
ACCENT=1F3864 node build-resume.js out.docx   # navy — print handouts only
sh gate.sh                              # must pass before anything ships
```

## What the gate checks

Four fixtures. Every one was earned from a real defect in my own documents — none was invented
in the abstract.

| Fixture | What it catches | Where it came from |
|---|---|---|
| **Forbidden claims** | Skills the candidate can't currently demonstrate (`C++`, `Kubernetes`, `RAG`, `active clearance`, …) appearing anywhere in a generator | My first draft led with a full-stack capstone I can no longer access or discuss |
| **Identity from profile** | Name and contact read from a gitignored `profile.json`, never inlined; rejects retired addresses | A privacy hook blocked my first commit — correctly |
| **Stale graduation year** | A superseded date surviving in any generator | My university profile said 2027 while my resume said 2028; recruiters cross-check |
| **Builds** | Every generator builds a .docx from `profile.example.json` | Cheap, and it caught that this fixture itself had been pointing at files no longer in the repo |

The gate is deliberately small. It tests what I told it to assert and is worth exactly that much —
which is the whole point of the next section.

## What the gate could not catch

I ran the output past an independent adversarial reviewer: a separate model, given ground truth
and told to attack, on the principle that the thing that makes something is the worst judge of it.
It took more than one round to pass. The early rounds found fabricated claims and a clearance not
marked inactive, and the mechanical gate had passed those same documents.

That is the finding worth keeping. A suite tests what you thought to assert; it has no opinion on
whether you thought of the right things. Everything real came from the separation between the thing
that generates and the thing that judges.

Three lessons I'd carry to any verification problem:

1. **Repair the defect class, not the instance.** Filling `[Company Name]` and walking past `[Date]`
   in the same letterhead is the shape of most incomplete fixes.
2. **A repair can introduce a worse defect than the one it fixes.** A fix for one overclaim
   produced a bigger one. Fixes are not self-verifying.
3. **A review harness can manufacture defects.** A review round flagged `&apos;` as a blocking error; it is
   a predefined XML entity that Word decodes correctly, and my extractor simply wasn't decoding it.
   That false positive cost reviewer attention that should have gone to real defects.

## Layout

```
build-resume.js          # one-page resume; ACCENT env var switches the print cut
build-resume-master.js   # two-page master, for tailoring from
build-coverletter.js     # letter; recipient block and body come from targets/
gate.sh                  # the four fixtures
targets/<company>.json   # per-application summary + skills
profile.example.json     # copy to profile.json (gitignored) and fill in
```

Contact details live in `profile.json`, which is gitignored, and fixture two enforces that rather
than my memory. The resume text itself (work history, dates, numbers) is in the generators on
purpose: it is the thing the gate checks.

## Why a .docx and not HTML

Because employers ask for a document, and the one thing worse than an unattractive resume is one an
applicant tracking system can't parse. Single column, real text, standard headings. The research on
that is thinner than the internet suggests — the widely repeated claim that applicant systems reject
75% of resumes traces to a 2012 sales pitch from a vendor that no longer exists — but parseability
is cheap and the downside isn't.

Built with [docx](https://www.npmjs.com/package/docx). AI-assisted, human-directed: I set the
requirements, reviewed every change, and nothing ships that the gate rejects.
