# JSON Tree Visualizer

![Status](https://img.shields.io/badge/status-in%20progress-orange?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

> Fed up with JSON tree visualizers that choke on anything over a few hundred lines. This one is built to handle 5000+ line JSON files without breaking a sweat — powered by WebGPU.



## Why

Every existing JSON visualizer either crashes, freezes, or becomes unusable with large payloads. This project explores using WebGPU for rendering the tree canvas so the visualization stays fast regardless of how deep or wide the JSON gets.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roadmap

- [x] Split panel layout with draggable divider
- [x] Monaco editor with JSON validation
- [x] Collapsible editor panel
- [x] Persistent editor state
- [ ] WebGPU canvas renderer
- [ ] JSON tree node rendering
- [ ] Zoom / pan on the canvas
- [ ] Search and highlight nodes
- [ ] Export tree as image
