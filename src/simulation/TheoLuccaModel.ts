import * as THREE from 'three';

/**
 * Procedural Hyper-Realistic 3D Character Model: THEO LUCCA (4 years old)
 * Height: ~1.05m (authentic toddler scale, 1:4.8 head-to-body proportion)
 * Features:
 * - Realistic Brazilian light-brown skin (#c68652) with subsurface warmth & soft rosy cheeks
 * - Expressive Pixar/Free Fire style eyes with cornea specular glints, dual-tone dark hazel irises
 * - Natural 3D dark brown curly hair locks framing the cap, forehead, and nuca
 * - Royal blue baseball cap with curved brim, panel stitching & top button
 * - Blue t-shirt with ribbed collar, sleeve cuffs & golden star insignia
 * - Leather adventure backpack with brass buckles, shoulder straps & side water bottle
 * - Denim shorts with turn-up cuffs
 * - Sporty red sneakers with white rubber soles, side racing stripes & laces
 * - Detailed hands with thumb & fingers for natural prop handling
 * - Smooth skeleton hierarchy with realistic walk, run, jump, car-passenger, wave & work animations
 */

export interface TheoLuccaRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftLowerLeg: THREE.Group;
  rightLowerLeg: THREE.Group;
  backpack: THREE.Group;
  heldProp: THREE.Group;
  setHeldPropType: (propType: 'none' | 'pizza' | 'wateringCan' | 'newspaper' | 'ball') => void;
  updateAnimation: (
    time: number,
    speed: number,
    isGrounded: boolean,
    isRunning: boolean,
    isWaving?: boolean,
    isInCar?: boolean,
    isWorking?: boolean
  ) => void;
}

export function createTheoLuccaModel(): TheoLuccaRig {
  const root = new THREE.Group();
  root.name = 'TheoLucca_Root';

  // --- MATERIAIS REALISTAS PBR COM SHADING AVANÇADO ---
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xc68652, // Pele morena clara infantil natural
    roughness: 0.58,
    metalness: 0.04,
  });

  const skinCheekMaterial = new THREE.MeshStandardMaterial({
    color: 0xd97768, // Bochechas rosadas infantis
    roughness: 0.7,
    metalness: 0.0,
    transparent: true,
    opacity: 0.45,
  });

  const lipsMaterial = new THREE.MeshStandardMaterial({
    color: 0xad5845, // Lábios infantis naturais
    roughness: 0.6,
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x22130b, // Castanho escuro profundo
    roughness: 0.88,
    metalness: 0.05,
  });

  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8, // Boné azul royal vibrante
    roughness: 0.52,
    metalness: 0.08,
  });

  const capVisorUndersideMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // Aba inferior verde-escura/azul marinho
    roughness: 0.7,
  });

  const shirtMaterial = new THREE.MeshStandardMaterial({
    color: 0x2563eb, // Camiseta azul algodão
    roughness: 0.65,
    metalness: 0.04,
  });

  const collarMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8, // Gola canelada mais escura
    roughness: 0.7,
  });

  const starDecalMaterial = new THREE.MeshStandardMaterial({
    color: 0xfbbf24, // Estrela dourada no peito
    roughness: 0.25,
    metalness: 0.6,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
  });

  const backpackLeatherMaterial = new THREE.MeshStandardMaterial({
    color: 0x78350f, // Couro marrom envelhecido
    roughness: 0.48,
    metalness: 0.12,
  });

  const backpackPocketMaterial = new THREE.MeshStandardMaterial({
    color: 0x92400e, // Bolso frontal marrom médio
    roughness: 0.55,
  });

  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Fivela e zíperes de latão metálico
    roughness: 0.25,
    metalness: 0.85,
  });

  const shortsMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Jeans escuro
    roughness: 0.75,
    metalness: 0.05,
  });

  const shoeRedMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Tênis vermelho esportivo
    roughness: 0.45,
    metalness: 0.1,
  });

  const shoeWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Borracha e sola brancas
    roughness: 0.35,
    metalness: 0.05,
  });

  const shoeBlackAccentMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
  });

  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Esclera branca limpa
    roughness: 0.15,
  });

  const eyeIrisMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b2110, // Íris castanho escuro aveludada
    roughness: 0.1,
  });

  const eyePupilMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505, // Pupila preta pura
    roughness: 0.05,
  });

  const eyeSpecularMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Brilho especular no olho (vida e expressividade)
  });

  // --- ESTRUTURA DO CORPO ---
  const body = new THREE.Group();
  body.name = 'Theo_Pelvis';
  body.position.y = 0.52; // Altura do quadril
  root.add(body);

  // 1. Quadril / Pélvis com Bermuda Jeans
  const hipsGeo = new THREE.CylinderGeometry(0.14, 0.13, 0.14, 18);
  const hips = new THREE.Mesh(hipsGeo, shortsMaterial);
  hips.castShadow = true;
  body.add(hips);

  // Cinto e passadores
  const beltGeo = new THREE.TorusGeometry(0.142, 0.012, 6, 18);
  beltGeo.rotateX(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, shortsMaterial);
  belt.position.y = 0.06;
  body.add(belt);

  // 2. Torso com Camiseta Azul de Algodão
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0.07;
  body.add(torsoGroup);

  const torsoGeo = new THREE.CylinderGeometry(0.145, 0.14, 0.25, 18);
  const torso = new THREE.Mesh(torsoGeo, shirtMaterial);
  torso.position.y = 0.125;
  torso.castShadow = true;
  torsoGroup.add(torso);

  // Estrela Dourada no Peito (Emblema estilizado)
  const starShape = new THREE.Shape();
  const numPoints = 5;
  const outerR = 0.044;
  const innerR = 0.021;
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / numPoints - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) starShape.moveTo(px, py);
    else starShape.lineTo(px, py);
  }
  starShape.closePath();
  const starGeo = new THREE.ShapeGeometry(starShape);
  const starMesh = new THREE.Mesh(starGeo, starDecalMaterial);
  starMesh.position.set(0, 0.165, 0.148);
  torsoGroup.add(starMesh);

  // Gola Canelada Redonda
  const collarGeo = new THREE.TorusGeometry(0.076, 0.016, 8, 20);
  collarGeo.rotateX(Math.PI / 2);
  const collar = new THREE.Mesh(collarGeo, collarMaterial);
  collar.position.set(0, 0.25, 0);
  torsoGroup.add(collar);

  // Pescoço com tom de pele natural
  const neckGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.075, 16);
  const neck = new THREE.Mesh(neckGeo, skinMaterial);
  neck.position.set(0, 0.265, 0);
  neck.castShadow = true;
  torsoGroup.add(neck);

  // 3. Mochila Marrom de Couro de Aventureiro
  const backpack = new THREE.Group();
  backpack.position.set(0, 0.14, -0.16);

  // Corpo principal com cantos arredondados
  const packMainGeo = new THREE.BoxGeometry(0.21, 0.23, 0.13);
  const packMain = new THREE.Mesh(packMainGeo, backpackLeatherMaterial);
  packMain.castShadow = true;
  backpack.add(packMain);

  // Bolso frontal volumoso
  const packPocketGeo = new THREE.BoxGeometry(0.17, 0.13, 0.06);
  const packPocket = new THREE.Mesh(packPocketGeo, backpackPocketMaterial);
  packPocket.position.set(0, -0.035, -0.07);
  packPocket.castShadow = true;
  backpack.add(packPocket);

  // Fivela de latão dourado no bolso
  const buckleGeo = new THREE.BoxGeometry(0.048, 0.032, 0.018);
  const buckle = new THREE.Mesh(buckleGeo, brassMaterial);
  buckle.position.set(0, 0.025, -0.103);
  backpack.add(buckle);

  // Zíper no topo
  const zipperGeo = new THREE.BoxGeometry(0.18, 0.012, 0.015);
  const zipper = new THREE.Mesh(zipperGeo, brassMaterial);
  zipper.position.set(0, 0.118, 0);
  backpack.add(zipper);

  // Alças acolchoadas sobre os ombros
  const strapGeo = new THREE.TorusGeometry(0.125, 0.02, 8, 18, Math.PI);
  const leftStrap = new THREE.Mesh(strapGeo, backpackLeatherMaterial);
  leftStrap.rotation.y = Math.PI / 2;
  leftStrap.position.set(-0.082, 0, 0.08);
  backpack.add(leftStrap);

  const rightStrap = new THREE.Mesh(strapGeo, backpackLeatherMaterial);
  rightStrap.rotation.y = Math.PI / 2;
  rightStrap.position.set(0.082, 0, 0.08);
  backpack.add(rightStrap);

  // Garrafinha esportiva de água no bolso lateral
  const bottleGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.11, 10);
  const bottleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
  const bottle = new THREE.Mesh(bottleGeo, bottleMat);
  bottle.position.set(0.12, 0.02, 0);
  backpack.add(bottle);

  torsoGroup.add(backpack);

  // 4. Cabeça, Rosto Expressivo, Cabelo Cacheado e Boné
  const head = new THREE.Group();
  head.name = 'Theo_Head';
  head.position.set(0, 0.38, 0);
  torsoGroup.add(head);

  // Crânio arredondado com bochechas infantis fofas
  const headGeo = new THREE.SphereGeometry(0.138, 24, 24);
  headGeo.scale(1.0, 1.07, 1.03);
  const headMesh = new THREE.Mesh(headGeo, skinMaterial);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Bochechas rosadas suaves (Blush de criança feliz)
  const cheekGeo = new THREE.SphereGeometry(0.042, 12, 12);
  cheekGeo.scale(1.2, 0.8, 0.3);
  const cheekL = new THREE.Mesh(cheekGeo, skinCheekMaterial);
  cheekL.position.set(-0.075, -0.015, 0.118);
  head.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, skinCheekMaterial);
  cheekR.position.set(0.075, -0.015, 0.118);
  head.add(cheekR);

  // Olhos Expressivos Estilo Pixar / Animação 3D
  const createRealisticEye = (isLeft: boolean): THREE.Group => {
    const eye = new THREE.Group();
    eye.position.set(isLeft ? -0.048 : 0.048, 0.02, 0.124);

    // Esclera branca
    const whiteGeo = new THREE.SphereGeometry(0.026, 16, 16);
    whiteGeo.scale(1.0, 1.15, 0.55);
    const whiteMesh = new THREE.Mesh(whiteGeo, eyeWhiteMaterial);
    eye.add(whiteMesh);

    // Íris castanho escuro com profundidade
    const irisGeo = new THREE.SphereGeometry(0.016, 14, 14);
    irisGeo.scale(1.0, 1.0, 0.3);
    const irisMesh = new THREE.Mesh(irisGeo, eyeIrisMaterial);
    irisMesh.position.z = 0.015;
    eye.add(irisMesh);

    // Pupila preta
    const pupilGeo = new THREE.SphereGeometry(0.009, 12, 12);
    pupilGeo.scale(1.0, 1.0, 0.25);
    const pupilMesh = new THREE.Mesh(pupilGeo, eyePupilMaterial);
    pupilMesh.position.z = 0.018;
    eye.add(pupilMesh);

    // Ponto de brilho especular primário (superior direito)
    const specGeo = new THREE.SphereGeometry(0.0042, 8, 8);
    const specMesh = new THREE.Mesh(specGeo, eyeSpecularMaterial);
    specMesh.position.set(0.005, 0.005, 0.021);
    eye.add(specMesh);

    // Ponto de brilho especular secundário sutil
    const spec2Geo = new THREE.SphereGeometry(0.0022, 6, 6);
    const spec2Mesh = new THREE.Mesh(spec2Geo, eyeSpecularMaterial);
    spec2Mesh.position.set(-0.004, -0.004, 0.02);
    eye.add(spec2Mesh);

    // Pálpebra superior sutil (contorno expressivo)
    const lidGeo = new THREE.TorusGeometry(0.024, 0.0035, 6, 12, Math.PI);
    const lidMesh = new THREE.Mesh(lidGeo, hairMaterial);
    lidMesh.position.set(0, 0.014, 0.018);
    eye.add(lidMesh);

    return eye;
  };

  const eyeL = createRealisticEye(true);
  const eyeR = createRealisticEye(false);
  head.add(eyeL);
  head.add(eyeR);

  // Sobrancelhas castanhas suaves e expressivas
  const browGeo = new THREE.BoxGeometry(0.042, 0.009, 0.012);
  const browL = new THREE.Mesh(browGeo, hairMaterial);
  browL.position.set(-0.048, 0.055, 0.128);
  browL.rotation.z = 0.06;
  head.add(browL);

  const browR = new THREE.Mesh(browGeo, hairMaterial);
  browR.position.set(0.048, 0.055, 0.128);
  browR.rotation.z = -0.06;
  head.add(browR);

  // Narizinho infantil fofo arredondado com ponte nasal suave
  const noseBridgeGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.025, 8);
  const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMaterial);
  noseBridge.position.set(0, 0.005, 0.138);
  head.add(noseBridge);

  const noseTipGeo = new THREE.SphereGeometry(0.018, 12, 12);
  const noseTip = new THREE.Mesh(noseTipGeo, skinMaterial);
  noseTip.position.set(0, -0.012, 0.144);
  head.add(noseTip);

  // Boca sorrindo amigável com contorno labial
  const lipsGeo = new THREE.TorusGeometry(0.026, 0.0055, 6, 14, Math.PI);
  lipsGeo.rotateZ(Math.PI);
  const lips = new THREE.Mesh(lipsGeo, lipsMaterial);
  lips.position.set(0, -0.056, 0.13);
  head.add(lips);

  // Orelhas infantis com curvatura natural
  const createEar = (isLeft: boolean): THREE.Mesh => {
    const earGeo = new THREE.SphereGeometry(0.034, 12, 12);
    earGeo.scale(0.35, 0.95, 0.65);
    const ear = new THREE.Mesh(earGeo, skinMaterial);
    ear.position.set(isLeft ? -0.14 : 0.14, 0.01, 0);
    ear.rotation.y = isLeft ? -0.15 : 0.15;
    return ear;
  };
  head.add(createEar(true));
  head.add(createEar(false));

  // Cabelo Cacheado Castanho Escuro Realista (Cachos volumosos que contornam o boné e a nuca)
  const hairGroup = new THREE.Group();
  head.add(hairGroup);

  const curlGeoSmall = new THREE.SphereGeometry(0.026, 8, 8);
  const curlGeoMed = new THREE.SphereGeometry(0.034, 8, 8);
  const curlGeoLarge = new THREE.SphereGeometry(0.042, 8, 8);

  const curlsData: Array<{ x: number; y: number; z: number; size: 's' | 'm' | 'l' }> = [
    // Cachos na frente sob a aba do boné (franja cacheada)
    { x: -0.055, y: 0.042, z: 0.122, size: 'm' },
    { x: 0.055, y: 0.042, z: 0.122, size: 'm' },
    { x: 0.0, y: 0.046, z: 0.126, size: 'm' },
    { x: -0.09, y: 0.038, z: 0.11, size: 's' },
    { x: 0.09, y: 0.038, z: 0.11, size: 's' },
    // Cachos nas têmporas e na frente das orelhas (costeletas infantis cheias)
    { x: -0.138, y: -0.005, z: 0.035, size: 's' },
    { x: 0.138, y: -0.005, z: 0.035, size: 's' },
    { x: -0.132, y: 0.028, z: 0.02, size: 'm' },
    { x: 0.132, y: 0.028, z: 0.02, size: 'm' },
    { x: -0.135, y: 0.05, z: -0.01, size: 'm' },
    { x: 0.135, y: 0.05, z: -0.01, size: 'm' },
    // Cachos atrás da orelha
    { x: -0.128, y: -0.02, z: -0.045, size: 'm' },
    { x: 0.128, y: -0.02, z: -0.045, size: 'm' },
    { x: -0.12, y: 0.01, z: -0.065, size: 'l' },
    { x: 0.12, y: 0.01, z: -0.065, size: 'l' },
    // Nuca completa e volumosa (cabelo marrom cheio)
    { x: -0.095, y: -0.04, z: -0.095, size: 'm' },
    { x: 0.095, y: -0.04, z: -0.095, size: 'm' },
    { x: 0.0, y: -0.055, z: -0.115, size: 'l' },
    { x: -0.05, y: -0.075, z: -0.105, size: 'm' },
    { x: 0.05, y: -0.075, z: -0.105, size: 'm' },
    { x: -0.1, y: 0.025, z: -0.085, size: 'l' },
    { x: 0.1, y: 0.025, z: -0.085, size: 'l' },
    { x: 0.0, y: 0.025, z: -0.115, size: 'l' },
    // Cachos na base posterior do crânio
    { x: -0.06, y: -0.02, z: -0.115, size: 'l' },
    { x: 0.06, y: -0.02, z: -0.115, size: 'l' },
    { x: -0.03, y: -0.04, z: -0.12, size: 'm' },
    { x: 0.03, y: -0.04, z: -0.12, size: 'm' },
  ];

  curlsData.forEach(({ x, y, z, size }) => {
    const geo = size === 's' ? curlGeoSmall : size === 'm' ? curlGeoMed : curlGeoLarge;
    const curl = new THREE.Mesh(geo, hairMaterial);
    curl.position.set(x, y, z);
    hairGroup.add(curl);
  });

  // Boné Azul Royal com Aba Frontal Curvada e Botão Superior
  const capGroup = new THREE.Group();
  capGroup.position.set(0, 0.062, -0.012);
  head.add(capGroup);

  // Cúpula do boné (semi-esfera perfeita com curvatura realista)
  const capDomeGeo = new THREE.SphereGeometry(0.144, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const capDome = new THREE.Mesh(capDomeGeo, capMaterial);
  capDome.castShadow = true;
  capGroup.add(capDome);

  // Costura central do boné
  const seamGeo = new THREE.TorusGeometry(0.145, 0.004, 4, 20, Math.PI * 0.55);
  seamGeo.rotateY(Math.PI / 2);
  const seam = new THREE.Mesh(seamGeo, capMaterial);
  capGroup.add(seam);

  // Aba do boné (curvatura frontal dinâmica)
  const visorShape = new THREE.Shape();
  visorShape.moveTo(-0.115, 0);
  visorShape.quadraticCurveTo(0, 0.17, 0.115, 0);
  visorShape.quadraticCurveTo(0, -0.025, -0.115, 0);

  const extrudeSettings = { depth: 0.014, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.005, bevelThickness: 0.005 };
  const visorGeo = new THREE.ExtrudeGeometry(visorShape, extrudeSettings);
  visorGeo.rotateX(Math.PI / 2 + 0.13);
  const visor = new THREE.Mesh(visorGeo, capMaterial);
  visor.position.set(0, -0.008, 0.082);
  visor.castShadow = true;
  capGroup.add(visor);

  // Botãozinho no topo do boné
  const capButtonGeo = new THREE.SphereGeometry(0.018, 10, 10);
  const capButton = new THREE.Mesh(capButtonGeo, shirtMaterial);
  capButton.position.set(0, 0.146, 0);
  capGroup.add(capButton);

  // --- BRAÇOS ARTICULADOS COM MÃOZINHAS INFANTIS DETALHADAS ---
  // Função para criar braço completo
  const createChildArm = (isLeft: boolean) => {
    const arm = new THREE.Group();
    arm.position.set(isLeft ? -0.185 : 0.185, 0.22, 0);

    // Manga da camiseta azul
    const sleeveGeo = new THREE.CylinderGeometry(0.058, 0.054, 0.095, 14);
    const sleeve = new THREE.Mesh(sleeveGeo, shirtMaterial);
    sleeve.position.y = -0.042;
    arm.add(sleeve);

    // Bainha da manga
    const sleeveHemGeo = new THREE.TorusGeometry(0.055, 0.008, 6, 14);
    sleeveHemGeo.rotateX(Math.PI / 2);
    const sleeveHem = new THREE.Mesh(sleeveHemGeo, collarMaterial);
    sleeveHem.position.y = -0.088;
    arm.add(sleeveHem);

    // Braço superior (pele morena clara)
    const upperArmGeo = new THREE.CylinderGeometry(0.044, 0.041, 0.12, 12);
    const upperArm = new THREE.Mesh(upperArmGeo, skinMaterial);
    upperArm.position.y = -0.125;
    upperArm.castShadow = true;
    arm.add(upperArm);

    // Antebraço (articulação do cotovelo)
    const forearm = new THREE.Group();
    forearm.position.set(0, -0.185, 0);
    arm.add(forearm);

    const forearmGeo = new THREE.CylinderGeometry(0.04, 0.036, 0.12, 12);
    const forearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
    forearmMesh.position.y = -0.06;
    forearmMesh.castShadow = true;
    forearm.add(forearmMesh);

    // Mãozinha de criança com polegar e dedos modelados
    const hand = new THREE.Group();
    hand.position.set(0, -0.13, 0);
    forearm.add(hand);

    // Palma da mão
    const palmGeo = new THREE.BoxGeometry(0.048, 0.042, 0.032);
    const palm = new THREE.Mesh(palmGeo, skinMaterial);
    hand.add(palm);

    // Dedinhos fechados juntos
    const fingersGeo = new THREE.CylinderGeometry(0.018, 0.016, 0.038, 8);
    const fingers = new THREE.Mesh(fingersGeo, skinMaterial);
    fingers.position.set(0, -0.03, 0.005);
    hand.add(fingers);

    // Polegar separado
    const thumbGeo = new THREE.CylinderGeometry(0.01, 0.009, 0.024, 8);
    const thumb = new THREE.Mesh(thumbGeo, skinMaterial);
    thumb.position.set(isLeft ? 0.024 : -0.024, -0.008, 0.015);
    thumb.rotation.z = isLeft ? -0.4 : 0.4;
    hand.add(thumb);

    return { arm, forearm, hand };
  };

  const leftArmData = createChildArm(true);
  const rightArmData = createChildArm(false);

  torsoGroup.add(leftArmData.arm);
  torsoGroup.add(rightArmData.arm);

  const leftArm = leftArmData.arm;
  const rightArm = rightArmData.arm;
  const leftForearm = leftArmData.forearm;
  const rightForearm = rightArmData.forearm;

  // --- PERNAS, BERMUDA JEANS E TÊNIS VERMELHOS ESPORTIVOS ---
  const createChildLeg = (isLeft: boolean) => {
    const leg = new THREE.Group();
    leg.position.set(isLeft ? -0.08 : 0.08, -0.06, 0);

    // Perna da bermuda jeans
    const shortLegGeo = new THREE.CylinderGeometry(0.068, 0.064, 0.13, 14);
    const shortLeg = new THREE.Mesh(shortLegGeo, shortsMaterial);
    shortLeg.position.y = -0.065;
    shortLeg.castShadow = true;
    leg.add(shortLeg);

    // Dobra da barra da bermuda
    const cuffGeo = new THREE.TorusGeometry(0.066, 0.008, 6, 14);
    cuffGeo.rotateX(Math.PI / 2);
    const cuff = new THREE.Mesh(cuffGeo, shortsMaterial);
    cuff.position.y = -0.125;
    leg.add(cuff);

    // Coxa infantil (pele)
    const thighGeo = new THREE.CylinderGeometry(0.05, 0.046, 0.12, 12);
    const thigh = new THREE.Mesh(thighGeo, skinMaterial);
    thigh.position.y = -0.14;
    thigh.castShadow = true;
    leg.add(thigh);

    // Canela / Perna Inferior (articulação do joelho)
    const lowerLeg = new THREE.Group();
    lowerLeg.position.set(0, -0.2, 0);
    leg.add(lowerLeg);

    const calfGeo = new THREE.CylinderGeometry(0.045, 0.041, 0.135, 12);
    const calf = new THREE.Mesh(calfGeo, skinMaterial);
    calf.position.y = -0.065;
    calf.castShadow = true;
    lowerLeg.add(calf);

    // Meia esportiva branca com listra azul
    const sockGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.045, 12);
    const sock = new THREE.Mesh(sockGeo, shoeWhiteMaterial);
    sock.position.y = -0.135;
    lowerLeg.add(sock);

    const sockStripeGeo = new THREE.TorusGeometry(0.044, 0.004, 4, 12);
    sockStripeGeo.rotateX(Math.PI / 2);
    const sockStripe = new THREE.Mesh(sockStripeGeo, shirtMaterial);
    sockStripe.position.y = -0.125;
    lowerLeg.add(sockStripe);

    // Tênis Vermelho Esportivo
    const shoe = createSportySneaker(shoeRedMaterial, shoeWhiteMaterial, shoeBlackAccentMat);
    shoe.position.set(0, -0.18, 0.035);
    lowerLeg.add(shoe);

    return { leg, lowerLeg };
  };

  const leftLegData = createChildLeg(true);
  const rightLegData = createChildLeg(false);

  body.add(leftLegData.leg);
  body.add(rightLegData.leg);

  const leftLeg = leftLegData.leg;
  const rightLeg = rightLegData.leg;
  const leftLowerLeg = leftLegData.lowerLeg;
  const rightLowerLeg = rightLegData.lowerLeg;

  // Sombra de contato no chão sob o Theo Lucca
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
    grad.addColorStop(0, 'rgba(12, 18, 28, 0.65)');
    grad.addColorStop(0.5, 'rgba(12, 18, 28, 0.22)');
    grad.addColorStop(1, 'rgba(12, 18, 28, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const blobShadowGeo = new THREE.PlaneGeometry(0.72, 0.72);
  blobShadowGeo.rotateX(-Math.PI / 2);
  const blobShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const blobShadow = new THREE.Mesh(blobShadowGeo, blobShadowMat);
  blobShadow.position.y = 0.015;
  root.add(blobShadow);

  // --- OBJETOS SEGURADOS POR THEO NAS MISSÕES ---
  const heldProp = new THREE.Group();
  heldProp.position.set(0.04, -0.14, 0.13);
  rightForearm.add(heldProp);

  // Caixa de Pizza Quentinha
  const pizzaBoxGeo = new THREE.BoxGeometry(0.25, 0.045, 0.25);
  const pizzaBoxMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.45 });
  const pizzaBoxMesh = new THREE.Mesh(pizzaBoxGeo, pizzaBoxMat);
  pizzaBoxMesh.name = 'prop_pizza';
  pizzaBoxMesh.visible = false;
  // Detalhe de fita branca
  const tapeGeo = new THREE.BoxGeometry(0.06, 0.047, 0.252);
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const tape = new THREE.Mesh(tapeGeo, tapeMat);
  pizzaBoxMesh.add(tape);
  heldProp.add(pizzaBoxMesh);

  // Regador verde de jardinagem
  const canGeo = new THREE.CylinderGeometry(0.05, 0.062, 0.13, 12);
  const canMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.35 });
  const canMesh = new THREE.Mesh(canGeo, canMat);
  canMesh.name = 'prop_wateringCan';
  canMesh.visible = false;
  // Bico do regador
  const spoutGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.12, 8);
  spoutGeo.rotateZ(-Math.PI / 3);
  const spout = new THREE.Mesh(spoutGeo, canMat);
  spout.position.set(0.06, 0.04, 0);
  canMesh.add(spout);
  heldProp.add(canMesh);

  // Jornal da Cidade Enrolado
  const newsGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.18, 10);
  const newsMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
  const newsMesh = new THREE.Mesh(newsGeo, newsMat);
  newsMesh.rotation.z = Math.PI / 2;
  newsMesh.name = 'prop_newspaper';
  newsMesh.visible = false;
  heldProp.add(newsMesh);

  // Bola de Futebol com Gomos
  const ballGeo = new THREE.SphereGeometry(0.085, 14, 14);
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  ballMesh.name = 'prop_ball';
  ballMesh.visible = false;
  heldProp.add(ballMesh);

  const setHeldPropType = (propType: 'none' | 'pizza' | 'wateringCan' | 'newspaper' | 'ball') => {
    pizzaBoxMesh.visible = propType === 'pizza';
    canMesh.visible = propType === 'wateringCan';
    newsMesh.visible = propType === 'newspaper';
    ballMesh.visible = propType === 'ball';
  };

  // --- MOTOR DE ANIMAÇÕES PROCEDURAIS REALISTAS ---
  const updateAnimation = (
    time: number,
    speed: number,
    isGrounded: boolean,
    isRunning: boolean,
    isWaving: boolean = false,
    isInCar: boolean = false,
    isWorking: boolean = false
  ) => {
    // 1. Sentado no banco de carona do carro
    if (isInCar) {
      body.position.y = 0.32;
      leftArm.rotation.set(-0.6, 0, -0.15);
      rightArm.rotation.set(-0.6, 0, 0.15);
      leftForearm.rotation.set(-0.5, 0, 0);
      rightForearm.rotation.set(-0.5, 0, 0);

      leftLeg.rotation.set(-1.45, 0, 0);
      rightLeg.rotation.set(-1.45, 0, 0);
      leftLowerLeg.rotation.set(1.4, 0, 0);
      rightLowerLeg.rotation.set(1.4, 0, 0);

      head.rotation.set(0.05, Math.sin(time * 2) * 0.15, 0);
      return;
    }

    // 2. Pulo dinâmico
    if (!isGrounded) {
      body.position.y = 0.55;
      leftArm.rotation.x = -1.1;
      rightArm.rotation.x = -1.1;
      leftForearm.rotation.x = -0.4;
      rightForearm.rotation.x = -0.4;

      leftLeg.rotation.x = 0.45;
      rightLeg.rotation.x = -0.3;
      leftLowerLeg.rotation.x = 0.6;
      rightLowerLeg.rotation.x = 0.3;
      head.rotation.x = -0.1;
      head.rotation.y = 0;
      return;
    }

    const isMoving = speed > 0.05;

    // 3. Andando ou Correndo
    if (isMoving) {
      const freq = isRunning ? 16 : 9.5;
      const armSwing = isRunning ? 1.05 : 0.65;
      const legSwing = isRunning ? 0.95 : 0.55;

      const cycle = Math.sin(time * freq);
      const cosCycle = Math.cos(time * freq);

      leftArm.rotation.x = cycle * armSwing;
      if (isWaving) {
        rightArm.rotation.x = -2.2;
        rightArm.rotation.z = 0.3;
        rightForearm.rotation.z = Math.sin(time * 12) * 0.35;
      } else if (isWorking) {
        rightArm.rotation.x = -0.8;
        rightArm.rotation.z = 0.1;
        rightForearm.rotation.x = -0.5;
        leftArm.rotation.x = -0.8;
        leftForearm.rotation.x = -0.5;
      } else {
        rightArm.rotation.x = -cycle * armSwing;
        rightArm.rotation.z = 0.1;
        rightForearm.rotation.x = -Math.abs(-cycle) * 0.5 - 0.2;
      }

      leftArm.rotation.z = -0.1;
      leftForearm.rotation.x = -Math.abs(cycle) * 0.5 - 0.2;

      leftLeg.rotation.x = -cycle * legSwing;
      rightLeg.rotation.x = cycle * legSwing;

      leftLowerLeg.rotation.x = cycle > 0 ? cycle * 0.8 : 0.1;
      rightLowerLeg.rotation.x = cycle < 0 ? -cycle * 0.8 : 0.1;

      // Movimento vertical do quadril de criança saltitante
      body.position.y = 0.52 + Math.abs(cosCycle) * (isRunning ? 0.05 : 0.025);
      torsoGroup.rotation.y = -cycle * 0.12;
      torsoGroup.rotation.z = cycle * 0.04;

      head.rotation.y = cycle * 0.08;
      head.rotation.x = isRunning ? 0.08 : 0.03;
    } else {
      // 4. Parado / Idle feliz com respiração suave
      const breath = Math.sin(time * 3);
      body.position.y = 0.52 + breath * 0.006;
      head.rotation.x = breath * 0.025;
      head.rotation.y = Math.sin(time * 0.8) * 0.06;

      leftArm.rotation.x = Math.sin(time * 1.5) * 0.04;
      leftArm.rotation.z = -0.06;
      leftForearm.rotation.x = -0.15;

      if (isWaving) {
        rightArm.rotation.x = -2.1;
        rightArm.rotation.z = 0.35;
        rightForearm.rotation.z = Math.sin(time * 12) * 0.45;
        head.rotation.y = 0.2;
      } else if (isWorking) {
        rightArm.rotation.x = -0.85;
        rightArm.rotation.z = 0.1;
        rightForearm.rotation.x = -0.6;
        leftArm.rotation.x = -0.85;
        leftForearm.rotation.x = -0.6;
      } else {
        rightArm.rotation.x = -Math.sin(time * 1.5) * 0.04;
        rightArm.rotation.z = 0.06;
        rightForearm.rotation.x = -0.15;
      }

      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftLowerLeg.rotation.x = 0;
      rightLowerLeg.rotation.x = 0;
      torsoGroup.rotation.y = 0;
      torsoGroup.rotation.z = 0;
    }
  };

  return {
    root,
    body,
    head,
    leftArm,
    rightArm,
    leftForearm,
    rightForearm,
    leftLeg,
    rightLeg,
    leftLowerLeg,
    rightLowerLeg,
    backpack,
    heldProp,
    setHeldPropType,
    updateAnimation,
  };
}

/**
 * Cria o tênis esportivo vermelho detalhado com entressola branca, listras laterais e cadarços
 */
function createSportySneaker(
  redMat: THREE.Material,
  whiteMat: THREE.Material,
  blackMat: THREE.Material
): THREE.Group {
  const sneaker = new THREE.Group();

  // Entressola de borracha branca espessa bem evidente (solado branco clássico)
  const soleGeo = new THREE.BoxGeometry(0.098, 0.046, 0.205);
  const sole = new THREE.Mesh(soleGeo, whiteMat);
  sole.position.y = 0.005;
  sole.castShadow = true;
  sneaker.add(sole);

  // Sola inferior preta com ranhuras de tração
  const treadGeo = new THREE.BoxGeometry(0.096, 0.008, 0.202);
  const tread = new THREE.Mesh(treadGeo, blackMat);
  tread.position.y = -0.022;
  sneaker.add(tread);

  // Cabedal vermelho com formato anatômico esportivo
  const upperGeo = new THREE.BoxGeometry(0.088, 0.068, 0.165);
  const upper = new THREE.Mesh(upperGeo, redMat);
  upper.position.set(0, 0.046, -0.012);
  upper.castShadow = true;
  sneaker.add(upper);

  // Biqueira branca arredondada
  const toeGeo = new THREE.CylinderGeometry(0.044, 0.045, 0.042, 14, 1, false, 0, Math.PI);
  toeGeo.rotateZ(Math.PI / 2);
  const toe = new THREE.Mesh(toeGeo, whiteMat);
  toe.position.set(0, 0.022, 0.078);
  sneaker.add(toe);

  // Listras laterais esportivas brancas estilo tênis de corrida
  for (const side of [-1, 1]) {
    const stripeGeo = new THREE.BoxGeometry(0.004, 0.018, 0.08);
    const stripe = new THREE.Mesh(stripeGeo, whiteMat);
    stripe.position.set(side * 0.046, 0.05, -0.01);
    stripe.rotation.x = -0.15;
    sneaker.add(stripe);
  }

  // Cadarços brancos cruzados e lingueta acolchoada
  const tongueGeo = new THREE.BoxGeometry(0.052, 0.08, 0.05);
  tongueGeo.rotateX(0.2);
  const tongue = new THREE.Mesh(tongueGeo, redMat);
  tongue.position.set(0, 0.06, 0.03);
  sneaker.add(tongue);

  const laceGeo = new THREE.BoxGeometry(0.054, 0.009, 0.016);
  for (let i = 0; i < 3; i++) {
    const lace = new THREE.Mesh(laceGeo, whiteMat);
    lace.position.set(0, 0.082 + i * 0.004, 0.012 + i * 0.028);
    sneaker.add(lace);
  }

  // Laço do cadarço amarrado em nó
  const knotGeo = new THREE.SphereGeometry(0.01, 8, 8);
  const knot = new THREE.Mesh(knotGeo, whiteMat);
  knot.position.set(0, 0.098, 0.065);
  sneaker.add(knot);

  return sneaker;
}
