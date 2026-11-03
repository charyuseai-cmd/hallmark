/* Assembly / hardware anatomy lab
 * One reusable data model powers the educational copy, the camera states and the component names.
 * The 3D objects are procedural teaching models: compact, identifiable and licensed as original code.
 */
import * as THREE from './vendor/three.module.js';

(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = window.matchMedia('(max-width: 820px)').matches;
  const supportsWebGL = (() => {
    try {
      const test = document.createElement('canvas');
      return Boolean(window.WebGLRenderingContext && (test.getContext('webgl') || test.getContext('experimental-webgl')));
    } catch (error) {
      return false;
    }
  })();

  const COLORS = {
    ink: 0xf2f4f5,
    muted: 0x75818d,
    accent: 0xd9ff5a,
    blue: 0x73a9ff,
    blueDeep: 0x264b72,
    orange: 0xff9d70,
    board: 0x1e2b38,
    boardEdge: 0x46667e,
    graphite: 0x28333e,
    graphiteDark: 0x111820,
    steel: 0x8d9ba5,
    steelLight: 0xc3cbd0,
    copper: 0xb57854,
    white: 0xdce7ee,
  };

  const REFERENCES = {
    pc: [
      { src: 'assets/references/pc-motherboard-photo.jpg', label: 'Motherboard in a case', source: 'Kurt Kaiser / Wikimedia Commons · CC0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Computer_motherboard_11.jpg' },
      { src: 'assets/references/pc-anatomy-reference.jpg', label: 'PC anatomy study', source: 'Provided visual reference', sourceUrl: '#sources' },
    ],
    cooling: [
      { src: 'assets/references/cooling-waterblock-photo.jpg', label: 'Water block in a PC', source: 'MasterMatt / Wikimedia Commons · public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Watercooling_vue_carte_graphique.jpg' },
      { src: 'assets/references/cooling-system-reference.jpg', label: 'Exploded cooling study', source: 'Provided visual reference', sourceUrl: '#sources' },
    ],
    keyboard: [
      { src: 'assets/references/keyboard-keycaps-photo.jpg', label: 'Keycaps and switches', source: 'snuci / Wikimedia Commons · public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:NeXT_ADB_key_caps_and_switches.jpg' },
      { src: 'assets/references/power-core-reference.jpg', label: 'Exploded mechanism study', source: 'Provided visual reference', sourceUrl: '#sources' },
    ],
  };

  const source = (label, url) => ({ label, url });

  /* This is the content contract. UI cards, component labels and animation states read the same records. */
  const HARDWARE = {
    pc: {
      key: 'pc',
      name: 'PC anatomy',
      overview: {
        label: 'System overview',
        description: 'A desktop computer is a chain of specialised jobs. The motherboard routes signals, the processor transforms data, memory keeps active work close, and power and cooling make the whole loop possible.',
        primaryFunction: 'Connect the system into one working machine.',
        howItWorks: 'Signals and power move through shared buses, sockets and connectors. No single part is the computer by itself.',
      },
      references: REFERENCES.pc,
      view: {
        overview: { position: [6.8, 5.1, 10.8], target: [0, 0.65, 0.45], rotation: [0.08, -0.24, 0] },
        final: { position: [7.8, 7.4, 12.4], target: [0, 0.7, 0.4], rotation: [0.04, -0.16, 0] },
      },
      components: [
        {
          componentId: 'motherboard', componentName: 'Motherboard', shortName: 'Motherboard',
          description: 'The main circuit board. It gives every other component a physical and electrical place to connect.',
          primaryFunction: 'Route power, data and timing between components.',
          howItWorks: 'Copper traces, sockets and controller hubs form a network. The chipset and buses coordinate traffic between the CPU, memory, storage and expansion slots.',
          relatedComponents: ['CPU', 'RAM', 'GPU', 'Storage'], meshNodeName: 'PC_Motherboard',
          cameraFocus: { position: [5.1, 3.2, 7.1], target: [0, 0.15, 0.2] },
          animationSequence: 'The board remains as the reference plane while the connected modules lift from their sockets.',
          focusOffset: [0, -0.08, 0], explodedOffset: [0, -0.12, 0],
          technicalSources: [source('Intel / motherboard overview', 'https://www.intel.com/content/www/us/en/gaming/resources/motherboard.html')],
        },
        {
          componentId: 'cpu', componentName: 'CPU', shortName: 'Processor',
          description: 'The central processing unit executes instructions and coordinates the work that software asks the computer to do.',
          primaryFunction: 'Decode and execute instructions.',
          howItWorks: 'Control logic moves data through arithmetic and logic units. Caches keep frequently used data near the cores so the processor spends less time waiting on memory.',
          relatedComponents: ['Motherboard', 'RAM', 'Cooling'], meshNodeName: 'PC_CPU_Socket',
          cameraFocus: { position: [-2.9, 2.8, 4.5], target: [-0.95, 0.62, -0.45] },
          animationSequence: 'The cooler rises, exposing the heat spreader and the socket contact field underneath.',
          focusOffset: [-0.1, 0.76, -0.05], explodedOffset: [-0.85, 1.35, -0.45],
          technicalSources: [source('Intel / CPU fundamentals', 'https://www.intel.com/content/www/us/en/gaming/resources/cpu.html')],
        },
        {
          componentId: 'ram', componentName: 'Memory', shortName: 'RAM',
          description: 'Random access memory is the system’s short-term workspace for programs and data that are currently in use.',
          primaryFunction: 'Hold active data close to the processor.',
          howItWorks: 'DRAM stores each bit as electrical charge in a cell. The memory controller repeatedly refreshes those cells and transfers blocks over the memory bus.',
          relatedComponents: ['CPU', 'Motherboard', 'Storage'], meshNodeName: 'PC_DIMM_Memory',
          cameraFocus: { position: [3.6, 2.6, 4.7], target: [1.25, 0.78, -0.22] },
          animationSequence: 'The memory sticks rise from their DIMM slots so their edge connector and chips can be read as one layer.',
          focusOffset: [0.22, 0.72, -0.05], explodedOffset: [1.6, 1.55, -0.6],
          technicalSources: [source('Micron / what is DRAM?', 'https://www.micron.com/about/micron-glossary/what-is-dram')],
        },
        {
          componentId: 'gpu', componentName: 'Graphics processor', shortName: 'GPU',
          description: 'The graphics processing unit performs many parallel calculations for images, video, simulation and other workloads.',
          primaryFunction: 'Process large batches of visual or parallel data.',
          howItWorks: 'Thousands of smaller arithmetic units work on many data elements at once. The card also carries its own memory and power delivery.',
          relatedComponents: ['CPU', 'PCIe slot', 'Power supply'], meshNodeName: 'PC_Graphics_Card',
          cameraFocus: { position: [1.3, 2.5, 5.8], target: [0.15, 0.72, 1.15] },
          animationSequence: 'The long expansion card slides out of its PCIe slot; its fans remain visible as the cooling layer.',
          focusOffset: [0, 0.76, 0.34], explodedOffset: [0.1, 1.75, 1.35],
          technicalSources: [source('NVIDIA / GPU basics', 'https://www.nvidia.com/en-us/geforce/graphics-cards/graphics-cards/'), source('PCI-SIG / PCIe', 'https://pcisig.com/specifications/pciexpress')],
        },
        {
          componentId: 'storage', componentName: 'NVMe storage', shortName: 'Storage',
          description: 'The solid-state drive keeps the operating system, applications and files when the machine is turned off.',
          primaryFunction: 'Provide persistent, fast data storage.',
          howItWorks: 'NAND flash stores charge in memory cells. The controller translates logical addresses, manages wear and moves data over the PCIe bus using NVMe commands.',
          relatedComponents: ['Motherboard', 'RAM', 'Power supply'], meshNodeName: 'PC_NVMe_Drive',
          cameraFocus: { position: [4.4, 2.2, 5.3], target: [2.45, 0.58, 1.7] },
          animationSequence: 'The slim drive lifts from its M.2 stand-off to reveal the controller and flash packages.',
          focusOffset: [0.45, 0.64, 0.18], explodedOffset: [2.65, 1.45, 1.55],
          technicalSources: [source('Kingston / what is NVMe?', 'https://www.kingston.com/en/blog/personal-storage/what-is-nvme')],
        },
        {
          componentId: 'psu', componentName: 'Power supply', shortName: 'PSU',
          description: 'The power supply converts wall power into the regulated low-voltage rails used by the board, processor, drives and graphics card.',
          primaryFunction: 'Deliver stable electrical power.',
          howItWorks: 'Switching electronics rectify and transform incoming AC, then filter and regulate several DC outputs. Protection circuits respond to overloads and faults.',
          relatedComponents: ['Motherboard', 'GPU', 'Cooling'], meshNodeName: 'PC_Power_Supply',
          cameraFocus: { position: [4.7, 3.3, 6.2], target: [2.35, 0.72, 1.75] },
          animationSequence: 'The PSU moves away from the board, leaving its intake fan and modular connector face readable.',
          focusOffset: [0.38, 0.62, 0.28], explodedOffset: [2.45, 0.95, 2.15],
          technicalSources: [source('Intel / desktop power supply guide', 'https://www.intel.com/content/www/us/en/gaming/resources/power-supply.html')],
        },
        {
          componentId: 'cooling', componentName: 'Cooling system', shortName: 'Cooling',
          description: 'The heatsink, fan and airflow path move heat away from the CPU so its silicon can keep operating within its thermal limits.',
          primaryFunction: 'Transfer and reject heat.',
          howItWorks: 'Thermal interface material bridges microscopic gaps. A metal heatsink spreads the heat, while fins and airflow move it into the surrounding air.',
          relatedComponents: ['CPU', 'Case', 'Power supply'], meshNodeName: 'PC_CPU_Cooler',
          cameraFocus: { position: [-2.7, 3.7, 5.1], target: [-0.72, 1.18, -0.38] },
          animationSequence: 'The fan tower rises above the CPU to show the fin stack, fan hub and airflow direction.',
          focusOffset: [-0.35, 0.98, -0.3], explodedOffset: [-1.3, 2.35, -0.6],
          technicalSources: [source('Noctua / CPU cooler principles', 'https://noctua.at/en/which-cpu-cooler-is-right-for-me')],
        },
        {
          componentId: 'case', componentName: 'Case and airflow', shortName: 'Enclosure',
          description: 'The case gives the system structure, protects the components and guides air from intake fans to exhaust fans.',
          primaryFunction: 'Support, protect and ventilate the assembly.',
          howItWorks: 'Panels, mounts and fan positions control the physical layout and pressure path. The enclosure is part of the thermal design, not just a shell.',
          relatedComponents: ['Cooling', 'Motherboard', 'Power supply'], meshNodeName: 'PC_Case_Frame',
          cameraFocus: { position: [6.4, 4.3, 9.7], target: [0, 0.72, 0.45] },
          animationSequence: 'The outer frame drifts back to expose the inner arrangement before the final assembly returns.',
          focusOffset: [0, 0.25, 0], explodedOffset: [0, 2.5, -1.1],
          technicalSources: [source('Intel / PC cooling basics', 'https://www.intel.com/content/www/us/en/gaming/resources/cpu-cooler.html')],
        },
      ],
    },
    cooling: {
      key: 'cooling',
      name: 'Cooling loop',
      overview: {
        label: 'Thermal overview',
        description: 'An all-in-one liquid cooler moves heat through a closed loop. The pump pushes coolant across the cold plate, through tubes, and into a radiator where fans release the heat.',
        primaryFunction: 'Move heat away from a hot processor and into air.',
        howItWorks: 'Conduction, fluid circulation and convection happen in sequence. Each layer has a different job, but the temperature path is one continuous loop.',
      },
      references: REFERENCES.cooling,
      view: {
        overview: { position: [5.8, 4.7, 8.6], target: [0.2, 0.65, 0], rotation: [0.08, -0.32, 0] },
        final: { position: [6.4, 6.4, 10.2], target: [0.2, 0.65, 0], rotation: [0.02, -0.22, 0] },
      },
      components: [
        {
          componentId: 'cold-plate', componentName: 'Cold plate', shortName: 'Cold plate',
          description: 'The cold plate is the metal contact surface that sits against the processor and receives heat from it.',
          primaryFunction: 'Conduct heat from the CPU into the coolant path.',
          howItWorks: 'A thin copper or nickel-plated base spreads heat across microchannels. Thermal compound fills tiny air gaps between the processor and plate.',
          relatedComponents: ['Pump', 'Thermal interface', 'CPU'], meshNodeName: 'Cooling_Cold_Plate',
          cameraFocus: { position: [3.4, 2.4, 4.6], target: [-1.35, 0.1, 0] },
          animationSequence: 'The base turns slightly downward and lifts from the pump body so the contact face can be read.',
          focusOffset: [-0.1, 0.5, 0], explodedOffset: [-1.7, 1.15, 0.2],
          technicalSources: [source('Corsair / liquid cooling', 'https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/what-is-liquid-cooling/')],
        },
        {
          componentId: 'pump', componentName: 'Pump and impeller', shortName: 'Pump',
          description: 'The pump keeps coolant moving. Its impeller turns electrical energy into a pressure difference inside the loop.',
          primaryFunction: 'Circulate coolant continuously.',
          howItWorks: 'A motor spins an impeller inside the pump chamber. The rotating blades pull fluid in and push it toward the outlet without opening the sealed loop.',
          relatedComponents: ['Cold plate', 'Coolant tubes', 'Radiator'], meshNodeName: 'Cooling_Pump_Housing',
          cameraFocus: { position: [2.8, 2.8, 4.5], target: [0, 0.64, 0] },
          animationSequence: 'The top housing rises and the impeller disk turns a fraction to make the flow source visible.',
          focusOffset: [0, 0.65, 0], explodedOffset: [0, 1.4, 0],
          technicalSources: [source('Asetek / liquid cooling explained', 'https://www.asetek.com/gaming/technology/')],
        },
        {
          componentId: 'coolant', componentName: 'Coolant path', shortName: 'Coolant path',
          description: 'The sealed fluid path carries thermal energy from the cold plate to the radiator and back again.',
          primaryFunction: 'Transport heat through the loop.',
          howItWorks: 'A water-based mixture absorbs heat at the plate, travels through flexible tubing, releases heat in the radiator, and returns cooler to the pump.',
          relatedComponents: ['Pump', 'Radiator', 'Cold plate'], meshNodeName: 'Cooling_Coolant_Tubes',
          cameraFocus: { position: [4.1, 3.1, 5.8], target: [1.0, 0.75, 0] },
          animationSequence: 'The tubes brighten and lift from the housing, turning the hidden flow path into the highlighted route.',
          focusOffset: [0.25, 0.65, 0.1], explodedOffset: [1.1, 1.8, 0.1],
          technicalSources: [source('Intel / thermal design power', 'https://www.intel.com/content/www/us/en/support/articles/000055611/processors.html')],
        },
        {
          componentId: 'radiator', componentName: 'Radiator', shortName: 'Radiator',
          description: 'The radiator is a finned heat exchanger. It spreads the coolant’s heat across a large metal surface.',
          primaryFunction: 'Increase the surface area available to reject heat.',
          howItWorks: 'Thin fins conduct heat from internal channels. Air passing through the fin stack carries that heat away from the metal.',
          relatedComponents: ['Fans', 'Coolant path', 'Case'], meshNodeName: 'Cooling_Radiator_Core',
          cameraFocus: { position: [4.9, 3.4, 6.8], target: [2.55, 0.7, 0] },
          animationSequence: 'The radiator slides out from the fan plane so its channels, fins and end tank read as separate layers.',
          focusOffset: [0.55, 0.65, 0], explodedOffset: [2.25, 1.15, 0.25],
          technicalSources: [source('Alphacool / radiator basics', 'https://www.alphacool.com/en/radiators')],
        },
        {
          componentId: 'fans', componentName: 'Radiator fans', shortName: 'Fans',
          description: 'The fans push air through the radiator fins. Their speed is controlled according to temperature and the cooling profile.',
          primaryFunction: 'Move air across the heat exchanger.',
          howItWorks: 'Rotating blades create a pressure difference that drives airflow. More airflow can move more heat, but increases power use and noise.',
          relatedComponents: ['Radiator', 'Case', 'Power supply'], meshNodeName: 'Cooling_Radiator_Fans',
          cameraFocus: { position: [4.5, 2.9, 5.7], target: [2.4, 0.75, 0.15] },
          animationSequence: 'The fan discs separate from the radiator and pivot slightly to reveal the blade pitch and motor hubs.',
          focusOffset: [0.42, 0.9, 0.18], explodedOffset: [2.4, 1.9, 0.7],
          technicalSources: [source('Noctua / fan terminology', 'https://noctua.at/en/products/fan')],
        },
        {
          componentId: 'mount', componentName: 'Mount and interface', shortName: 'Mount',
          description: 'The mounting hardware keeps the block flat against the processor with the right amount of contact pressure.',
          primaryFunction: 'Hold the thermal interface in a stable, even contact.',
          howItWorks: 'A bracket distributes force around the socket. Screws and a backplate prevent the cooler from shifting while the board flexes under load.',
          relatedComponents: ['Cold plate', 'Thermal interface', 'Motherboard'], meshNodeName: 'Cooling_Mounting_Hardware',
          cameraFocus: { position: [3.6, 2.6, 5.0], target: [-0.5, 0.16, 0] },
          animationSequence: 'The screws and mounting ring spread from the plate to show how the force path closes the contact stack.',
          focusOffset: [-0.4, 0.48, 0], explodedOffset: [-0.4, -0.2, 1.25],
          technicalSources: [source('AMD / socket installation guide', 'https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html')],
        },
      ],
    },
    keyboard: {
      key: 'keyboard',
      name: 'Mechanical keyboard',
      overview: {
        label: 'Input overview',
        description: 'A mechanical key is a stack of physical layers. Your finger moves a cap, the switch moves a stem, metal contacts close a circuit, and the controller reports a position to the computer.',
        primaryFunction: 'Turn a physical press into a digital input event.',
        howItWorks: 'The keyboard scans a matrix of rows and columns. When a switch closes, the controller identifies the intersection and sends a coded report over USB.',
      },
      references: REFERENCES.keyboard,
      view: {
        overview: { position: [6.1, 5.2, 9.2], target: [0, 0.4, 0], rotation: [0.18, -0.28, 0] },
        final: { position: [7.1, 7.2, 11.1], target: [0, 0.4, 0], rotation: [0.14, -0.2, 0] },
      },
      components: [
        {
          componentId: 'case', componentName: 'Keyboard case', shortName: 'Case',
          description: 'The case gives the keyboard its shape and stiffness. It supports the plate, PCB and electronics beneath the keys.',
          primaryFunction: 'Protect and support the key mechanism.',
          howItWorks: 'The top and bottom shells distribute typing force and hold the internal stack in alignment. Feet change the typing angle.',
          relatedComponents: ['Plate', 'PCB', 'Gaskets'], meshNodeName: 'Keyboard_Case',
          cameraFocus: { position: [5.4, 3.1, 7.3], target: [0, 0.05, 0] },
          animationSequence: 'The outer shell drops away from the stack, exposing the mounting points and internal cavity.',
          focusOffset: [0, -0.1, 0], explodedOffset: [0, -1.0, 0],
          technicalSources: [source('QMK / keyboard hardware', 'https://docs.qmk.fm/feature_matrix')],
        },
        {
          componentId: 'plate', componentName: 'Switch plate', shortName: 'Plate',
          description: 'The plate is the rigid sheet that holds each switch in a precise grid and gives a press its structural feel.',
          primaryFunction: 'Position switches and control flex.',
          howItWorks: 'Cut-outs capture the switch housings. The plate may be metal, polycarbonate or another material, changing stiffness and sound.',
          relatedComponents: ['Switches', 'Keycaps', 'PCB'], meshNodeName: 'Keyboard_Switch_Plate',
          cameraFocus: { position: [4.0, 2.7, 5.2], target: [0, 0.45, 0] },
          animationSequence: 'The plate rises above the PCB while a small group of switches stays seated in its cut-outs.',
          focusOffset: [0, 0.62, 0], explodedOffset: [0, 0.95, 0],
          technicalSources: [source('Keyboard University / plates', 'https://www.keyboard.university/100-courses/keyboard-parts-101-4x9cs')],
        },
        {
          componentId: 'switches', componentName: 'Mechanical switches', shortName: 'Switches',
          description: 'The switch is the moving mechanism under each key. Its spring controls return force and its contacts register the press.',
          primaryFunction: 'Convert travel into a repeatable electrical closure.',
          howItWorks: 'A stem slides inside the housing, compressing a spring. Near the bottom of the travel, two metal leaves meet and change the matrix signal.',
          relatedComponents: ['Keycaps', 'Plate', 'PCB'], meshNodeName: 'Keyboard_Mechanical_Switches',
          cameraFocus: { position: [2.3, 2.0, 3.8], target: [0.1, 0.85, 0.15] },
          animationSequence: 'A few switch bodies rise out of the plate; one stem extends to make the travel path legible.',
          focusOffset: [0.15, 0.88, 0.15], explodedOffset: [0.25, 1.55, 0.3],
          technicalSources: [source('CHERRY / MX switches', 'https://www.cherry.de/en-us/products/mx-switches')],
        },
        {
          componentId: 'keycaps', componentName: 'Keycaps', shortName: 'Keycaps',
          description: 'Keycaps are the touch surface and visual map of the keyboard. Their stem connects the cap to the switch.',
          primaryFunction: 'Transfer a finger’s force to the switch stem.',
          howItWorks: 'The cap’s cross-shaped mount fits over the stem. Shape, height and material change finger position, sound and the tactile surface.',
          relatedComponents: ['Switches', 'Stabilizers', 'Plate'], meshNodeName: 'Keyboard_Keycaps',
          cameraFocus: { position: [3.2, 3.1, 4.8], target: [0.15, 1.08, 0.05] },
          animationSequence: 'The keycap field lifts as a single layer, leaving the switch stems visible below.',
          focusOffset: [0, 1.05, 0], explodedOffset: [0.8, 2.15, -0.2],
          technicalSources: [source('Keychron / keycap guide', 'https://www.keychron.com/blogs/news/keycap-profile')],
        },
        {
          componentId: 'pcb', componentName: 'PCB and matrix', shortName: 'PCB',
          description: 'The printed circuit board carries the switch contacts, row and column traces, diodes, and the controller connection.',
          primaryFunction: 'Sense switch closures and route the signals.',
          howItWorks: 'A scan cycle drives one matrix line at a time and reads the others. Diodes reduce ghosting so multiple keys can be identified reliably.',
          relatedComponents: ['Switches', 'Controller', 'USB'], meshNodeName: 'Keyboard_PCB_Matrix',
          cameraFocus: { position: [3.8, 1.8, 5.5], target: [0, 0.18, 0] },
          animationSequence: 'The PCB lowers out of the stack and its copper-like scan traces brighten as a network.',
          focusOffset: [0, -0.18, 0], explodedOffset: [-0.45, -0.25, 0.7],
          technicalSources: [source('QMK / matrix scanning', 'https://docs.qmk.fm/how_a_matrix_works')],
        },
        {
          componentId: 'stabilizers', componentName: 'Stabilizers', shortName: 'Stabilizers',
          description: 'Stabilizers keep wide keys such as Space and Enter level, so both ends travel together instead of twisting.',
          primaryFunction: 'Balance long keycaps across their width.',
          howItWorks: 'A central mount is linked to outer housings by a wire or bar. Pressing one side transfers motion to the other side.',
          relatedComponents: ['Keycaps', 'Plate', 'Switches'], meshNodeName: 'Keyboard_Stabilizers',
          cameraFocus: { position: [4.2, 2.1, 5.2], target: [0, 0.55, 0.78] },
          animationSequence: 'The stabilizer wire pivots forward from the plate, exposing the two outer housings and central stem.',
          focusOffset: [0, 0.72, 0.72], explodedOffset: [-1.7, 1.35, 0.75],
          technicalSources: [source('Keyboard University / stabilizers', 'https://www.keyboard.university/100-courses/keyboard-parts-101-4x9cs')],
        },
        {
          componentId: 'controller', componentName: 'Controller and USB', shortName: 'Controller',
          description: 'The controller is the small computer on the board. It scans the matrix and sends the resulting key codes to the host.',
          primaryFunction: 'Translate switch states into USB input reports.',
          howItWorks: 'Firmware maps each row-column intersection to a key. The USB interface packages the result into reports that the operating system understands.',
          relatedComponents: ['PCB', 'Switches', 'Computer'], meshNodeName: 'Keyboard_Controller_USB',
          cameraFocus: { position: [4.8, 2.8, 6.5], target: [2.5, 0.32, 0.15] },
          animationSequence: 'The controller board slides from the rear edge and the USB port turns toward the viewer.',
          focusOffset: [0.5, 0.65, 0], explodedOffset: [2.45, 1.2, -0.1],
          technicalSources: [source('USB-IF / documents', 'https://www.usb.org/documents')],
        },
      ],
    },
  };

  Object.values(HARDWARE).forEach((device) => {
    device.components.forEach((component) => { component.referenceImages = device.references; });
  });
  window.ASSEMBLY_HARDWARE_DATA = HARDWARE;

  const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const lerp = (a, b, t) => a + (b - a) * t;
  const vec = (arr) => new THREE.Vector3(arr[0], arr[1], arr[2]);

  function makeMaterial(color, options = {}) {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.58,
      metalness: options.metalness ?? 0.18,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0,
    });
    material.userData.baseOpacity = options.opacity ?? 1;
    material.userData.baseColor = color;
    material.userData.baseEmissive = options.emissive ?? 0x000000;
    return material;
  }

  function registerMesh(group, mesh, componentId, edgeColor = null) {
    mesh.userData.componentId = componentId;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.userData.meshes.push(mesh);
    group.add(mesh);
    if (edgeColor) {
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.28 }),
      );
      edge.position.copy(mesh.position);
      edge.rotation.copy(mesh.rotation);
      edge.scale.copy(mesh.scale);
      edge.userData.isEdge = true;
      group.add(edge);
    }
    return mesh;
  }

  function componentGroup(component, index) {
    const group = new THREE.Group();
    group.name = component.meshNodeName;
    group.userData = {
      componentId: component.componentId,
      componentIndex: index,
      home: new THREE.Vector3(),
      focusOffset: vec(component.focusOffset || [0, 0.6, 0]),
      explodedOffset: vec(component.explodedOffset || [0, 1, 0]),
      meshes: [],
    };
    return group;
  }

  function addBox(group, componentId, size, position, options = {}) {
    const material = options.material || makeMaterial(options.color ?? COLORS.graphite, options);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    if (options.rotation) mesh.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
    return registerMesh(group, mesh, componentId, options.edgeColor ?? null);
  }

  function addCylinder(group, componentId, radius, height, position, options = {}) {
    const material = options.material || makeMaterial(options.color ?? COLORS.steel, options);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, options.segments ?? 32), material);
    mesh.position.set(position[0], position[1], position[2]);
    if (options.rotation) mesh.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
    return registerMesh(group, mesh, componentId, options.edgeColor ?? null);
  }

  function addTorus(group, componentId, radius, tube, position, options = {}) {
    const material = options.material || makeMaterial(options.color ?? COLORS.steel, options);
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 40), material);
    mesh.position.set(position[0], position[1], position[2]);
    if (options.rotation) mesh.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
    return registerMesh(group, mesh, componentId, options.edgeColor ?? null);
  }

  function addTube(group, componentId, points, radius, options = {}) {
    const material = options.material || makeMaterial(options.color ?? COLORS.blue, options);
    const curve = new THREE.CatmullRomCurve3(points.map((point) => vec(point)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 10, false), material);
    return registerMesh(group, mesh, componentId, null);
  }

  function addTexturedFan(group, componentId, center, radius, color = COLORS.graphiteDark) {
    addCylinder(group, componentId, radius, 0.12, center, { color, metalness: .55, roughness: .4 });
    for (let i = 0; i < 7; i += 1) {
      const angle = (Math.PI * 2 * i) / 7;
      addBox(group, componentId, [radius * .92, .07, .17], [center[0] + Math.cos(angle) * radius * .45, center[1] + .08, center[2] + Math.sin(angle) * radius * .45], {
        color: COLORS.steel, metalness: .5, roughness: .42, rotation: [0, -angle, angle * .18],
      });
    }
    addCylinder(group, componentId, radius * .18, .17, [center[0], center[1] + .1, center[2]], { color: COLORS.orange, metalness: .7, roughness: .32 });
  }

  function buildPC(data) {
    const rig = new THREE.Group();
    rig.name = 'PC_Assembly';
    const groups = [];
    const add = (component, build) => {
      const index = data.components.indexOf(component);
      const group = componentGroup(component, index);
      build(group, component.componentId);
      rig.add(group);
      groups.push(group);
      return group;
    };
    const c = Object.fromEntries(data.components.map((component) => [component.componentId, component]));

    add(c.motherboard, (g, id) => {
      addBox(g, id, [7.8, .18, 5.2], [0, 0, 0], { color: COLORS.board, metalness: .2, roughness: .72, edgeColor: COLORS.boardEdge });
      addBox(g, id, [1.65, .1, 1.7], [-.9, .16, -.42], { color: COLORS.graphiteDark, metalness: .5, roughness: .43, edgeColor: COLORS.steel });
      for (let row = 0; row < 4; row += 1) addBox(g, id, [.16, .06, 1.65], [1.55 + row * .34, .16, -.35], { color: COLORS.graphiteDark, metalness: .3, roughness: .52 });
      for (let row = 0; row < 3; row += 1) addBox(g, id, [4.6, .055, .055], [-.05, .15, -1.65 + row * .23], { color: COLORS.copper, metalness: .7, roughness: .37 });
      for (let row = 0; row < 4; row += 1) addBox(g, id, [2.2, .055, .055], [-1.0 + row * .1, .15, 1.25 + row * .25], { color: COLORS.copper, metalness: .7, roughness: .37 });
      addBox(g, id, [1.1, .45, .75], [-3.1, .3, -1.8], { color: COLORS.graphite, metalness: .44, roughness: .46 });
      addBox(g, id, [.22, .45, 1.7], [-3.7, .3, -.5], { color: COLORS.steel, metalness: .55, roughness: .4 });
      addBox(g, id, [3.3, .08, .12], [.0, .2, 2.1], { color: COLORS.blueDeep, metalness: .32, roughness: .5 });
    });

    add(c.cpu, (g, id) => {
      addBox(g, id, [1.78, .12, 1.72], [0, 0, 0], { color: COLORS.graphiteDark, metalness: .5, roughness: .36, edgeColor: COLORS.steel });
      addBox(g, id, [1.28, .1, 1.23], [0, .13, 0], { color: COLORS.steelLight, metalness: .72, roughness: .3 });
      addBox(g, id, [1.02, .04, .97], [0, .2, 0], { color: COLORS.blueDeep, metalness: .38, roughness: .36 });
      for (let i = 0; i < 4; i += 1) addBox(g, id, [1.55, .06, .06], [0, .27 + i * .1, -.5 + i * .3], { color: COLORS.steel, metalness: .68, roughness: .35 });
    });

    add(c.ram, (g, id) => {
      for (let i = 0; i < 4; i += 1) {
        const x = i * .38 - .57;
        addBox(g, id, [.24, 1.3, .14], [x, .64, 0], { color: i % 2 ? COLORS.blue : COLORS.blueDeep, metalness: .38, roughness: .43, edgeColor: COLORS.steel });
        for (let chip = 0; chip < 4; chip += 1) addBox(g, id, [.12, .14, .04], [x, .43 + chip * .24, -.085], { color: COLORS.graphiteDark, metalness: .55, roughness: .35 });
        addBox(g, id, [.2, .04, .03], [x, .035, 0], { color: COLORS.copper, metalness: .8, roughness: .26 });
      }
    });

    add(c.gpu, (g, id) => {
      addBox(g, id, [5.15, .38, 1.28], [0, 0, 0], { color: COLORS.graphite, metalness: .58, roughness: .35, edgeColor: COLORS.steel });
      addBox(g, id, [5.0, .1, .08], [0, .23, -.54], { color: COLORS.steel, metalness: .7, roughness: .34 });
      addTexturedFan(g, id, [-1.35, .28, 0], .43);
      addTexturedFan(g, id, [1.35, .28, 0], .43);
      addBox(g, id, [.08, .56, 1.18], [-2.62, .16, 0], { color: COLORS.steelLight, metalness: .65, roughness: .3 });
      addBox(g, id, [.45, .5, .07], [2.23, .18, .55], { color: COLORS.orange, metalness: .5, roughness: .36 });
    });

    add(c.storage, (g, id) => {
      addBox(g, id, [1.8, .08, .58], [0, 0, 0], { color: COLORS.graphiteDark, metalness: .55, roughness: .37, edgeColor: COLORS.steel });
      addBox(g, id, [.34, .07, .35], [-.48, .08, 0], { color: COLORS.blue, metalness: .35, roughness: .42 });
      addBox(g, id, [.47, .07, .35], [.12, .08, 0], { color: COLORS.steel, metalness: .7, roughness: .35 });
      addBox(g, id, [.25, .07, .35], [.6, .08, 0], { color: COLORS.blueDeep, metalness: .45, roughness: .38 });
    });

    add(c.psu, (g, id) => {
      addBox(g, id, [2.25, 1.25, 1.8], [0, 0, 0], { color: COLORS.graphiteDark, metalness: .6, roughness: .4, edgeColor: COLORS.steel });
      addTexturedFan(g, id, [0, .66, 0], .56);
      addBox(g, id, [.05, .5, .5], [1.12, .22, -.42], { color: COLORS.blue, metalness: .55, roughness: .3 });
      addBox(g, id, [.05, .5, .5], [1.12, .22, .18], { color: COLORS.blue, metalness: .55, roughness: .3 });
    });

    add(c.cooling, (g, id) => {
      for (let i = 0; i < 7; i += 1) addBox(g, id, [1.55, .12, .12], [0, .18 + i * .14, -.6 + i * .01], { color: COLORS.steel, metalness: .68, roughness: .4 });
      addTexturedFan(g, id, [0, .7, .02], .66);
      addBox(g, id, [1.7, .08, 1.6], [0, .1, 0], { color: COLORS.graphiteDark, metalness: .5, roughness: .45 });
    });

    add(c.case, (g, id) => {
      const rails = [
        [[-4.2, .3, -2.9], [4.2, .3, -2.9]], [[-4.2, .3, 2.9], [4.2, .3, 2.9]],
        [[-4.2, .3, -2.9], [-4.2, .3, 2.9]], [[4.2, .3, -2.9], [4.2, .3, 2.9]],
        [[-4.2, 3.0, -2.9], [4.2, 3.0, -2.9]], [[-4.2, 3.0, 2.9], [4.2, 3.0, 2.9]],
        [[-4.2, .3, -2.9], [-4.2, 3.0, -2.9]], [[4.2, .3, -2.9], [4.2, 3.0, -2.9]],
      ];
      rails.forEach(([a, b]) => {
        const midPoint = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        const size = [Math.abs(a[0] - b[0]) || .08, Math.abs(a[1] - b[1]) || .08, Math.abs(a[2] - b[2]) || .08];
        if (size[0] < .1) size[0] = .08;
        if (size[1] < .1) size[1] = .08;
        if (size[2] < .1) size[2] = .08;
        addBox(g, id, size, midPoint, { color: COLORS.steel, metalness: .75, roughness: .3 });
      });
      addBox(g, id, [8.15, 2.65, .035], [0, 1.65, -2.84], { color: COLORS.blueDeep, metalness: .1, roughness: .18, transparent: true, opacity: .19 });
    });

    const homes = [
      [-0.0, 0, 0], [-.95, .42, -.45], [1.4, .44, -.35], [0, .7, 1.13], [2.35, .38, 1.7], [-2.35, .82, 1.72], [-.95, 1.25, -.45], [0, .2, 0],
    ];
    groups.forEach((group, index) => { group.userData.home.copy(vec(homes[index])); group.position.copy(group.userData.home); });
    return { rig, groups };
  }

  function buildCooling(data) {
    const rig = new THREE.Group();
    rig.name = 'Cooling_Assembly';
    const groups = [];
    const add = (component, build) => {
      const index = data.components.indexOf(component);
      const group = componentGroup(component, index);
      build(group, component.componentId);
      rig.add(group);
      groups.push(group);
      return group;
    };
    const c = Object.fromEntries(data.components.map((component) => [component.componentId, component]));

    add(c['cold-plate'], (g, id) => {
      addCylinder(g, id, 1.16, .18, [0, 0, 0], { color: COLORS.copper, metalness: .8, roughness: .28, edgeColor: COLORS.steel });
      addCylinder(g, id, .85, .08, [0, .13, 0], { color: COLORS.steelLight, metalness: .72, roughness: .3 });
      for (let i = 0; i < 8; i += 1) addBox(g, id, [.055, .035, 1.2], [-.46 + i * .13, .21, 0], { color: COLORS.steel, metalness: .7, roughness: .34 });
    });

    add(c.pump, (g, id) => {
      addCylinder(g, id, .84, .52, [-1.15, .34, 0], { color: COLORS.graphite, metalness: .62, roughness: .34, edgeColor: COLORS.steel });
      addCylinder(g, id, .5, .08, [-1.15, .64, 0], { color: COLORS.blueDeep, metalness: .5, roughness: .28 });
      addCylinder(g, id, .16, .1, [-1.15, .7, 0], { color: COLORS.accent, metalness: .4, roughness: .3 });
      addTorus(g, id, .6, .035, [-1.15, .68, 0], { color: COLORS.steel, metalness: .8, roughness: .26 });
    });

    add(c.coolant, (g, id) => {
      const tube = makeMaterial(COLORS.blue, { metalness: .25, roughness: .2, transparent: true, opacity: .82, emissive: COLORS.blueDeep, emissiveIntensity: .3 });
      addTube(g, id, [[-.8, .5, .28], [-.2, .9, .65], [1.6, 1.0, .72], [2.1, .82, .48]], .115, { material: tube });
      addTube(g, id, [[-.8, .2, -.28], [-.1, -.05, -.65], [1.62, -.1, -.72], [2.1, .34, -.45]], .115, { material: tube });
    });

    add(c.radiator, (g, id) => {
      addBox(g, id, [2.8, 1.85, .3], [2.35, .65, 0], { color: COLORS.steel, metalness: .7, roughness: .36, edgeColor: COLORS.steelLight });
      for (let i = 0; i < 18; i += 1) addBox(g, id, [.07, 1.62, .16], [1.05 + i * .15, .65, -.17], { color: i % 2 ? COLORS.graphite : COLORS.steelLight, metalness: .56, roughness: .42 });
      addCylinder(g, id, .22, .2, [1.0, 1.05, 0], { color: COLORS.copper, metalness: .8, roughness: .28, rotation: [Math.PI / 2, 0, 0] });
      addCylinder(g, id, .22, .2, [3.7, .24, 0], { color: COLORS.copper, metalness: .8, roughness: .28, rotation: [Math.PI / 2, 0, 0] });
    });

    add(c.fans, (g, id) => {
      addTexturedFan(g, id, [1.65, .67, .34], .65, COLORS.graphiteDark);
      addTexturedFan(g, id, [3.05, .67, .34], .65, COLORS.graphiteDark);
    });

    add(c.mount, (g, id) => {
      addBox(g, id, [2.15, .1, 1.78], [-1.15, -.15, 0], { color: COLORS.graphiteDark, metalness: .65, roughness: .38, edgeColor: COLORS.steel });
      [[-.98, -.83], [-.98, .83], [-1.32, -.83], [-1.32, .83]].forEach(([x, z]) => addCylinder(g, id, .09, .5, [x, .05, z], { color: COLORS.steelLight, metalness: .8, roughness: .26 }));
      addBox(g, id, [1.7, .05, .08], [-1.15, .18, -.83], { color: COLORS.orange, metalness: .55, roughness: .35 });
    });

    const homes = [[-0.5, .05, 0], [-1.15, .45, 0], [0, .55, 0], [2.35, .65, 0], [2.35, .65, .34], [-1.15, -.08, 0]];
    groups.forEach((group, index) => { group.userData.home.copy(vec(homes[index])); group.position.copy(group.userData.home); });
    return { rig, groups };
  }

  function buildKeyboard(data) {
    const rig = new THREE.Group();
    rig.name = 'Keyboard_Assembly';
    const groups = [];
    const add = (component, build) => {
      const index = data.components.indexOf(component);
      const group = componentGroup(component, index);
      build(group, component.componentId);
      rig.add(group);
      groups.push(group);
      return group;
    };
    const c = Object.fromEntries(data.components.map((component) => [component.componentId, component]));

    add(c.case, (g, id) => {
      addBox(g, id, [7.0, .42, 2.72], [0, 0, 0], { color: COLORS.graphiteDark, metalness: .58, roughness: .42, edgeColor: COLORS.steel });
      addBox(g, id, [6.65, .1, 2.35], [0, .25, 0], { color: COLORS.graphite, metalness: .4, roughness: .52 });
      addBox(g, id, [.28, .24, 2.45], [-3.32, .38, 0], { color: COLORS.steel, metalness: .62, roughness: .35 });
      addBox(g, id, [.28, .24, 2.45], [3.32, .38, 0], { color: COLORS.steel, metalness: .62, roughness: .35 });
    });

    add(c.plate, (g, id) => {
      addBox(g, id, [6.55, .1, 2.28], [0, .48, 0], { color: COLORS.steel, metalness: .72, roughness: .32, edgeColor: COLORS.steelLight });
      for (let row = 0; row < 4; row += 1) for (let col = 0; col < 13; col += 1) addBox(g, id, [.39, .04, .39], [-2.9 + col * .48, .55, -.76 + row * .5], { color: COLORS.graphiteDark, metalness: .3, roughness: .5 });
    });

    add(c.pcb, (g, id) => {
      addBox(g, id, [6.35, .12, 2.2], [0, .27, 0], { color: COLORS.board, metalness: .2, roughness: .7, edgeColor: COLORS.boardEdge });
      for (let row = 0; row < 5; row += 1) addBox(g, id, [5.85, .03, .035], [0, .36, -.83 + row * .4], { color: COLORS.copper, metalness: .72, roughness: .32 });
      addBox(g, id, [.9, .08, .65], [2.4, .4, .18], { color: COLORS.blueDeep, metalness: .45, roughness: .38 });
    });

    add(c.switches, (g, id) => {
      for (let row = 0; row < 4; row += 1) for (let col = 0; col < 13; col += 1) {
        const x = -2.9 + col * .48;
        const z = -.76 + row * .5;
        addBox(g, id, [.31, .32, .31], [x, .72, z], { color: COLORS.graphiteDark, metalness: .5, roughness: .4 });
        addCylinder(g, id, .08, .08, [x, .91, z], { color: COLORS.orange, metalness: .34, roughness: .35 });
      }
    });

    add(c.keycaps, (g, id) => {
      const widths = [13, 13, 12, 11];
      for (let row = 0; row < widths.length; row += 1) {
        const count = widths[row];
        const offset = row * .18;
        for (let col = 0; col < count; col += 1) {
          const x = -2.9 + offset + col * .48;
          const z = -.76 + row * .5;
          const width = (row === 3 && col === count - 1) ? .72 : .41;
          addBox(g, id, [width, .22, .4], [x, 1.08, z], { color: row === 0 ? COLORS.steelLight : COLORS.steel, metalness: .25, roughness: .46, edgeColor: COLORS.white });
        }
      }
      addBox(g, id, [2.3, .22, .4], [.05, 1.08, 1.18], { color: COLORS.steel, metalness: .25, roughness: .46, edgeColor: COLORS.white });
    });

    add(c.stabilizers, (g, id) => {
      const wire = makeMaterial(COLORS.orange, { metalness: .72, roughness: .28 });
      addTube(g, id, [[-1.05, .92, 1.18], [-1.05, .92, 1.42], [1.05, .92, 1.42], [1.05, .92, 1.18]], .035, { material: wire });
      addBox(g, id, [.24, .18, .28], [-1.05, .82, 1.16], { color: COLORS.graphiteDark, metalness: .48, roughness: .38 });
      addBox(g, id, [.24, .18, .28], [1.05, .82, 1.16], { color: COLORS.graphiteDark, metalness: .48, roughness: .38 });
    });

    add(c.controller, (g, id) => {
      addBox(g, id, [1.0, .16, .7], [2.48, .48, 0], { color: COLORS.blue, metalness: .35, roughness: .42, edgeColor: COLORS.steel });
      addBox(g, id, [.34, .22, .42], [3.08, .48, 0], { color: COLORS.steelLight, metalness: .7, roughness: .3 });
      addBox(g, id, [.42, .08, .08], [2.35, .6, -.3], { color: COLORS.orange, metalness: .5, roughness: .3 });
    });

    const homes = [[0, .05, 0], [0, .52, 0], [0, .31, 0], [0, .72, 0], [0, .98, 0], [0, .82, .03], [0, .45, 0]];
    groups.forEach((group, index) => { group.userData.home.copy(vec(homes[index])); group.position.copy(group.userData.home); });
    return { rig, groups };
  }

  function addEnvironment(scene, key) {
    const floor = new THREE.Mesh(new THREE.CircleGeometry(key === 'pc' ? 7.5 : 6.4, 64), new THREE.MeshStandardMaterial({ color: 0x0b1118, roughness: .82, metalness: .08, transparent: true, opacity: .84 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = key === 'keyboard' ? -.45 : -.55;
    floor.receiveShadow = true;
    scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(key === 'pc' ? 4.1 : 3.2, key === 'pc' ? 4.12 : 3.22, 64), new THREE.MeshBasicMaterial({ color: 0x29425c, transparent: true, opacity: .2, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = floor.position.y + .01;
    scene.add(ring);
  }

  class LabScene {
    constructor(section, data) {
      this.section = section;
      this.data = data;
      this.canvas = section.querySelector('[data-scene-canvas]');
      this.active = false;
      this.progress = 0;
      this.currentIndex = 0;
      this.needsRender = true;
      this.renderer = null;
      this.scrollTrigger = null;
      this.groups = [];
      this.meshes = [];
      this.raycaster = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      this.setup();
    }

    setup() {
      if (!supportsWebGL) {
        this.section.classList.add('no-webgl');
        this.section.querySelectorAll('[data-webgl-note]').forEach((note) => { note.hidden = false; });
        return;
      }
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: !lowPower, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.8));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.08;
        this.renderer.shadowMap.enabled = !lowPower;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
        this.camera.position.set(...this.data.view.overview.position);
        this.scene.add(new THREE.HemisphereLight(0x9bb9d8, 0x090d13, 1.7));
        const key = new THREE.DirectionalLight(0xe7eff8, 3.1);
        key.position.set(-5, 9, 7);
        key.castShadow = !lowPower;
        key.shadow.mapSize.set(1024, 1024);
        this.scene.add(key);
        const rim = new THREE.DirectionalLight(COLORS.blue, 2.2);
        rim.position.set(7, 4, -7);
        this.scene.add(rim);
        const accent = new THREE.PointLight(COLORS.accent, 10, 18);
        accent.position.set(-1, 4, 4);
        this.scene.add(accent);
        addEnvironment(this.scene, this.data.key);

        const built = this.data.key === 'pc' ? buildPC(this.data) : this.data.key === 'cooling' ? buildCooling(this.data) : buildKeyboard(this.data);
        this.rig = built.rig;
        this.groups = built.groups;
        this.groups.forEach((group) => { group.traverse((node) => { if (node.isMesh && node.userData.componentId) this.meshes.push(node); }); });
        this.scene.add(this.rig);
        this.states = this.buildStates();
        this.bindCanvas();
        this.resize();
        this.applyProgress(0);
      } catch (error) {
        console.warn('Assembly 3D scene unavailable', error);
        this.section.classList.add('no-webgl');
        this.section.querySelectorAll('[data-webgl-note]').forEach((note) => { note.hidden = false; });
      }
    }

    buildStates() {
      const states = [{ camera: this.data.view.overview, offsets: this.groups.map(() => new THREE.Vector3()), active: -1 }];
      this.data.components.forEach((component, index) => {
        const offsets = this.groups.map(() => new THREE.Vector3());
        offsets[index].copy(this.groups[index].userData.focusOffset);
        states.push({ camera: component.cameraFocus, offsets, active: index });
      });
      states.push({ camera: this.data.view.final, offsets: this.groups.map((group) => group.userData.explodedOffset.clone()), active: -1 });
      states.push({ camera: this.data.view.final, offsets: this.groups.map(() => new THREE.Vector3()), active: -1 });
      return states;
    }

    bindCanvas() {
      if (!this.canvas) return;
      this.canvas.addEventListener('pointerdown', (event) => {
        if (!this.active) {
          this.activate();
          return;
        }
        if (!this.renderer) return;
        const bounds = this.canvas.getBoundingClientRect();
        this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hits = this.raycaster.intersectObjects(this.meshes, false);
        if (!hits.length) return;
        let node = hits[0].object;
        while (node && !Number.isInteger(node.userData.componentIndex) && node.parent) node = node.parent;
        if (node && Number.isInteger(node.userData.componentIndex)) this.goToIndex(node.userData.componentIndex + 1);
      });
      this.canvas.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (!this.active) this.activate();
        }
      });
    }

    activate() {
      if (this.active) return;
      this.active = true;
      this.section.classList.add('is-activated');
      this.section.querySelectorAll('[data-activation-status]').forEach((element) => { element.textContent = 'scroll-linked / active'; });
      if (!reducedMotion && this.renderer && this.progress < 0.015) {
        gsap.to(this, {
          progress: 0.045,
          duration: 0.85,
          ease: 'power2.out',
          overwrite: true,
          onUpdate: () => this.applyProgress(this.progress),
        });
      } else {
        this.applyProgress(this.progress);
      }
      if (this.scrollTrigger) this.scrollTrigger.update();
    }

    resize() {
      if (!this.renderer || !this.canvas) return;
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;
      if (!width || !height) return;
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.needsRender = true;
      this.render();
    }

    applyProgress(progress) {
      this.progress = Math.max(0, Math.min(1, progress));
      if (!this.renderer) return;
      if (!this.active) {
        this.setState(0, 0);
        this.updateUI(0);
        return;
      }
      const total = this.states.length - 1;
      const raw = this.progress * total;
      const fromIndex = Math.min(total - 1, Math.floor(raw));
      const toIndex = Math.min(total, fromIndex + 1);
      const local = raw - fromIndex;
      this.setState(fromIndex, local, toIndex);
      const activeIndex = Math.min(total, Math.round(raw));
      this.updateUI(activeIndex);
    }

    setState(fromIndex, local, toIndex = fromIndex + 1) {
      const from = this.states[fromIndex];
      const to = this.states[toIndex] || from;
      const cameraPosition = vec(from.camera.position).lerp(vec(to.camera.position), local);
      const cameraTarget = vec(from.camera.target).lerp(vec(to.camera.target), local);
      this.camera.position.copy(cameraPosition);
      this.camera.lookAt(cameraTarget);
      this.camera.fov = lerp(from.camera.fov || 34, to.camera.fov || 34, local);
      this.camera.updateProjectionMatrix();
      const rotation = from.camera.rotation.map((value, index) => lerp(value, (to.camera.rotation || from.camera.rotation)[index], local));
      this.rig.rotation.set(rotation[0], rotation[1], rotation[2]);
      this.groups.forEach((group, index) => {
        const offset = from.offsets[index].clone().lerp(to.offsets[index], local);
        group.position.copy(group.userData.home).add(offset);
        group.rotation.x = lerp(fromIndex === index + 1 ? -.04 : 0, toIndex === index + 1 ? -.04 : 0, local);
        const selected = (Math.round(lerp(from.active, to.active, local)) === index) && from.active !== -1 && to.active !== -1;
        this.styleGroup(group, selected, from.active === -1 && to.active === -1);
      });
      this.needsRender = true;
      this.render();
    }

    styleGroup(group, selected, overview) {
      group.userData.meshes.forEach((mesh) => {
        const material = mesh.material;
        if (!material || !material.userData) return;
        const base = material.userData.baseOpacity ?? 1;
        const opacity = overview ? base : selected ? base : base * .24;
        material.opacity = opacity;
        material.transparent = opacity < 1 || base < 1;
        material.emissive.setHex(selected ? COLORS.accent : material.userData.baseEmissive);
        material.emissiveIntensity = selected ? .34 : 0;
      });
    }

    updateUI(index) {
      const max = this.states ? this.states.length - 1 : this.data.components.length + 2;
      const finalIndex = max;
      const summaryIndex = this.data.components.length + 1;
      const component = index > 0 && index <= this.data.components.length ? this.data.components[index - 1] : null;
      const label = component ? component.componentName : index === summaryIndex ? 'exploded system map' : index === finalIndex ? 'complete assembly' : this.data.overview.label;
      const kicker = component ? `Focus / ${component.shortName}` : index === summaryIndex ? 'Final / system map' : index === finalIndex ? 'Complete / reassembled' : this.data.key === 'pc' ? 'Full assembly' : this.data.key === 'cooling' ? 'Loop overview' : 'Keyboard overview';
      this.currentIndex = index;
      this.section.querySelectorAll('[data-scene-label]').forEach((element) => { element.textContent = label.toLowerCase(); });
      this.section.querySelectorAll('[data-scene-kicker]').forEach((element) => { element.textContent = kicker; });
      this.section.querySelectorAll('[data-scene-progress]').forEach((element) => { element.textContent = `${String(index).padStart(2, '0')} / ${String(max).padStart(2, '0')}`; });
      this.section.querySelectorAll('[data-step-index]').forEach((element) => element.classList.toggle('is-active', Number(element.dataset.stepIndex) === index));
      this.section.querySelectorAll('[data-stage-prev]').forEach((button) => { button.disabled = index <= 0; });
      this.section.querySelectorAll('[data-stage-next]').forEach((button) => { button.disabled = index >= max; });
    }

    render() {
      if (!this.renderer || !this.needsRender || document.hidden) return;
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
    }

    goToIndex(index) {
      if (!this.active) this.activate();
      const max = this.states ? this.states.length - 1 : this.data.components.length + 2;
      const nextIndex = Math.max(0, Math.min(max, index));
      if (!this.scrollTrigger) {
        this.currentIndex = nextIndex;
        this.updateUI(nextIndex);
        const card = this.section.querySelector(`[data-step-index="${nextIndex}"]`);
        card?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      const destination = this.scrollTrigger.start + (this.scrollTrigger.end - this.scrollTrigger.start) * (nextIndex / max);
      window.scrollTo({ top: destination, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  function renderSteps(section, data) {
    const list = section.querySelector('[data-step-list]');
    if (!list) return;
    const items = [{ ...data.overview, componentId: 'overview', shortName: 'Overview', relatedComponents: data.components.map((component) => component.shortName), technicalSources: [] }, ...data.components, {
      componentId: 'summary', componentName: 'Exploded system map', shortName: 'System map',
      description: `The ${data.name.toLowerCase()} opens into a map of cooperating layers. Read the positions, then continue one step to see the complete assembly again.`,
      primaryFunction: 'See how the components form one system.',
      howItWorks: data.components.map((component) => component.shortName).join(' · ') + ' form a readable chain of jobs.',
      relatedComponents: data.components.slice(0, 4).map((component) => component.shortName), technicalSources: [],
    }, {
      componentId: 'complete', componentName: 'Assembly complete', shortName: 'Complete',
      description: `The ${data.name.toLowerCase()} is back together. You can revisit any component or continue to the next exhibition.`,
      primaryFunction: 'Hold the system in a working arrangement.',
      howItWorks: 'The final view restores the original positions so the relationship between layers can be remembered as one machine.',
      relatedComponents: data.components.slice(0, 4).map((component) => component.shortName), technicalSources: [],
    }];
    list.innerHTML = items.map((item, index) => {
      const sources = (item.technicalSources || []).map((link) => `<a href="${escapeHTML(link.url)}" target="_blank" rel="noreferrer">${escapeHTML(link.label)} ↗</a>`).join('');
      const related = (item.relatedComponents || []).map((label) => `<span>${escapeHTML(label)}</span>`).join('');
      const isFinal = item.componentId === 'summary' || item.componentId === 'complete';
      const isOverview = item.componentId === 'overview';
      return `<article class="learning-step ${isFinal ? 'final-step' : ''}" data-step-index="${index}" id="${data.key}-${escapeHTML(item.componentId)}">
        <div class="step-kicker mono"><span>${isOverview ? 'START HERE' : isFinal ? 'REASSEMBLE' : 'COMPONENT FOCUS'}</span><span class="step-kicker__no">${String(index).padStart(2, '0')} / ${String(items.length - 1).padStart(2, '0')}</span></div>
        <h3>${escapeHTML(item.componentName || item.label)}</h3>
        <p class="learning-step__description">${escapeHTML(item.description)}</p>
        <div class="step-details">
          <div class="step-detail"><span class="step-detail__label">Primary function</span><p>${escapeHTML(item.primaryFunction)}</p></div>
          <div class="step-detail"><span class="step-detail__label">How it works</span><p>${escapeHTML(item.howItWorks)}</p></div>
          <div class="step-detail"><span class="step-detail__label">3D sequence</span><p>${escapeHTML(item.animationSequence || 'The model remains assembled while the learning sequence introduces the next layer.')}</p></div>
        </div>
        <div class="step-related" aria-label="Related components">${related}</div>
        ${sources ? `<div class="step-sources"><span class="step-detail__label">Read more</span>${sources}</div>` : ''}
      </article>`;
    }).join('');
  }

  function renderReferences(section, data) {
    const rail = section.querySelector('[data-reference-rail]');
    if (!rail) return;
    rail.innerHTML = `<div class="reference-rail__head"><strong>Visual references</strong><span>photos and studies</span></div><div class="reference-rail__grid">${data.references.map((reference, index) => `<a class="reference-thumb" href="${escapeHTML(reference.sourceUrl || '#sources')}" ${reference.sourceUrl && reference.sourceUrl.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}><figure><img src="${escapeHTML(reference.src)}" alt="${escapeHTML(reference.label)}" loading="lazy"><figcaption><span class="mono">REF / 0${index + 1}</span><span><strong>${escapeHTML(reference.label)}</strong><small>${escapeHTML(reference.source)}</small></span></figcaption></figure></a>`).join('')}</div>`;
  }

  const scenes = [];
  document.querySelectorAll('[data-lab]').forEach((section) => {
    const key = section.dataset.lab;
    const data = HARDWARE[key];
    if (!data) return;
    renderSteps(section, data);
    renderReferences(section, data);
    section.querySelectorAll('[data-copy-count]').forEach((element) => { element.textContent = `${String(data.components.length).padStart(2, '0')} nodes`; });
    const scene = new LabScene(section, data);
    scenes.push(scene);

    section.querySelectorAll('[data-activate]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        scene.activate();
        scene.canvas?.focus({ preventScroll: true });
      });
    });
    section.querySelectorAll('[data-stage-prev]').forEach((button) => button.addEventListener('click', () => scene.goToIndex(scene.currentIndex - 1)));
    section.querySelectorAll('[data-stage-next]').forEach((button) => button.addEventListener('click', () => scene.goToIndex(scene.currentIndex + 1)));

    if (!scene.renderer) return;
    scene.scrollTrigger = ScrollTrigger.create({
      id: `assembly-${key}`,
      trigger: section.querySelector('.lab-layout'),
      start: 'top top+=90',
      end: () => `+=${Math.max(window.innerHeight * (data.components.length + 1) * .82, 1900)}`,
      scrub: reducedMotion ? false : .65,
      invalidateOnRefresh: true,
      onUpdate: (self) => scene.applyProgress(self.progress),
      onRefresh: (self) => scene.applyProgress(self.progress),
    });
    scene.applyProgress(scene.scrollTrigger.progress);
  });

  const goToStep = (event) => {
    const target = event.target.closest('[data-step-index]');
    if (!target) return;
    const section = target.closest('[data-lab]');
    const scene = scenes.find((item) => item.section === section);
    if (!scene) return;
    const index = Number(target.dataset.stepIndex);
    if (!scene.active) scene.activate();
    scene.goToIndex(index);
  };
  document.querySelectorAll('[data-step-list]').forEach((list) => list.addEventListener('click', goToStep));

  const onResize = () => scenes.forEach((scene) => scene.resize());
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scenes.forEach((scene) => { scene.needsRender = true; scene.render(); }); });

  if (reducedMotion) document.body.classList.add('reduced-motion');
  if (!supportsWebGL) document.body.classList.add('no-webgl-global');
  requestAnimationFrame(() => scenes.forEach((scene) => scene.render()));
})();
