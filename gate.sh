#!/bin/sh
# Gate — resume and cover letter honesty checks.
# Run from the repo root: sh gate.sh
#
# Build does not produce before it can gate (PRD §3a). These documents make claims about a
# real person to real employers, so the gate tests the two things that can actually hurt him:
# claims he cannot defend in an interview, and stale contact details.
#
# Method governance: MC-8 v2 (resume writing & mil-to-civ translation), MC-28 (profile
# consistency). The forbidden-claim list is MC-8's claim-defense rule, made mechanical.

set -e
DIR="$(dirname "$0")"
FAIL=0

say() { printf '%s\n' "$*"; }
fail() { say "FAIL  $*"; FAIL=1; }
pass() { say "ok    $*"; }

# --- Fixture 1: forbidden claims -------------------------------------------------
# Each term is something the candidate cannot currently demonstrate or discuss. Appearing in a
# generated document is a blocking defect, not a style note.
FORBIDDEN="C++
Kubernetes
LangChain
RAG
Docker
Spring
Kafka
active Secret
active clearance
MongoDB
Express"

for f in "$DIR"/build-resume*.js "$DIR"/build-coverletter.js; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  echo "$FORBIDDEN" | while IFS= read -r term; do
    [ -n "$term" ] || continue
    if grep -Fq "$term" "$f"; then
      say "FAIL  $base claims '$term' — not defensible (MC-8 claim-defense rule)"
      exit 1
    fi
  done || FAIL=1
  [ "$FAIL" = 0 ] && pass "$base carries no undefendable claim"
done

# --- Fixture 2: contact details are current --------------------------------------
# The outlook address and any phone number are retired from these documents.
for f in "$DIR"/build-resume*.js "$DIR"/build-coverletter.js; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  grep -Fq "PROFILE.contactLine" "$f" || { fail "$base does not read identity from gitignored profile"; continue; }
  grep -Fq "outlook.com" "$f" && { fail "$base still carries the retired outlook address"; continue; }
  grep -Eq '[0-9]{3}[-. )]+[0-9]{3}[-. ][0-9]{4}' "$f" && { fail "$base carries a phone number"; continue; }
  grep -Fq "PROFILE.fullName" "$f" || { fail "$base does not read name from profile"; continue; }
  pass "$base contact block current"
done

# --- Fixture 3: graduation year is the corrected one ------------------------------
for f in "$DIR"/build-resume*.js; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  if grep -Fq "2027" "$f"; then
    fail "$base carries the superseded 2027 graduation year"
  else
    pass "$base graduation year not stale"
  fi
done

# --- Fixture 4: every generator must actually build ------------------------------
# Built against profile.example.json so the check runs on a fresh clone with no personal data.
if command -v node >/dev/null 2>&1; then
  TMP=$(mktemp -d)
  BUILT=0
  for f in "$DIR"/build-resume*.js "$DIR"/build-coverletter.js; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    BUILT=$((BUILT + 1))
    if (cd "$DIR" && PROFILE=profile.example.json node "$base" "$TMP/out.docx" >/dev/null 2>&1); then
      pass "$base builds"
    else
      fail "$base does not build"
    fi
  done
  rm -rf "$TMP"
  [ "$BUILT" -gt 0 ] || fail "no generator found to build"
else
  say "skip  node unavailable; build check not run"
fi

say ""
if [ "$FAIL" = 0 ]; then
  say "GATE PASS"
  exit 0
else
  say "GATE FAIL"
  exit 1
fi
