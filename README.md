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
- The circuit counts and score comparison on the page are the team's simulated results. They are not measurements from Willow hardware.

The site needs no account, server code, build step, or external API. Google Fonts are optional; system fonts are used if they do not load.
