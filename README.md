# Willow Dicke Lab

A beginner-friendly, interactive explanation of Team Popeyes' Google Quantum AI challenge work at DuQuantum. The site shows the supplied 105-qubit Willow topology, a toy routing comparison, a Dicke-state playground, the current circuit choice rule, local bonus depths, and an Arduino UNO Q LED-matrix preview.

## Which implementation does this site explain?

The **current** methodology and code guide follow the attached `Team-Popeyes-DuHack-GoogleQAI-main-3` folder:

- `main.py` is the source of the circuit builders.
- `submission.ipynb` embeds that implementation and is named as the entry in the folder's README.
- `ARCHITECTURE.md` explains algorithms, assumptions, and local comparisons.
- `experiments/results/notebook_bonus.csv` contains the 56 checked bonus depths used here.

That `submission.ipynb` has SHA-256 `c7f79caa7cd3ca83f35c42b8cbbc90969e97e1ce6137cc689dd18cade65fb970`. It differs from `DuQuantum_submission_FINAL_v2.ipynb`, which the website previously described. The earlier notebook remains in `downloads/` only as a historical snapshot; it is **not** the source of the current selector. The interactive bonus chart compares its selected depth with the current folder's checked depth, and labels each version.

## Read the site

- [Home](./index.html): change a target, compare toy paths, use the circuit selector, and inspect bonus depths.
- [How we built it](./methodology.html): background terms, the state, hardware constraints, algorithms, choices, tests, bonus, and Arduino exhibit in plain English.
- [Inside the code](./implementation.html): one worked example, readable pseudocode, why each algorithm was chosen, and a file map.

## What the current Python does

The main function is `create_dicke_state(N, n, calibration...)`. It works with `k = min(n, N-n)`; for targets with more than half the qubits excited, it prepares the complement and flips all qubits. Product states need no CZ. A single excitation uses a branching W tree. The calibrated portfolio is tried when `k == 2 and N >= 6` or `k >= 3 and N >= 9`; if it fails, the core builder tries saved small-state exact templates, path blocks, and routed constructions. The returned circuit is compiled into CZ and PhasedXZ gates, runs of one-qubit gates are merged, and only sufficiently long idle windows receive XY4 echo pulses.

The bonus function `create_dicke_state_adaptive` gathers several exact circuit families and returns the one with the fewest moments. It uses no mid-circuit measurement in the current version. The folder's local `score_solution()` sum is 44.47 over 56 eligible pairs; that is a comparison metric, while the organizer's stated bonus rule awards a point to the shallowest submission for each pair.

## What the browser demo represents

The topology coordinates and edges come from the supplied `willow_pink` map. The displayed edge errors are **synthetic teaching values**, not live Willow calibration. The fewest-hop path and the error-aware path use classical Dijkstra with different edge costs. This route game is separate from the submission's placement, beam search, and circuit portfolio.

The browser's UNO Q bonus bars compare earlier and current depths. The attached folder's physical UNO Q companion app still has its older two-candidate bonus display; the website labels that difference. Neither browser nor UNO Q performs quantum operations.

## Evidence and limits

The attached folder reports 419 automated tests, a 969-build robustness sweep, and local noise simulations. The organizer's preliminary three-case hardware email tested an earlier notebook, **not** this attached `submission.ipynb`. This site does not assign that hardware score to the current implementation. Local simulations assume parameters that may differ from Willow hardware and omit some effects such as drift, crosstalk, and leakage.

This independent Team Popeyes explainer cites [Google Quantum AI](https://quantumai.google/), [DuQuantum](https://duquantum.org/), and [Major League Hacking](https://mlh.io/). No AI prompt logs are included in the website.

## Preview locally

From this directory, run `python3 -m http.server 8001` and open `http://127.0.0.1:8001/`. The pages are static HTML/CSS/JavaScript and need no build step.
