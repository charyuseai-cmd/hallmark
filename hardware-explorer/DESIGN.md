# Assembly · hardware anatomy lab

Assembly is the interactive educational page in this repository. It is deliberately a browser-native, multi-section exhibition rather than a storefront or product landing page.

## What changed

The page now contains three independent hardware studies:

1. **PC anatomy** — motherboard, CPU, memory, GPU, NVMe storage, power supply, cooling and case/airflow.
2. **Cooling loop** — cold plate, pump, coolant path, radiator, radiator fans, and mounting/interface hardware.
3. **Mechanical keyboard** — case, switch plate, mechanical switches, keycaps, PCB/matrix, stabilizers, and controller/USB.

Every component is represented by a named Three.js group and has a shared education record with:

- `componentId`
- `componentName`
- `description`
- `primaryFunction`
- `howItWorks`
- `relatedComponents`
- `meshNodeName`
- `cameraFocus`
- `animationSequence`
- `referenceImages`
- `technicalSources`

The records live in `app.js` under `HARDWARE`. The same records generate the step cards, stage labels, camera targets, component highlight, related-component chips and source links.

## React Bits reference

The current page stays on its existing vanilla Three.js architecture. React Bits was used as a visual and interaction reference, not added as a runtime dependency:

- `SpotlightCard` inspired the pointer-following light on the reference cards.
- `AnimatedContent` inspired the small intersection-based reveal on exhibition headings and source rails.
- `StarBorder` inspired the restrained activation-ring pulse around the model entry control.

These are original CSS and browser API adaptations in `style.css` and `app.js`; no React Bits source file was copied into the product. The reference repository is <https://github.com/DavidHDev/react-bits> and its current inspected revision was `4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4`. React Bits is distributed under an MIT license with Commons Clause conditions, so keeping the implementation as an inspiration-only adaptation avoids bundling or redistributing its components.

## Interaction model

Each exhibition follows the same learning loop without making the compositions identical:

- The complete assembly is visible before activation.
- Clicking the canvas or **Enter exploration** activates that exhibition.
- The pinned stage is a real Three.js scene; the copy column becomes a scroll-linked sequence.
- A single ScrollTrigger progress value drives the camera, component offsets, opacity, highlight and educational step.
- Every section has previous/next controls and its step cards are keyboard reachable.
- Clicking a visible 3D part routes to that component's learning state when the browser raycaster can identify it.
- The final two states show an exploded system map, then return the complete assembly before the next hardware section continues below the white divider.
- `prefers-reduced-motion` keeps the content usable and removes animated scroll interpolation.
- If WebGL is unavailable, the learning cards and technical sources remain available with an inline fallback note.

## 3D implementation

The prototype uses original procedural geometry rather than an inseparable stock model. This keeps the model inspectable in a repository with no downloaded manufacturer CAD files:

- `BoxGeometry`, `CylinderGeometry`, `TorusGeometry` and `TubeGeometry` make the identifiable parts.
- Each educational component is a `THREE.Group` whose `name` is the record's `meshNodeName`.
- Component transforms start from `home`, pass through a focus offset, and finish at an exploded offset.
- Meshes use standard materials, a restrained blue/steel palette and one lime focus signal.
- There is no post-processing or autoplay loop. The renderer only paints on interaction, resize or scroll updates.
- Pixel ratio, antialiasing and shadows are reduced on smaller screens.

These are teaching models, not manufacturer-accurate CAD assets. The copy explains standard component roles and links to manufacturer or standards documentation; it does not claim a particular brand or board revision.

## Visual references and attribution

Each exhibition contains a real hardware photograph plus a supplied visual study. The local files are shown in the section reference rail, while the open-licensed photographs are also shown in the Reference desk:

| File | Use | Credit / license |
| --- | --- | --- |
| `pc-motherboard-photo.jpg` | Motherboard installed in a case | Kurt Kaiser, Wikimedia Commons, CC0 |
| `cooling-waterblock-photo.jpg` | Water block and tubing in a PC | MasterMatt, Wikimedia Commons, public domain |
| `keyboard-keycaps-photo.jpg` | Keycaps and switches | snuci, Wikimedia Commons, public domain |
| `pc-anatomy-reference.jpg` | Provided PC anatomy study | Supplied with the brief |
| `cooling-system-reference.jpg` | Provided cooling study | Supplied with the brief |
| `power-core-reference.jpg` | Provided exploded mechanism study | Supplied with the brief |

The source page for every Wikimedia image is linked in the UI and in `ASSETS.md`. The supplied screenshots are labelled as visual references and are not claimed as photographs of the procedural models. Technical links are rendered beside the relevant component cards and repeated in the Reference desk.

Asset provenance and runtime library notes are documented separately in `ASSETS.md`.

## Run locally

From the repository root:

```sh
python3 -m http.server 4173 --bind 0.0.0.0 --directory hardware-explorer
```

Then open `http://localhost:4173/`.

The scene dependencies are already vendored in `vendor/`; no package installation or lockfile change is required.

## Checks run

```sh
node --check hardware-explorer/app.js
curl -I http://localhost:4173/
```

The JavaScript syntax check and local asset smoke check pass. A headless visual audit was not run because this sandbox does not include Chrome, Puppeteer or Playwright. The intended follow-up is a desktop browser pass at 1440 × 900 and 1280 × 800, then a mobile pass, checking WebGL context creation, backward scroll, reduced motion, keyboard focus and console output.

## Known limitations

- The 3D assets are procedural teaching abstractions, not production GLB/CAD imports.
- The supplied visual references are screenshots/render studies, not part-specific photographs. The page also includes three local CC0 or public-domain hardware photographs for comparison.
- Some external technical links may change their URL or documentation layout over time.
- Raycasting selects a component when a visible mesh is under the pointer; the step cards and previous/next controls are the deterministic accessible path.
