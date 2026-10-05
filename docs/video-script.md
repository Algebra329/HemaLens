# Demo Video Script Outline — HemaLens

Target length: 60-90 seconds. Devpost judges reportedly skip or barely watch longer videos, so the first 15 seconds carry disproportionate weight — don't bury the hook under a team intro.

Two of you means two voices — suggested split marked below, but swap as fits.

---

## 0:00 – 0:15 — The Hook
**Speaker: whoever's more comfortable on camera.**

Open on the problem, not the product. A stat or a stark statement, not "Hi, we're team X."

> "In rural clinics across the world, diagnosing conditions like Sickle Cell Disease or Thalassemia depends on a trained hematologist looking at blood cells under a microscope. In a lot of these clinics — that person doesn't exist."

**On screen:** a real blood smear image, maybe a quick cut to a map or stat about hematologist shortages in underserved regions (only include a stat if you can verify it — don't invent a number for the video).

---

## 0:15 – 0:30 — The Proposition
**Speaker: same or switch.**

One sentence. Name the product, state what it does, tie it to the UnivaBio theme explicitly (accessible, earlier, smarter).

> "HemaLens puts that diagnostic capability in a browser tab. It classifies red blood cell morphology from a smear image, completely offline, running entirely on-device — no internet, no server, no patient data ever transmitted."

**On screen:** app loading, clean UI visible.

---

## 0:30 – 0:50 — The Demonstration
**Speaker: whoever's driving the screen share.**

This is the part that actually has to work live — rehearse this exact sequence beforehand, don't improvise it on the first take.

1. Upload or select a real smear image (use one from `web/public/models/samples/` if that's set up, or a real Chula-RBC-12 test image).
2. Show the loading/analyzing animation briefly (don't cut it — the polish is part of the pitch).
3. Show the annotated result: bounding boxes, class labels, confidence scores.
4. Call out one specific, non-Normal classification result by name (e.g. "there — Target Cell, 91% confidence") so it's clear this isn't a canned screenshot.

> "Here's a real smear — upload it, and in a couple seconds HemaLens has located and classified every cell. This one's flagged as a Target Cell — a pattern associated with conditions like Thalassemia."

**Important:** make sure this is the real model running, not the "Calibrated Mode" fallback. If you can't 100% confirm that on the day of recording, say so to each other before hitting record — don't let a silent fallback end up in the submission video.

---

## 0:50 – 1:10 — Technical Validation
**Speaker: the ML half, probably — this is where the depth shows.**

Brief architecture flash, real numbers, honest about the weak point.

> "Under the hood, it's a two-stage pipeline — a U-Net locates individual cells, then an EfficientNet-B0 classifier trained on the Chula-RBC-12 dataset identifies each one across 13 morphology classes. We're hitting 0.857 macro F1 on validation data, despite a 34-to-1 class imbalance in the training set. Both models export to ONNX and run client-side — nothing leaves the browser."

**On screen:** the architecture diagram from the README (the mermaid flowchart, or a cleaner slide version of it), maybe a quick flash of the per-class F1 table.

*Optional, only if time allows:* one honest sentence about segmentation being the weaker stage — judges with ML background will respect this more than silence on it, and it's already in your README, so the video shouldn't contradict it.

---

## 1:10 – end — Close
**Speaker: both, if you want a shared sign-off.**

Tie back to impact, not features.

> "No cloud dependency, no recurring cost, works on a basic laptop or phone — HemaLens is built to go wherever the clinic already is."

**On screen:** final shot of the app, maybe the GitHub repo URL or Devpost link as an end card.

---

## Practical notes
- Record the demo segment (0:30–0:50) multiple times — this is the part most likely to need a retake.
- Don't record off a laggy connection if the app is hosted remotely; local `npm run dev` is safer for the live-demo segment if hosting is at all flaky.
- Captions/subtitles are worth adding if you have time — some judges watch muted.
- Leave yourselves at least one full evening of buffer after recording for editing + re-export, not just for filming.
