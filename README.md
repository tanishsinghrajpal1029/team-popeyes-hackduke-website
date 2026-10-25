# Willow Dicke Lab

An interactive Team Popeyes explainer for the Google Quantum AI challenge at DuQuantum, the Duke Quantum Hackathon. It introduces Dicke states, shows the `willow_pink` connectivity graph, compares two routing rules, explains the `DuQuantum_submission_FINAL_v2.ipynb` circuit selector, and previews our Arduino UNO Q exhibit. The [What we built](./methodology.html) page is a fuller account of the math, decisions, local evidence, and limitations.

## See the site

The repository is a buildless static site: `index.html`, `app.js`, `styles.css`, and local JSON assets. GitHub Pages can serve it from the `main` branch root. If Pages and the domain are configured, its intended public address is [tanishsinghrajpal.com/team-popeyes-hackduke-website/](https://tanishsinghrajpal.com/team-popeyes-hackduke-website/).

For a local preview, run from this directory:

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/` for the interactive lab or `http://127.0.0.1:8000/methodology.html` for the field notes. Serve it over HTTP so the page can load `topology.json` and `bonus-depths.json`; opening `index.html` directly as a file may block those requests.

## How the alternative path is found

The route lab treats the 105 qubits as graph vertices and the 182 couplers as edges. Its topology comes from the local Cirq `willow_pink` device template. You choose start and target coordinates and may mark qubits unavailable; an unavailable qubit is excluded from both searches. The displayed paths list every coordinate in travel order.

1. **Fewest hops:** Dijkstra's algorithm gives every usable edge cost 1 and minimizes the number of couplers traversed.
2. **Noise aware:** Each edge has an illustrative CZ error probability `p`. A move before the final interaction is modeled as a SWAP of approximately three CZ gates, so its cost is `−3 ln(1−p)`. The last edge costs `−ln(1−p)` for one CZ. Dijkstra minimizes the sum of these costs.
3. **Comparison:** The displayed *gate survival* is `∏(1−p)^m`, with `m = 3` for preterminal edges and `m = 1` for the final edge. Minimizing the summed negative log costs maximizes this product. A path with more hops can win if it avoids a weak coupler. Blocking a qubit forces both rules to find a route around it, if one exists.

The ordinary coupler errors are deterministic synthetic values, and the weak-link slider overrides edges touching `(6, 7)`. **They are not Willow calibration data.** The model omits idle decoherence, readout, crosstalk, parallel scheduling, and actual gate compilation. It is a classical Dijkstra teaching demo, not AI, a hardware fidelity prediction, or the submission's circuit router.

## UNO Q preview and physical board

The public site includes a browser recreation of the Arduino UNO Q's built-in 8 × 13 LED matrix. It shows Willow rows 3–10 and columns 1–13, a central 104-pixel window of the full graph. Choose **Noise-aware** or **Fewest hops** to preview either route; map controls above update the lights. Choose **Bonus depths** to show candidate A in the upper two rows and candidate B in the lower two rows; the shorter depth bar is brighter. The Dicke-state sliders in **Our choices** set the bonus pair. Routes outside the window remain visible in full on the graph and in the coordinate lists.

The physical UNO Q app is in the [team repository](https://github.com/tanishsinghrajpal1029/Team-Popeyes-DuHack-GoogleQAI/tree/main/arduino-uno-q-willow). Its local controls appear at `http://127.0.0.1:7000/` when the board is connected and its app is running. That address is **local to the connected computer**. A public GitHub Pages site cannot turn it into a live board feed; each visitor's `127.0.0.1` refers to their own device. The site preview runs entirely in the visitor's browser and needs no board.

## Circuit methodology shown on the site

The site now follows the main-task selector in [`FINAL_v2`](./downloads/DuQuantum_submission_FINAL_v2.ipynb). Product states and `N ≤ 3` use the hub-walk family. Five shapes, `(7,3)`, `(7,4)`, `(8,3)`, `(8,4)`, and `(8,5)`, try a PSC template, then the synthesized builder, then hub-walk. Other entangled `4 ≤ N ≤ 8` cases try the synthesized builder, then hub-walk. Entangled `N ≥ 9` cases try the calibration-aware two-row construction, then hub-walk. Returned circuits are checked for native gates, working qubits and couplers, and the 1,750-moment limit.

The earlier main configuration that uses the same circuits for the organizer's three reported `N ≥ 9` cases scored `1.3316 ± 0.0148` in a preliminary hardware rerun, leading the reported main-track ranking. `FINAL_v2` itself was not directly scored in that rerun. Small-state PSC choices were based on local work, and final results can change with calibration and hidden choices.

For each of the 56 graded bonus pairs, `FINAL_v2` uses the same bonus implementation as the earlier combined notebook: it builds both exact candidates and returns the valid circuit with fewer moments. `bonus-depths.json` contains those checked depths. The displayed sum of `Nn/depth` is a comparison metric, **not** the official bonus award. The main-task `228/228` rule sweep used fresh synthetic calibration, not measured Willow performance.

## Data and credits

- `topology.json`: 105-qubit, 182-coupler `willow_pink` connectivity.
- `bonus-depths.json`: checked exact-circuit depths for bonus pairs.
- `downloads/DuQuantum_submission_FINAL_v2.ipynb`: byte-identical copy of the notebook described on the site (SHA-256 `993ec3e95606a8d9a1ec0ebf3fda1ec9f32a066007ef630adc47be3ec20d6727`).
- `app.js`: Dicke-state, routing, selector, and UNO Q preview interactions.
- `methodology.html`, `methodology.css`, and `methodology.js`: the research narrative, equations, and a small Dicke-state math explorer.
- `assets/`: event and organization logos credited on the site.

This is an independent Team Popeyes explainer. [DuQuantum](https://duquantum.org/), [Google Quantum AI](https://quantumai.google/), and [Major League Hacking](https://mlh.io/) are linked and credited on the page. Google Fonts are optional; system fonts are used if they do not load.
