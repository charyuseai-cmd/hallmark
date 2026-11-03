# Assembly assets and licenses

## 3D geometry

The hardware geometry is authored in `app.js` with Three.js primitives. There are no downloaded manufacturer models, textures, CAD files or unlicensed meshes in this prototype. The geometry and educational composition are original project code and are covered by the repository MIT license.

Meaningful scene node names are assigned in the data records, for example `PC_CPU_Socket`, `Cooling_Radiator_Core` and `Keyboard_Mechanical_Switches`. A production version can replace any builder with a GLB loader while keeping those names and the data contract.

## Runtime libraries

- `vendor/three.module.js` is the vendored Three.js module. Three.js is available under the MIT license: <https://github.com/mrdoob/three.js/blob/dev/LICENSE>.
- `vendor/gsap.min.js` and `vendor/ScrollTrigger.min.js` are existing repository assets. GSAP licensing and permitted distribution should be checked before publishing a commercial deployment: <https://gsap.com/licensing/>.

No new dependency or lockfile was introduced for this implementation.

## Local photographs

These three photographs were retrieved from Wikimedia Commons and are used as hardware references, not as 3D textures:

| Local file | Source page | Credit / license |
| --- | --- | --- |
| `assets/references/pc-motherboard-photo.jpg` | <https://commons.wikimedia.org/wiki/File:Computer_motherboard_11.jpg> | Kurt Kaiser, CC0 1.0 Universal Public Domain Dedication |
| `assets/references/cooling-waterblock-photo.jpg` | <https://commons.wikimedia.org/wiki/File:Watercooling_vue_carte_graphique.jpg> | MasterMatt, public domain dedication |
| `assets/references/keyboard-keycaps-photo.jpg` | <https://commons.wikimedia.org/wiki/File:NeXT_ADB_key_caps_and_switches.jpg> | snuci, public domain dedication |

The UI credits each image next to its source link. Check the source pages again before a commercial republish because Commons metadata and local file versions can change.

## Supplied visual studies

The following local files were copied from images supplied with the project brief:

- `assets/references/pc-anatomy-reference.jpg`
- `assets/references/cooling-system-reference.jpg`
- `assets/references/power-core-reference.jpg`

They are labelled **provided visual reference**. They are not asserted to be open-licensed photographs, and they are not used as 3D textures.

## Technical reading

The component cards link to manufacturer or standards documentation including Intel, Micron, Kingston, Corsair, CHERRY, QMK, USB-IF, PCI-SIG, AMD, Noctua, Asetek and Alphacool. Links are kept as citations rather than copied documentation so their current revisions and terms remain visible to learners.
