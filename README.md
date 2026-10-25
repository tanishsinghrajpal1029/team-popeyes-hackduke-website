# Willow Dicke Lab

An interactive explainer from Team Popeyes about Dicke states, Willow connectivity, and noise-aware circuit design.

## Run locally

This is a buildless static site. From this directory:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Serving it over HTTP lets the page load `topology.json`.

## What is real and what is illustrative

- `topology.json` contains the 105 qubits and 182 couplers from Cirq's local `willow_pink` device template.
- The route lab assigns illustrative edge error rates. Its gate-survival estimate is a teaching model, not a hardware prediction or the submission router.
- The case selector reflects `DuQuantum_submission_BEST_OF_BOTH.ipynb`: the alternative team construction is tried first for `(7, 3)` and `(9, 4)`, with the portfolio default elsewhere and a validity fallback.
- `bonus-depths.json` lists all 56 graded bonus pairs. Both candidates passed exact ideal-state checks; the selected depth is the smaller of the two. The displayed 44.27 sum is a depth comparison metric, not an official hardware score or a guaranteed judging point.
- The 228/228 main-task rule check used a fresh synthetic calibration. It is not a Willow hardware measurement.

The site needs no account, server code, build step, or external API. Google Fonts are optional; system fonts are used if they do not load.
