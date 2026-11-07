import * as THREE from 'three';
import { soundManager } from './audio';
import {
  createAsphaltTexture,
  createSidewalkTexture,
  createGrassTexture,
  createSandTexture,
  createBrickTexture,
  createCheckeredFloorTexture,
  createWoodFloorTexture,
} from './textures';

export interface TrafficLight {
  group: THREE.Group;
  position: THREE.Vector3;
  state: 'green' | 'yellow' | 'red';
  timer: number;
  greenMesh: THREE.Mesh;
  yellowMesh: THREE.Mesh;
  redMesh: THREE.Mesh;
}

export interface CityCar {
  group: THREE.Group;
  colorName: string;
  speed: number;
  maxSpeed: number;
  waypoints: THREE.Vector3[];
  currentWpIndex: number;
  rotationY: number;
  wheels: THREE.Mesh[];
  honkCooldown: number;
  stoppedByRedLight: boolean;
  stoppedByPedestrian: boolean;
  hasTheoPassenger: boolean;
}

export interface CityMoto {
  group: THREE.Group;
  colorName: string;
  speed: number;
  maxSpeed: number;
  waypoints: THREE.Vector3[];
  currentWpIndex: number;
  rotationY: number;
  wheels: THREE.Mesh[];
  frontFork?: THREE.Group;
  driverMesh?: THREE.Group;
  rider?: THREE.Group;
  isParked: boolean;
  hasTheoPassenger: boolean;
}

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name?: string;
}

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
  name?: string;
}

export interface CityNPC {
  group: THREE.Group;
  name: string;
  role: string;
  phrase: string;
  position: THREE.Vector3;
  walkTimer: number;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  isWaving: boolean;
  isInsideBuilding?: boolean;
}

export interface StreetCoin {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  value: number;
  collected: boolean;
}

export interface InteractiveLocation {
  id: string;
  name: string;
  category: 'shop' | 'job' | 'landmark';
  position: THREE.Vector3;
  markerMesh: THREE.Mesh;
  label: string;
  radius: number;
  isInside: boolean;
}

export interface CitySceneObjects {
  scene: THREE.Scene;
  trafficLights: TrafficLight[];
  cars: CityCar[];
  motos: CityMoto[];
  motorcycles: CityMoto[];
  npcs: CityNPC[];
  coins: StreetCoin[];
  locations: InteractiveLocation[];
  colliders: {
    boxes: BoxCollider[];
    circles: CircleCollider[];
  };
  sunLight: THREE.DirectionalLight;
  skyLight: THREE.HemisphereLight;
  waterMesh: THREE.Mesh;
  flowerBeds: THREE.Vector3[];
  mailboxes: THREE.Vector3[];
  customerHouses: THREE.Vector3[];
  beaconGroup: THREE.Group;
  setBeaconPosition: (pos: THREE.Vector3 | null) => void;
  updateCity: (timeSec: number, delta: number, theoPos: THREE.Vector3) => void;
}

export function createCityScene(): CitySceneObjects {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x60a5fa); // Céu azul radiante
  scene.fog = new THREE.FogExp2(0x93c5fd, 0.0055); // Névoa atmosférica de horizonte suave

  // --- ILUMINAÇÃO SOLAR & AMBIENTE (SOL MAIS FORTE COM SOMBRAS NÍTIDAS NO CHÃO) ---
  const skyLight = new THREE.HemisphereLight(0xfffbeb, 0x0284c7, 1.15);
  scene.add(skyLight);

  const sunLight = new THREE.DirectionalLight(0xfff8ea, 2.65); // Sol mais forte e dourado
  sunLight.position.set(75, 105, 55);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 270;
  const d = 115;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);

  // Luz de preenchimento suave
  const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.35);
  fillLight.position.set(-60, 40, -40);
  scene.add(fillLight);

  // --- TEXTURAS PROCEDURAIS PBR DE ALTA DEFINIÇÃO ---
  const asphaltTex = createAsphaltTexture();
  const sidewalkTex = createSidewalkTexture();
  const grassTex = createGrassTexture();
  const sandTex = createSandTexture();

  // Configuração de repetição proporcional para texturas nítidas
  grassTex.repeat.set(24, 24);
  sandTex.repeat.set(14, 14);

  const asphaltMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    roughness: 0.85,
    metalness: 0.1,
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: sidewalkTex,
    roughness: 0.8,
    metalness: 0.05,
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
  });

  const grassMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 0.9,
    metalness: 0.02,
  });

  const sandMat = new THREE.MeshStandardMaterial({
    map: sandTex,
    roughness: 0.95,
  });

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.08,
    metalness: 0.5,
    transparent: true,
    opacity: 0.82,
  });

  const yellowPaintMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
  const whitePaintMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });

  // 1. TERRENO AMPLO REALISTA (240m x 240m)
  const terrainGeo = new THREE.PlaneGeometry(250, 250);
  terrainGeo.rotateX(-Math.PI / 2);
  const terrain = new THREE.Mesh(terrainGeo, grassMat);
  terrain.receiveShadow = true;
  scene.add(terrain);

  // Praia ampla no lado leste (+X) com dunas suaves
  const beachGeo = new THREE.PlaneGeometry(80, 250);
  beachGeo.rotateX(-Math.PI / 2);
  const beach = new THREE.Mesh(beachGeo, sandMat);
  beach.position.set(88, 0.015, 0);
  beach.receiveShadow = true;
  scene.add(beach);

  // Mar com ondas suaves
  const oceanGeo = new THREE.PlaneGeometry(90, 250);
  oceanGeo.rotateX(-Math.PI / 2);
  const waterMesh = new THREE.Mesh(oceanGeo, waterMat);
  waterMesh.position.set(145, 0.03, 0);
  scene.add(waterMesh);

  // Guarda-sóis coloridos e espreguiçadeiras na praia
  for (let i = 0; i < 6; i++) {
    const umbrellaGroup = new THREE.Group();
    umbrellaGroup.position.set(78 + (i % 2) * 14, 0, -65 + i * 26);

    const poleGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.25;
    pole.castShadow = true;
    umbrellaGroup.add(pole);

    const coneGeo = new THREE.ConeGeometry(2.1, 0.75, 14);
    const coneColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981, 0x8b5cf6, 0xec4899];
    const coneMat = new THREE.MeshStandardMaterial({ color: coneColors[i % 6], roughness: 0.5 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 2.45;
    cone.castShadow = true;
    umbrellaGroup.add(cone);

    // Cadeira de praia reclinada de madeira
    const chairGeo = new THREE.BoxGeometry(0.8, 0.25, 1.6);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.7 });
    const chair = new THREE.Mesh(chairGeo, chairMat);
    chair.position.set(1.2, 0.12, 0.4);
    chair.rotation.y = 0.2;
    chair.castShadow = true;
    umbrellaGroup.add(chair);

    scene.add(umbrellaGroup);
  }

  // --- MALHA DE AVENIDAS COM ASFALTO TEXTURIZADO E PINTURA PROFISSIONAL ---
  const roadNetwork = new THREE.Group();
  scene.add(roadNetwork);

  const addRoad = (x: number, z: number, width: number, length: number, isVertical: boolean) => {
    const roadGeo = new THREE.PlaneGeometry(width, length);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, asphaltMat);
    road.position.set(x, 0.02, z);
    road.receiveShadow = true;
    roadNetwork.add(road);

    // Linhas brancas contínuas nos bordos da pista
    const edgeOffset = width / 2 - 0.35;
    for (const side of [-1, 1]) {
      const edgeGeo = isVertical 
        ? new THREE.PlaneGeometry(0.18, length) 
        : new THREE.PlaneGeometry(length, 0.18);
      edgeGeo.rotateX(-Math.PI / 2);
      const edgeLine = new THREE.Mesh(edgeGeo, whitePaintMat);
      if (isVertical) {
        edgeLine.position.set(x + side * edgeOffset, 0.024, z);
      } else {
        edgeLine.position.set(x, 0.024, z + side * edgeOffset);
      }
      roadNetwork.add(edgeLine);
    }

    // Faixa pontilhada amarela dupla central
    const stripeCount = Math.floor(length / 4.8);
    for (let s = -stripeCount / 2; s < stripeCount / 2; s++) {
      const stripeGeo = isVertical 
        ? new THREE.PlaneGeometry(0.24, 2.4) 
        : new THREE.PlaneGeometry(2.4, 0.24);
      stripeGeo.rotateX(-Math.PI / 2);
      const stripe = new THREE.Mesh(stripeGeo, yellowPaintMat);
      if (isVertical) {
        stripe.position.set(x, 0.025, z + s * 4.8 + 2.4);
      } else {
        stripe.position.set(x + s * 4.8 + 2.4, 0.025, z);
      }
      roadNetwork.add(stripe);
    }
  };

  // Vias principais ampliadas
  addRoad(0, 0, 11.0, 220, true);         // Av. Central Norte-Sul
  addRoad(58, 0, 10.0, 220, true);        // Av. da Orla & Praia Norte-Sul
  addRoad(-58, 0, 10.0, 220, true);       // Av. Oeste Norte-Sul
  addRoad(0, 0, 220, 11.0, false);        // Av. Comercial Central Leste-Oeste
  addRoad(0, -52, 220, 10.0, false);      // Av. Residencial Norte Leste-Oeste
  addRoad(0, 52, 220, 10.0, false);       // Av. do Parque & Escola Sul Leste-Oeste

  // Faixas de pedestres nas esquinas (Crosswalks zebradas)
  const addCrosswalk = (x: number, z: number, isVertical: boolean) => {
    for (let i = -4; i <= 4; i++) {
      const barGeo = isVertical 
        ? new THREE.PlaneGeometry(0.7, 3.8) 
        : new THREE.PlaneGeometry(3.8, 0.7);
      barGeo.rotateX(-Math.PI / 2);
      const bar = new THREE.Mesh(barGeo, whitePaintMat);
      if (isVertical) {
        bar.position.set(x + i * 1.1, 0.028, z);
      } else {
        bar.position.set(x, 0.028, z + i * 1.1);
      }
      roadNetwork.add(bar);
    }
  };

  addCrosswalk(0, -8.0, true);
  addCrosswalk(0, 8.0, true);
  addCrosswalk(-8.0, 0, false);
  addCrosswalk(8.0, 0, false);

  addCrosswalk(0, -44.5, true);
  addCrosswalk(0, -59.5, true);
  addCrosswalk(0, 44.5, true);
  addCrosswalk(0, 59.5, true);

  // Calçadas de concreto com lajotas e meio-fio chanfrado
  const addSidewalkBlock = (x: number, z: number, w: number, d: number) => {
    const swGeo = new THREE.BoxGeometry(w, 0.18, d);
    const sw = new THREE.Mesh(swGeo, sidewalkMat);
    sw.position.set(x, 0.09, z);
    sw.receiveShadow = true;
    roadNetwork.add(sw);

    // Meio-fio de granito escovado no contorno
    const curbBorderGeo = new THREE.BoxGeometry(w + 0.25, 0.22, d + 0.25);
    const curbBorder = new THREE.Mesh(curbBorderGeo, curbMat);
    curbBorder.position.set(x, 0.07, z);
    curbBorder.receiveShadow = true;
    roadNetwork.add(curbBorder);
  };

  addSidewalkBlock(-29, -26, 44, 38); // Quarteirão 1: Pizzaria & Padaria (Com interiores)
  addSidewalkBlock(-29, 26, 44, 38);  // Quarteirão 2: Mercado & Loja Brinquedos (Com interiores)
  addSidewalkBlock(29, -26, 44, 38);  // Quarteirão 3: Loja de Roupas & Praça
  addSidewalkBlock(29, 26, 44, 38);   // Quarteirão 4: Praça da Fonte, Lago & Parque
  addSidewalkBlock(-29, -78, 44, 38); // Quarteirão Residencial (Casas)
  addSidewalkBlock(-29, 78, 44, 38);  // Quarteirão Escola Infantil & Playground

  // --- POSTES DE ILUMINAÇÃO PÚBLICA REALISTAS COM LUMINÁRIAS ---
  const lampPositions = [
    [-7.0, -18], [-7.0, 18], [-7.0, 36], [-7.0, -36],
    [7.0, -18], [7.0, 18], [7.0, 36], [7.0, -36],
    [-24, -7.0], [24, -7.0], [-24, 7.0], [24, 7.0],
    [50, -25], [50, 25], [-50, -25], [-50, 25],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(lx, 0, lz);

    // Coluna metálica preta curvada
    const postGeo = new THREE.CylinderGeometry(0.08, 0.12, 4.8, 10);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(postGeo, metalMat);
    post.position.y = 2.4;
    post.castShadow = true;
    lampGroup.add(post);

    // Braço curvado
    const armGeo = new THREE.BoxGeometry(0.9, 0.08, 0.08);
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.position.set(lx > 0 ? -0.4 : 0.4, 4.75, 0);
    lampGroup.add(arm);

    // Globo de luz quente
    const bulbGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(lx > 0 ? -0.8 : 0.8, 4.65, 0);
    lampGroup.add(bulb);

    scene.add(lampGroup);
  });

  // --- SEMÁFOROS FUNCIONAIS REALISTAS ---
  const trafficLights: TrafficLight[] = [];

  const createTrafficLight = (pos: THREE.Vector3, rotY: number): TrafficLight => {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;

    const poleGeo = new THREE.CylinderGeometry(0.09, 0.11, 4.6, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.3;
    pole.castShadow = true;
    group.add(pole);

    const boxGeo = new THREE.BoxGeometry(0.45, 1.35, 0.38);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 4.2, 0);
    box.castShadow = true;
    group.add(box);

    const lightGeo = new THREE.SphereGeometry(0.13, 12, 12);
    const redMat = new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xef4444, emissiveIntensity: 1.4 });
    const redMesh = new THREE.Mesh(lightGeo, redMat);
    redMesh.position.set(0, 4.65, 0.17);
    group.add(redMesh);

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0x332200, emissive: 0xeab308, emissiveIntensity: 0.2 });
    const yellowMesh = new THREE.Mesh(lightGeo, yellowMat);
    yellowMesh.position.set(0, 4.2, 0.17);
    group.add(yellowMesh);

    const greenMat = new THREE.MeshStandardMaterial({ color: 0x003311, emissive: 0x22c55e, emissiveIntensity: 0.2 });
    const greenMesh = new THREE.Mesh(lightGeo, greenMat);
    greenMesh.position.set(0, 3.75, 0.17);
    group.add(greenMesh);

    scene.add(group);

    return {
      group,
      position: pos,
      state: 'green',
      timer: 0,
      greenMesh,
      yellowMesh,
      redMesh,
    };
  };

  trafficLights.push(createTrafficLight(new THREE.Vector3(6.5, 0, -6.8), Math.PI));
  trafficLights.push(createTrafficLight(new THREE.Vector3(-6.5, 0, 6.8), 0));
  trafficLights.push(createTrafficLight(new THREE.Vector3(-6.8, 0, -6.5), Math.PI / 2));
  trafficLights.push(createTrafficLight(new THREE.Vector3(6.8, 0, 6.5), -Math.PI / 2));

  // =========================================================================
  // --- EDIFÍCIOS REALISTAS COM INTERIORES EXPLORÁVEIS (THEO ENTRA DENTRO!) ---
  // =========================================================================
  const locations: InteractiveLocation[] = [];
  const customerHouses: THREE.Vector3[] = [];
  const flowerBeds: THREE.Vector3[] = [];
  const mailboxes: THREE.Vector3[] = [];
  const boxColliders: BoxCollider[] = [];
  const circleColliders: CircleCollider[] = [];

  const createRealisticShop = (config: {
    id: string;
    name: string;
    category: 'shop' | 'job';
    pos: THREE.Vector3;
    size: THREE.Vector3;
    doorWidth: number;
    wallTexture?: THREE.CanvasTexture;
    wallColor?: number;
    floorTexture: THREE.CanvasTexture;
    roofColor: number;
    signTitle: string;
    signBgColor: number;
    signTextColor?: string;
    awningType?: 'solid' | 'striped_red_white' | 'striped_colorful' | 'none';
    awningColor?: number;
    hasGarageDoor?: boolean;
    hasGlassDoor?: boolean;
    interiorDecor: (interiorGroup: THREE.Group) => void;
    counterPos: THREE.Vector3;
  }) => {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.copy(config.pos);

    const halfW = config.size.x / 2;
    const halfD = config.size.z / 2;
    const h = config.size.y;
    const wallThick = 0.38;

    const wallMat = config.wallTexture 
      ? new THREE.MeshStandardMaterial({ map: config.wallTexture, roughness: 0.75 })
      : new THREE.MeshStandardMaterial({ color: config.wallColor || 0xe2e8f0, roughness: 0.7 });

    const roofMat = new THREE.MeshStandardMaterial({ color: config.roofColor, roughness: 0.55 });
    const floorMat = new THREE.MeshStandardMaterial({ map: config.floorTexture, roughness: 0.45 });

    // 1. Piso Interno Personalizado com Rejunte e Reflexo
    config.floorTexture.repeat.set(Math.floor(config.size.x / 3.5), Math.floor(config.size.z / 3.5));
    const floorGeo = new THREE.BoxGeometry(config.size.x - 0.2, 0.2, config.size.z - 0.2);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = 0.1;
    floorMesh.receiveShadow = true;
    buildingGroup.add(floorMesh);

    // 2. Paredes: Traseira, Esquerda e Direita
    const backGeo = new THREE.BoxGeometry(config.size.x, h, wallThick);
    const backWall = new THREE.Mesh(backGeo, wallMat);
    backWall.position.set(0, h / 2, -halfD + wallThick / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    buildingGroup.add(backWall);

    const sideGeo = new THREE.BoxGeometry(wallThick, h, config.size.z);
    const leftWall = new THREE.Mesh(sideGeo, wallMat);
    leftWall.position.set(-halfW + wallThick / 2, h / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    buildingGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideGeo, wallMat);
    rightWall.position.set(halfW - wallThick / 2, h / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    buildingGroup.add(rightWall);

    // 3. Parede Frontal com Abertura para Porta Larga (Passagem 100% livre)
    const frontWallWidth = (config.size.x - config.doorWidth) / 2;

    const frontLeftGeo = new THREE.BoxGeometry(frontWallWidth, h, wallThick);
    const frontLeft = new THREE.Mesh(frontLeftGeo, wallMat);
    frontLeft.position.set(-halfW + frontWallWidth / 2, h / 2, halfD - wallThick / 2);
    frontLeft.castShadow = true;
    frontLeft.receiveShadow = true;
    buildingGroup.add(frontLeft);

    const frontRight = new THREE.Mesh(frontLeftGeo, wallMat);
    frontRight.position.set(halfW - frontWallWidth / 2, h / 2, halfD - wallThick / 2);
    frontRight.castShadow = true;
    frontRight.receiveShadow = true;
    buildingGroup.add(frontRight);

    // Colisores das paredes sólidas da loja (deixando a porta aberta para Theo entrar e sair!)
    const px = config.pos.x;
    const pz = config.pos.z;
    boxColliders.push(
      // Parede Traseira
      { minX: px - halfW - 0.2, maxX: px + halfW + 0.2, minZ: pz - halfD - 0.4, maxZ: pz - halfD + 0.5, name: `${config.id}_back` },
      // Parede Esquerda
      { minX: px - halfW - 0.4, maxX: px - halfW + 0.5, minZ: pz - halfD - 0.2, maxZ: pz + halfD + 0.2, name: `${config.id}_left` },
      // Parede Direita
      { minX: px + halfW - 0.5, maxX: px + halfW + 0.4, minZ: pz - halfD - 0.2, maxZ: pz + halfD + 0.2, name: `${config.id}_right` },
      // Parede Frontal Esquerda
      { minX: px - halfW - 0.2, maxX: px - (config.doorWidth / 2) + 0.15, minZ: pz + halfD - 0.5, maxZ: pz + halfD + 0.4, name: `${config.id}_front_l` },
      // Parede Frontal Direita
      { minX: px + (config.doorWidth / 2) - 0.15, maxX: px + halfW + 0.2, minZ: pz + halfD - 0.5, maxZ: pz + halfD + 0.4, name: `${config.id}_front_r` }
    );

    // Vitrines de vidro frontal ao lado da porta com molduras metálicas
    for (const side of [-1, 1]) {
      const winGeo = new THREE.BoxGeometry(frontWallWidth * 0.75, 2.4, 0.1);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.55,
      });
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(side * (halfW - frontWallWidth / 2), 2.2, halfD + 0.05);
      win.castShadow = true;
      buildingGroup.add(win);
    }

    // Porta de garagem cinza escuro para a Oficina
    if (config.hasGarageDoor) {
      const garageGroup = new THREE.Group();
      garageGroup.position.set(0, 0, halfD - wallThick / 2);

      // Guarnição superior e lateral metálica
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 });
      const topFrame = new THREE.Mesh(new THREE.BoxGeometry(config.doorWidth + 0.3, 0.25, 0.3), frameMat);
      topFrame.position.set(0, h - 0.7, 0.1);
      topFrame.castShadow = true;
      garageGroup.add(topFrame);

      // Ripas horizontais da porta de enrolar basculante cinza escuro
      const garageDoorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.35 });
      const slatCount = 7;
      const slatHeight = 0.45;
      for (let s = 0; s < slatCount; s++) {
        const slatGeo = new THREE.BoxGeometry(config.doorWidth - 0.1, slatHeight - 0.04, 0.1);
        const slat = new THREE.Mesh(slatGeo, garageDoorMat);
        slat.position.set(0, h - 1.0 - s * slatHeight, 0.08);
        slat.castShadow = true;
        garageGroup.add(slat);
      }

      // Puxador central e fechadura metálica
      const handleMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.08, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 })
      );
      handleMesh.position.set(0, h - 1.0 - 6 * slatHeight, 0.16);
      garageGroup.add(handleMesh);

      buildingGroup.add(garageGroup);
    } else if (config.hasGlassDoor) {
      // Portas duplas de vidro com puxador vertical
      const doorGlassMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.65,
      });
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });

      for (const ds of [-1, 1]) {
        const doorPanel = new THREE.Group();
        doorPanel.position.set(ds * (config.doorWidth * 0.28), 1.5, halfD - wallThick / 2);

        const glassPane = new THREE.Mesh(new THREE.BoxGeometry(config.doorWidth * 0.45, 2.9, 0.08), doorGlassMat);
        doorPanel.add(glassPane);

        // Moldura da porta
        const topF = new THREE.Mesh(new THREE.BoxGeometry(config.doorWidth * 0.48, 0.1, 0.1), frameMat);
        topF.position.y = 1.45;
        doorPanel.add(topF);

        // Puxador vertical prateado
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 })
        );
        handle.position.set(ds * -0.3, 0, 0.08);
        doorPanel.add(handle);

        buildingGroup.add(doorPanel);
      }
    }

    // Viga superior sobre a entrada
    const lintelHeight = 1.6;
    const lintelGeo = new THREE.BoxGeometry(config.doorWidth, lintelHeight, wallThick);
    const lintel = new THREE.Mesh(lintelGeo, wallMat);
    lintel.position.set(0, h - lintelHeight / 2, halfD - wallThick / 2);
    lintel.castShadow = true;
    buildingGroup.add(lintel);

    // Letreiro iluminado da loja na fachada
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = `#${config.signBgColor.toString(16).padStart(6, '0')}`;
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.lineWidth = 6;
    sCtx.strokeStyle = config.signTextColor === '#000000' ? '#000000' : '#ffffff';
    sCtx.strokeRect(4, 4, 504, 120);
    sCtx.fillStyle = config.signTextColor || '#ffffff';
    sCtx.font = '900 44px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText(config.signTitle, 256, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.3,
      emissive: config.signBgColor,
      emissiveIntensity: 0.25,
    });
    const signGeo = new THREE.BoxGeometry(config.doorWidth * 1.35, 1.15, 0.2);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, h - 0.45, halfD + 0.12);
    sign.castShadow = true;
    buildingGroup.add(sign);

    // Toldos sobre as vitrines (conforme especificação da loja)
    const awningType = config.awningType || 'solid';
    const awningColor = config.awningColor !== undefined ? config.awningColor : config.signBgColor;

    if (awningType !== 'none') {
      for (const side of [-1, 1]) {
        const awningContainer = new THREE.Group();
        awningContainer.position.set(side * (halfW - frontWallWidth / 2), 3.6, halfD + 0.65);
        awningContainer.rotation.x = 0.28;

        if (awningType === 'striped_colorful') {
          // Toldo colorido listrado (vermelho, amarelo, azul, verde)
          const colors = [0xef4444, 0xfacc15, 0x3b82f6, 0x10b981];
          const stripeWidth = (frontWallWidth * 0.9) / colors.length;
          colors.forEach((col, idx) => {
            const stripeGeo = new THREE.BoxGeometry(stripeWidth, 0.15, 1.4);
            const stripeMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 });
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.position.x = -((frontWallWidth * 0.9) / 2) + stripeWidth * (idx + 0.5);
            stripe.castShadow = true;
            awningContainer.add(stripe);
          });
        } else if (awningType === 'striped_red_white') {
          // Toldo listrado vermelho e branco (Pizzaria)
          const colors = [0xdc2626, 0xffffff, 0xdc2626, 0xffffff];
          const stripeWidth = (frontWallWidth * 0.9) / colors.length;
          colors.forEach((col, idx) => {
            const stripeGeo = new THREE.BoxGeometry(stripeWidth, 0.15, 1.4);
            const stripeMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 });
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.position.x = -((frontWallWidth * 0.9) / 2) + stripeWidth * (idx + 0.5);
            stripe.castShadow = true;
            awningContainer.add(stripe);
          });
        } else {
          // Toldo de cor sólida vibrante (verde para mercadinho, laranja para padaria)
          const awningGeo = new THREE.BoxGeometry(frontWallWidth * 0.9, 0.15, 1.4);
          const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.55 });
          const awning = new THREE.Mesh(awningGeo, awningMat);
          awning.castShadow = true;
          awningContainer.add(awning);
        }

        buildingGroup.add(awningContainer);
      }
    }

    // Telhado detalhado
    const roofGeo = new THREE.BoxGeometry(config.size.x + 0.8, 0.45, config.size.z + 0.8);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 0.22;
    roof.castShadow = true;
    buildingGroup.add(roof);

    // Iluminação Interna Realista
    const interiorLight = new THREE.PointLight(0xfffbeb, 1.6, config.size.x * 1.4);
    interiorLight.position.set(0, h - 0.9, 0);
    buildingGroup.add(interiorLight);

    // Decoração e mobiliário especializado
    config.interiorDecor(buildingGroup);

    scene.add(buildingGroup);

    // Marcador de Interação dentro do estabelecimento
    const worldCounterPos = new THREE.Vector3(
      config.pos.x + config.counterPos.x,
      0.18,
      config.pos.z + config.counterPos.z
    );

    const markerGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.06, 20);
    const markerMat = new THREE.MeshStandardMaterial({
      color: config.category === 'job' ? 0xf59e0b : 0xa855f7,
      emissive: config.category === 'job' ? 0xd97706 : 0x7e22ce,
      emissiveIntensity: 0.55,
    });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    markerMesh.position.copy(worldCounterPos);
    scene.add(markerMesh);

    locations.push({
      id: config.id,
      name: config.name,
      category: config.category,
      position: worldCounterPos,
      markerMesh,
      label: config.signTitle,
      radius: 3.8,
      isInside: true,
    });
  };

  // 1. PIZZARIA DO BAIRRO (Tijolos vermelhos, forno a lenha, mesas com toalhas xadrez, toldo vermelho e branco)
  const brickPizzaTex = createBrickTexture('#b91c1c', '#e2e8f0');
  const pizzaFloorTex = createCheckeredFloorTexture('#ffffff', '#dc2626');

  createRealisticShop({
    id: 'pizzaria_do_bairro',
    name: 'Pizzaria do Bairro',
    category: 'job',
    pos: new THREE.Vector3(-20, 0, -24),
    size: new THREE.Vector3(16, 6.2, 15),
    doorWidth: 3.8,
    wallTexture: brickPizzaTex,
    roofColor: 0x7f1d1d,
    floorTexture: pizzaFloorTex,
    signTitle: 'PIZZARIA DO BAIRRO',
    signBgColor: 0xb91c1c,
    awningType: 'striped_red_white',
    hasGlassDoor: true,
    counterPos: new THREE.Vector3(0, 0, -1.8),
    interiorDecor: (group) => {
      // Balcão de granito escuro com base de madeira
      const counterGeo = new THREE.BoxGeometry(7.0, 1.15, 1.3);
      const counterMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
      const counter = new THREE.Mesh(counterGeo, counterMat);
      counter.position.set(0, 0.58, -2.5);
      counter.castShadow = true;
      group.add(counter);

      // Caixa Registradora moderna
      const regGeo = new THREE.BoxGeometry(0.7, 0.45, 0.55);
      const regMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const reg = new THREE.Mesh(regGeo, regMat);
      reg.position.set(1.8, 1.35, -2.5);
      group.add(reg);

      // Pilhas de caixas de pizza vermelhas
      for (let p = 0; p < 5; p++) {
        const boxGeo = new THREE.BoxGeometry(0.85, 0.12, 0.85);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(-1.8, 1.2 + p * 0.13, -2.5);
        box.castShadow = true;
        group.add(box);
      }

      // Forno a lenha de tijolos rústicos com fogo crepitante
      const ovenGeo = new THREE.CylinderGeometry(1.6, 2.0, 3.2, 16);
      const ovenMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95 });
      const oven = new THREE.Mesh(ovenGeo, ovenMat);
      oven.position.set(5.0, 1.6, -5.5);
      oven.castShadow = true;
      group.add(oven);

      const fireLight = new THREE.PointLight(0xf97316, 2.8, 8.0);
      fireLight.position.set(5.0, 1.2, -4.5);
      group.add(fireLight);

      // Mesas italianas com cadeiras
      for (let m = -1; m <= 1; m += 2) {
        const tableGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.95, 16);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(m * 4.6, 0.48, 2.8);
        table.castShadow = true;
        group.add(table);
      }
    },
  });

  // 2. PADARIA PÃO QUENTINHO (Toldo laranja, vitrine de doces, pães quentinhos e fachada acolhedora)
  const bakeryFloorTex = createWoodFloorTexture();
  const bakeryStuccoTex = createBrickTexture('#d97706', '#fef3c7');

  createRealisticShop({
    id: 'padaria_pao_quentinho',
    name: 'Padaria Pão Quentinho',
    category: 'job',
    pos: new THREE.Vector3(-42, 0, -24),
    size: new THREE.Vector3(15, 6.0, 15),
    doorWidth: 3.6,
    wallTexture: bakeryStuccoTex,
    wallColor: 0xfef3c7,
    roofColor: 0x78350f,
    floorTexture: bakeryFloorTex,
    signTitle: 'PADARIA PÃO QUENTINHO',
    signBgColor: 0xd97706,
    awningColor: 0xf97316, // TOLDO LARANJA
    awningType: 'solid',
    hasGlassDoor: true, // VITRINE E PORTA DE VIDRO
    counterPos: new THREE.Vector3(0, 0, -1.8),
    interiorDecor: (group) => {
      // Balcão expositor com vitrine de vidro temperado
      const caseGeo = new THREE.BoxGeometry(6.6, 1.2, 1.4);
      const caseMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.4 });
      const vitrine = new THREE.Mesh(caseGeo, caseMat);
      vitrine.position.set(0, 0.6, -2.6);
      vitrine.castShadow = true;
      group.add(vitrine);

      // Cestos com baguettes douradas
      for (let b = -2; b <= 2; b += 2) {
        const basketGeo = new THREE.CylinderGeometry(0.45, 0.38, 0.7, 10);
        const basketMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
        const basket = new THREE.Mesh(basketGeo, basketMat);
        basket.position.set(b * 1.2, 1.45, -2.6);
        basket.castShadow = true;
        group.add(basket);
      }

      // Estufa de salgados iluminada
      const warmerGeo = new THREE.BoxGeometry(1.6, 0.9, 1.1);
      const warmerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
      const warmer = new THREE.Mesh(warmerGeo, warmerMat);
      warmer.position.set(-2.0, 1.5, -2.6);
      warmer.castShadow = true;
      group.add(warmer);
    },
  });

  // 3. MERCADINHO CENTRAL (Toldo verde, porta de vidro, gôndolas e fachada clara verde menta)
  const marketFloorTex = createCheckeredFloorTexture('#f8fafc', '#94a3b8');

  createRealisticShop({
    id: 'supermercado_central',
    name: 'Mercadinho Central',
    category: 'shop',
    pos: new THREE.Vector3(-20, 0, 27),
    size: new THREE.Vector3(19, 6.8, 17),
    doorWidth: 4.4,
    wallColor: 0xd1fae5, // Parede clara verde menta, NÃO azul
    roofColor: 0x064e3b,
    floorTexture: marketFloorTex,
    signTitle: 'MERCADINHO',
    signBgColor: 0x15803d,
    awningColor: 0x16a34a, // TOLDO VERDE
    awningType: 'solid',
    hasGlassDoor: true, // PORTA DE VIDRO
    counterPos: new THREE.Vector3(0, 0, 1.2),
    interiorDecor: (group) => {
      // 3 Corredores com prateleiras e caixas de frutas
      for (let aisle = -1; aisle <= 1; aisle++) {
        const shelfGeo = new THREE.BoxGeometry(1.8, 2.6, 8.5);
        const shelfMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(aisle * 5.0, 1.3, -2.2);
        shelf.castShadow = true;
        group.add(shelf);

        // Frutas coloridas (maçãs, laranjas, peras)
        for (let row = 0; row < 3; row++) {
          const fruitGeo = new THREE.SphereGeometry(0.24, 8, 8);
          const fMat = new THREE.MeshStandardMaterial({ color: aisle === -1 ? 0xdc2626 : (aisle === 0 ? 0xf97316 : 0x84cc16) });
          const fruit = new THREE.Mesh(fruitGeo, fMat);
          fruit.position.set(aisle * 5.0 + 0.7, 0.9 + row * 0.7, -4.0 + row * 2.1);
          fruit.castShadow = true;
          group.add(fruit);
        }
      }

      // Checkout com leitor de código de barras
      const checkoutGeo = new THREE.BoxGeometry(5.4, 1.05, 1.3);
      const checkoutMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
      const checkout = new THREE.Mesh(checkoutGeo, checkoutMat);
      checkout.position.set(0, 0.52, 4.2);
      checkout.castShadow = true;
      group.add(checkout);
    },
  });

  // 4. LOJA DE BRINQUEDOS (Toldo colorido listrado, fachada amarela alegre, Urso Gigante e pistas)
  const toyFloorTex = createCheckeredFloorTexture('#fdf4ff', '#e9d5ff');

  createRealisticShop({
    id: 'loja_de_brinquedos_mundo_magico',
    name: 'Loja de Brinquedos',
    category: 'shop',
    pos: new THREE.Vector3(-45, 0, 27),
    size: new THREE.Vector3(17, 6.4, 17),
    doorWidth: 4.0,
    wallColor: 0xfef9c3, // Amarelo claro lúdico, NÃO azul
    roofColor: 0x6b21a8,
    floorTexture: toyFloorTex,
    signTitle: 'BRINQUEDOS',
    signBgColor: 0x7c3aed,
    signTextColor: '#facc15',
    awningType: 'striped_colorful', // TOLDO COLORIDO (vermelho, amarelo, azul, verde)
    hasGlassDoor: true, // PORTA DE VIDRO
    counterPos: new THREE.Vector3(0, 0, 0),
    interiorDecor: (group) => {
      // Pedestal circular central com Urso Gigante
      const pedGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.55, 20);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.set(0, 0.28, 0);
      ped.castShadow = true;
      group.add(ped);

      const bearBody = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 14), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 }));
      bearBody.position.set(0, 1.1, 0);
      bearBody.castShadow = true;
      group.add(bearBody);
      const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 14), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 }));
      bearHead.position.set(0, 1.85, 0);
      bearHead.castShadow = true;
      group.add(bearHead);

      // Mesas com carrinhos esportivos e bolas de futebol
      for (let s = -1; s <= 1; s += 2) {
        const tableGeo = new THREE.BoxGeometry(2.0, 0.95, 4.2);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(s * 5.2, 0.48, -2.2);
        table.castShadow = true;
        group.add(table);

        const miniCar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 1.1), new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 }));
        miniCar.position.set(s * 5.2, 1.15, -2.2);
        miniCar.castShadow = true;
        group.add(miniCar);
      }
    },
  });

  // 5. OFICINA MECÂNICA (Parede cinza industrial, porta de garagem cinza escuro, placa amarela com letras pretas OFICINA, 4 pneus empilhados, carro prata dentro, caixa vermelha e mancha no chão)
  const workshopFloorTex = createCheckeredFloorTexture('#64748b', '#475569');

  createRealisticShop({
    id: 'oficina_mecanica',
    name: 'Oficina do Theo',
    category: 'shop',
    pos: new THREE.Vector3(28, 0, -26),
    size: new THREE.Vector3(18, 6.4, 18),
    doorWidth: 5.6,
    wallColor: 0x475569, // PAREDE CINZA ESCURO INDUSTRIAL (NÃO azul!)
    roofColor: 0x1e293b,
    floorTexture: workshopFloorTex,
    signTitle: 'OFICINA', // PLACA AMARELA COM LETRAS PRETAS OFICINA
    signBgColor: 0xfacc15,
    signTextColor: '#000000',
    awningType: 'none', // Sem toldo de loja, é uma oficina mecânica
    hasGarageDoor: true, // PORTA DE GARAGEM CINZA ESCURO
    counterPos: new THREE.Vector3(3.2, 0, 1.5),
    interiorDecor: (group) => {
      const halfW = 9.0;
      const halfD = 9.0;

      // 1. 4 PNEUS PRETOS EMPILHADOS NA FRENTE DA OFICINA
      for (let t = 0; t < 4; t++) {
        const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 16);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const tire = new THREE.Mesh(tireGeo, tireMat);
        tire.position.set(halfW - 1.8, 0.11 + t * 0.23, halfD + 1.3);
        tire.castShadow = true;
        group.add(tire);

        // Furo da roda do pneu
        const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.23, 12);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.set(halfW - 1.8, 0.11 + t * 0.23, halfD + 1.3);
        group.add(rim);
      }

      // 2. 1 CARRO PRATA PARADO DENTRO DA OFICINA
      const silverCar = new THREE.Group();
      silverCar.position.set(-1.8, 0, -0.8);

      // Chassi prata metálico
      const silverBody = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.78, 4.2),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.25 })
      );
      silverBody.position.y = 0.68;
      silverBody.castShadow = true;
      silverCar.add(silverBody);

      // Cabine prata
      const silverCabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.85, 0.72, 2.3),
        new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.3 })
      );
      silverCabin.position.set(0, 1.4, -0.2);
      silverCabin.castShadow = true;
      silverCar.add(silverCabin);

      // Vidro para-brisa preto na frente do carro prata
      const silverGlass = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.58, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.9 })
      );
      silverGlass.position.set(0, 1.4, 0.96);
      silverCar.add(silverGlass);

      // Faróis amarelos no carro prata
      for (const s of [-0.85, 0.85]) {
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.5 })
        );
        head.position.set(s, 0.68, 2.12);
        silverCar.add(head);
      }

      // 4 Rodas pretas com calota cinza no carro prata
      const silverWheelOffsets = [
        [-1.1, 0.38, 1.3],
        [1.1, 0.38, 1.3],
        [-1.1, 0.38, -1.3],
        [1.1, 0.38, -1.3],
      ];
      silverWheelOffsets.forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.28, 14),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
        );
        w.rotateZ(Math.PI / 2);
        w.position.set(wx, wy, wz);
        w.castShadow = true;

        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, 0.29, 10),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 })
        );
        hub.rotateZ(Math.PI / 2);
        w.add(hub);

        silverCar.add(w);
      });

      group.add(silverCar);

      // 3. CAIXA DE FERRAMENTAS VERMELHA
      const toolbox = new THREE.Group();
      toolbox.position.set(2.4, 0.18, 0.4);

      const tbBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.38, 0.48),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.4 })
      );
      tbBody.castShadow = true;
      toolbox.add(tbBody);

      // Alça metálica preta
      const tbHandle = new THREE.Mesh(
        new THREE.TorusGeometry(0.13, 0.02, 6, 12, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
      );
      tbHandle.position.y = 0.22;
      toolbox.add(tbHandle);

      group.add(toolbox);

      // 4. MANCHA ESCURA DE ÓLEO NO CHÃO
      const oilGeo = new THREE.CircleGeometry(1.5, 16);
      oilGeo.rotateX(-Math.PI / 2);
      const oilMat = new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.2,
        metalness: 0.5,
      });
      const oilMesh = new THREE.Mesh(oilGeo, oilMat);
      oilMesh.position.set(-1.6, 0.11, 0.4);
      oilMesh.scale.set(1.4, 1.0, 0.9);
      oilMesh.receiveShadow = true;
      group.add(oilMesh);

      // 5. BANCADA DE OFICINA MECÂNICA COM MORSAS E CHAVES
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 1.1, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 })
      );
      bench.position.set(4.8, 0.55, -4.5);
      bench.castShadow = true;
      group.add(bench);

      // Painel perfurado de ferramentas na parede
      const toolPegboard = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.8, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
      );
      toolPegboard.position.set(4.8, 2.2, -8.7);
      group.add(toolPegboard);
    },
  });

  // 6. PRAÇA CENTRAL & GRANDE FONTE D'ÁGUA BORBULHANTE
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(30, 0, 27);

  const basinGeo = new THREE.CylinderGeometry(5.8, 6.4, 0.85, 32);
  const basinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.55 });
  const basin = new THREE.Mesh(basinGeo, basinMat);
  basin.position.y = 0.42;
  basin.castShadow = true;
  fountainGroup.add(basin);

  const fWaterGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.25, 32);
  const fWater = new THREE.Mesh(fWaterGeo, waterMat);
  fWater.position.y = 0.76;
  fountainGroup.add(fWater);

  const columnGeo = new THREE.CylinderGeometry(0.7, 0.95, 3.0, 16);
  const column = new THREE.Mesh(columnGeo, basinMat);
  column.position.y = 1.8;
  fountainGroup.add(column);

  scene.add(fountainGroup);
  circleColliders.push({ x: 30, z: 27, radius: 6.4, name: 'fountain_basin' });

  locations.push({
    id: 'parque_jardineiro',
    name: 'Parque & Canteiros de Flores',
    category: 'job',
    position: new THREE.Vector3(30, 0, 17),
    markerMesh: new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.5 })),
    label: 'Jardineiro do Parque (R$ 10)',
    radius: 4.0,
    isInside: false,
  });

  // Canteiros de flores coloridas
  const flowerBedCoords = [
    new THREE.Vector3(22, 0, 18),
    new THREE.Vector3(38, 0, 18),
    new THREE.Vector3(30, 0, 36),
  ];
  flowerBedCoords.forEach((fb) => {
    flowerBeds.push(fb);
    const bedGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.28, 16);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.copy(fb);
    bed.position.y = 0.14;
    scene.add(bed);

    for (let f = 0; f < 7; f++) {
      const flowerGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const fMat = new THREE.MeshStandardMaterial({
        color: f % 2 === 0 ? 0xef4444 : 0xf59e0b,
        emissive: f % 2 === 0 ? 0x991b1b : 0xb45309,
        emissiveIntensity: 0.35,
      });
      const fl = new THREE.Mesh(flowerGeo, fMat);
      fl.position.set(fb.x + Math.sin(f * 1.0) * 0.8, 0.45, fb.z + Math.cos(f * 1.0) * 0.8);
      scene.add(fl);
    }
  });

  // 7. BAIRRO RESIDENCIAL: CASAS DOS VIZINHOS
  const houseColors = [0xfef08a, 0xbae6fd, 0xfbcfe8, 0xdcfce7, 0xfde047];
  const houseRoofColors = [0xb91c1c, 0x1e3a8a, 0x831843, 0x14532d, 0xc2410c];

  for (let h = 0; h < 5; h++) {
    const hPos = new THREE.Vector3(-48 + h * 11.5, 0, -80);
    const houseGroup = new THREE.Group();
    houseGroup.position.copy(hPos);

    const hGeo = new THREE.BoxGeometry(8.0, 4.8, 8.0);
    const hMat = new THREE.MeshStandardMaterial({ color: houseColors[h], roughness: 0.65 });
    const houseMesh = new THREE.Mesh(hGeo, hMat);
    houseMesh.position.y = 2.4;
    houseMesh.castShadow = true;
    houseGroup.add(houseMesh);

    const roofConeGeo = new THREE.ConeGeometry(6.4, 2.6, 4);
    roofConeGeo.rotateY(Math.PI / 4);
    const roofConeMat = new THREE.MeshStandardMaterial({ color: houseRoofColors[h], roughness: 0.55 });
    const roofMesh = new THREE.Mesh(roofConeGeo, roofConeMat);
    roofMesh.position.y = 6.1;
    roofMesh.castShadow = true;
    houseGroup.add(roofMesh);

    // Caixa de correio na calçada
    const mbPos = new THREE.Vector3(hPos.x + 2.8, 0, -59.0);
    mailboxes.push(mbPos);
    customerHouses.push(new THREE.Vector3(hPos.x, 0, -61.0));

    const postGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.0, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(mbPos.x, 0.5, mbPos.z);
    scene.add(post);

    const boxGeo = new THREE.BoxGeometry(0.38, 0.28, 0.48);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const mbBox = new THREE.Mesh(boxGeo, boxMat);
    mbBox.position.set(mbPos.x, 1.1, mbPos.z);
    scene.add(mbBox);

    scene.add(houseGroup);

    boxColliders.push({
      minX: hPos.x - 4.2,
      maxX: hPos.x + 4.2,
      minZ: hPos.z - 4.2,
      maxZ: hPos.z + 4.2,
      name: `house_${h}`
    });
  }

  // --- ÁRVORES COM CARA DE ÁRVORE (TRONCO MARROM + 2 VOLUMES VERDES DE TAMANHOS DIFERENTES + GALHOS + CANTEIRO) ---
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x543310,
    roughness: 0.9,
    flatShading: true,
  });

  const canopyLowerMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Verde floresta profundo
    roughness: 0.8,
    flatShading: true,
  });

  const canopyUpperMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // Verde folha vibrante
    roughness: 0.75,
    flatShading: true,
  });

  const canopyTuftMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a, // Verde médio para tufos
    roughness: 0.8,
    flatShading: true,
  });

  const mulchMat = new THREE.MeshStandardMaterial({ color: 0x2d1808, roughness: 0.95 });
  const appleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });

  const createParkTree = (tx: number, tz: number, hasApples = false) => {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);

    // 1. Canteiro circular de pedra com terra fértil na base (dá cara de praça e parque!)
    const curb = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.3, 0.12, 16), curbMat);
    curb.position.y = 0.06;
    curb.receiveShadow = true;
    tree.add(curb);

    const mulch = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.13, 16), mulchMat);
    mulch.position.y = 0.065;
    mulch.receiveShadow = true;
    tree.add(mulch);

    // Pequenas florezinhas de enfeite no canteiro da árvore
    const flowerColors = [0xef4444, 0xfacc15, 0xec4899, 0x38bdf8];
    for (let f = 0; f < 4; f++) {
      const fAngle = (f * Math.PI * 2) / 4 + 0.3;
      const flw = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshStandardMaterial({ color: flowerColors[f], roughness: 0.5 })
      );
      flw.position.set(Math.sin(fAngle) * 0.85, 0.15, Math.cos(fAngle) * 0.85);
      tree.add(flw);
    }

    // 2. Tronco de madeira marrom cônico realista
    const trunkGeo = new THREE.CylinderGeometry(0.26, 0.44, 2.7, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.35;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Raízes visíveis de apoio fincadas no chão
    for (let r = 0; r < 4; r++) {
      const rootAngle = (r * Math.PI * 2) / 4;
      const rootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.52), trunkMat);
      rootMesh.position.set(Math.sin(rootAngle) * 0.38, 0.08, Math.cos(rootAngle) * 0.38);
      rootMesh.rotation.y = rootAngle;
      rootMesh.castShadow = true;
      rootMesh.receiveShadow = true;
      tree.add(rootMesh);
    }

    // 3. Galhos grossos no topo que sustentam visivelmente a copa
    const branchConfigs = [
      { angleY: 0.3, angleZ: 0.45, y: 2.3, scale: 0.95 },
      { angleY: 2.3, angleZ: -0.4, y: 2.35, scale: 0.9 },
      { angleY: 4.2, angleZ: 0.42, y: 2.4, scale: 0.85 },
    ];

    branchConfigs.forEach(({ angleY, angleZ, y, scale }) => {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 1.15 * scale, 7), trunkMat);
      branch.position.set(Math.sin(angleY) * 0.28, y, Math.cos(angleY) * 0.28);
      branch.rotation.y = angleY;
      branch.rotation.z = angleZ;
      branch.castShadow = true;
      tree.add(branch);
    });

    // 4. BOLA VERDE MAIOR NA BASE DA COPA (Volume inferior facetado estilo Free Fire / GTA)
    const canopyLowerGeo = new THREE.DodecahedronGeometry(1.85, 1);
    const canopyLower = new THREE.Mesh(canopyLowerGeo, canopyLowerMat);
    canopyLower.position.set(0, 3.25, 0);
    canopyLower.scale.set(1.18, 0.92, 1.14);
    canopyLower.castShadow = true;
    canopyLower.receiveShadow = true;
    tree.add(canopyLower);

    // 5. BOLA VERDE MENOR NO TOPO (Volume superior vibrante coroando a árvore)
    const canopyUpperGeo = new THREE.DodecahedronGeometry(1.28, 1);
    const canopyUpper = new THREE.Mesh(canopyUpperGeo, canopyUpperMat);
    canopyUpper.position.set(0.12, 4.38, 0.1);
    canopyUpper.scale.set(1.05, 0.95, 1.05);
    canopyUpper.castShadow = true;
    canopyUpper.receiveShadow = true;
    tree.add(canopyUpper);

    // 6. Tufos laterais orgânicos que dão volume natural e silhueta de árvore viva
    const tuft1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), canopyTuftMat);
    tuft1.position.set(-0.75, 3.05, -0.45);
    tuft1.castShadow = true;
    tree.add(tuft1);

    const tuft2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), canopyTuftMat);
    tuft2.position.set(0.72, 3.15, 0.4);
    tuft2.castShadow = true;
    tree.add(tuft2);

    // Maçãzinhas vermelhas decorativas no parque
    if (hasApples) {
      const applePositions = [
        [-0.85, 2.7, 0.5],
        [0.8, 2.9, -0.6],
        [-0.3, 3.6, 0.95],
        [0.7, 3.7, 0.6],
        [0.0, 4.6, -0.6],
      ];
      applePositions.forEach(([ax, ay, az]) => {
        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), appleMat);
        apple.position.set(ax, ay, az);
        apple.castShadow = true;
        tree.add(apple);
      });
    }

    scene.add(tree);
    circleColliders.push({ x: tx, z: tz, radius: 0.85, name: 'tree' });
  };

  // Coqueiros Tropicais na Praia (Estilo GTA Vice City / San Andreas infantil)
  const palmMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const palmFrondMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7, flatShading: true });
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x3e1f07, roughness: 0.8 });

  const createPalmTree = (px: number, pz: number) => {
    const palm = new THREE.Group();
    palm.position.set(px, 0, pz);

    // Canteiro de areia com pedrinhas
    const basePebble = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.1, 12), curbMat);
    basePebble.position.y = 0.05;
    basePebble.receiveShadow = true;
    palm.add(basePebble);

    // Tronco esbelto segmentado e levemente curvo em direção ao mar
    const numSegments = 6;
    let curY = 0.35;
    let curX = 0;
    for (let s = 0; s < numSegments; s++) {
      const segH = 0.65;
      const bottomR = 0.26 - s * 0.02;
      const topR = 0.24 - s * 0.02;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(topR, bottomR, segH, 8), palmMat);
      seg.position.set(curX, curY, 0);
      seg.rotation.z = -0.06;
      seg.castShadow = true;
      seg.receiveShadow = true;
      palm.add(seg);

      curY += segH * 0.96;
      curX += 0.09;
    }

    // Cacho de 4 cocos marrons no topo
    for (let c = 0; c < 4; c++) {
      const cAngle = (c * Math.PI * 2) / 4;
      const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), coconutMat);
      coconut.position.set(curX + Math.sin(cAngle) * 0.25, curY - 0.1, Math.cos(cAngle) * 0.25);
      coconut.castShadow = true;
      palm.add(coconut);
    }

    // 7 Folhas largas curvadas (Frondes de palmeira)
    for (let f = 0; f < 7; f++) {
      const fAngle = (f * Math.PI * 2) / 7;
      const frondGroup = new THREE.Group();
      frondGroup.position.set(curX, curY + 0.1, 0);
      frondGroup.rotation.y = fAngle;

      // Base da folha subindo
      const part1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 1.4), palmFrondMat);
      part1.position.set(0, 0.25, 0.7);
      part1.rotation.x = 0.35;
      part1.castShadow = true;
      frondGroup.add(part1);

      // Ponta da folha caindo suavemente
      const part2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 1.5), palmFrondMat);
      part2.position.set(0, 0.35, 2.0);
      part2.rotation.x = -0.45;
      part2.castShadow = true;
      frondGroup.add(part2);

      palm.add(frondGroup);
    }

    scene.add(palm);
    circleColliders.push({ x: px, z: pz, radius: 0.75, name: 'palm' });
  };

  // Posicionamento das árvores no Parque, Ruas e Centro
  const urbanTreePositions: [number, number, boolean][] = [
    [-7.0, -22, false], [-7.0, 22, false], [-7.0, 48, false], 
    [7.0, -22, false], [7.0, 22, false], [7.0, 48, false],
    [-52, -6, false], [-52, 6, false], [50, -6, false], [50, 6, false], 
    [22, 45, false], [38, 45, false],
    [-72, -22, false], [-72, 22, false], [-22, -58, false], [22, -58, false],
    // Praça & Parque Central com macieiras
    [-24, -28, true], [-16, -34, false], [-30, -32, true], [-36, -24, false],
    [-18, -12, false], [-32, -14, true]
  ];

  urbanTreePositions.forEach(([tx, tz, hasApples]) => {
    createParkTree(tx, tz, hasApples);
  });

  // Coqueiros na Praia (Lado leste / praia)
  const beachPalmPositions: [number, number][] = [
    [70, -38], [70, -14], [70, 16], [70, 44], [78, 2], [76, -26], [82, 28]
  ];

  beachPalmPositions.forEach(([px, pz]) => {
    createPalmTree(px, pz);
  });

  // --- BANCOS DE PRAÇA DE MADEIRA COM ESTRUTURA DE FERRO ---
  const benchPositions = [
    [-12, -8.5, 0],
    [-24, -8.5, 0],
    [12, -8.5, 0],
    [24, -8.5, 0],
    [-12, 8.5, Math.PI],
    [12, 8.5, Math.PI],
    [26, 18, -Math.PI / 2],
    [34, 18, -Math.PI / 2],
  ];

  const benchWoodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 });
  const benchIronMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });

  benchPositions.forEach(([bx, bz, rotY]) => {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(bx, 0.08, bz);
    benchGroup.rotation.y = rotY;

    // Pernas de ferro
    for (const legX of [-0.9, 0.9]) {
      const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.45);
      const leg = new THREE.Mesh(legGeo, benchIronMat);
      leg.position.set(legX, 0.22, 0);
      leg.castShadow = true;
      benchGroup.add(leg);
    }

    // Réguas de madeira do assento
    for (let s = 0; s < 3; s++) {
      const slatGeo = new THREE.BoxGeometry(2.0, 0.04, 0.12);
      const slat = new THREE.Mesh(slatGeo, benchWoodMat);
      slat.position.set(0, 0.45, -0.15 + s * 0.15);
      slat.castShadow = true;
      benchGroup.add(slat);
    }

    // Encosto de madeira
    for (let b = 0; b < 2; b++) {
      const backSlatGeo = new THREE.BoxGeometry(2.0, 0.12, 0.04);
      const backSlat = new THREE.Mesh(backSlatGeo, benchWoodMat);
      backSlat.position.set(0, 0.65 + b * 0.16, -0.22);
      backSlat.castShadow = true;
      benchGroup.add(backSlat);
    }

    scene.add(benchGroup);
  });

  // --- HIDRANTES DE INCÊNDIO VERMELHOS CLÁSSICOS ---
  const hydrantPositions = [
    [-7.5, -14],
    [7.5, -14],
    [-7.5, 14],
    [7.5, 14],
    [-48, -7.5],
    [48, -7.5],
  ];

  const hydrantRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.4 });
  const hydrantSilverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

  hydrantPositions.forEach(([hx, hz]) => {
    const hydrant = new THREE.Group();
    hydrant.position.set(hx, 0.08, hz);

    const baseGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.65, 12);
    const base = new THREE.Mesh(baseGeo, hydrantRedMat);
    base.position.y = 0.32;
    base.castShadow = true;
    hydrant.add(base);

    const capGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const cap = new THREE.Mesh(capGeo, hydrantRedMat);
    cap.position.y = 0.65;
    hydrant.add(cap);

    // Bicos laterais cromados
    for (const side of [-1, 1]) {
      const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 10);
      nozzleGeo.rotateZ(Math.PI / 2);
      const nozzle = new THREE.Mesh(nozzleGeo, hydrantSilverMat);
      nozzle.position.set(side * 0.22, 0.42, 0);
      hydrant.add(nozzle);
    }

    scene.add(hydrant);
  });

  // --- NUVENS 3D FOFAS FLUTUANTES NO CÉU ---
  const clouds: THREE.Group[] = [];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.05,
    transparent: true,
    opacity: 0.92,
  });

  for (let c = 0; c < 9; c++) {
    const cloud = new THREE.Group();
    cloud.position.set(
      -120 + Math.random() * 240,
      38 + Math.random() * 14,
      -100 + Math.random() * 200
    );

    // Aglomerado de 5 esferas volumosas formando uma nuvem
    for (let p = 0; p < 5; p++) {
      const radius = 3.5 + Math.random() * 3.5;
      const puffGeo = new THREE.SphereGeometry(radius, 10, 10);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (p - 2) * 3.8 + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 3
      );
      cloud.add(puff);
    }

    scene.add(cloud);
    clouds.push(cloud);
  }

  // =========================================================================
  // --- CARROS COLORIDOS REALISTAS COM PINTURA BRILHANTE E RODAS DETALHADAS ---
  // =========================================================================
  const routeCircuit1: THREE.Vector3[] = [
    new THREE.Vector3(3.4, 0, -90),
    new THREE.Vector3(3.4, 0, 90),
    new THREE.Vector3(58, 0, 90),
    new THREE.Vector3(58, 0, -90),
  ];

  const routeCircuit2: THREE.Vector3[] = [
    new THREE.Vector3(-3.4, 0, 90),
    new THREE.Vector3(-3.4, 0, -90),
    new THREE.Vector3(-58, 0, -90),
    new THREE.Vector3(-58, 0, 90),
  ];

  const routeCircuit3: THREE.Vector3[] = [
    new THREE.Vector3(-90, 0, 3.4),
    new THREE.Vector3(90, 0, 3.4),
    new THREE.Vector3(90, 0, -52),
    new THREE.Vector3(-90, 0, -52),
  ];

  const carConfigs = [
    { name: 'Táxi Amarelo', body: 0xfacc15, roof: 0x0f172a, route: routeCircuit1, startWp: 0 },
    { name: 'Carro Azul Esportivo', body: 0x2563eb, roof: 0x1e293b, route: routeCircuit2, startWp: 0 },
    { name: 'Van Vermelha', body: 0xdc2626, roof: 0xf8fafc, route: routeCircuit1, startWp: 2 },
    { name: 'Fusquinha Verde', body: 0x16a34a, roof: 0x15803d, route: routeCircuit2, startWp: 2 },
    { name: 'Picape Laranja', body: 0xf97316, roof: 0x431407, route: routeCircuit3, startWp: 0 },
  ];

  const cars: CityCar[] = [];

  const createDetailedCar = (cfg: typeof carConfigs[0]): { group: THREE.Group; wheels: THREE.Mesh[] } => {
    const carGroup = new THREE.Group();

    // Chassi com pintura automotiva metálica brilhante e design aerodinâmico
    const bodyGeo = new THREE.BoxGeometry(2.2, 0.85, 4.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: cfg.body,
      roughness: 0.25,
      metalness: 0.65,
    });
    const carBody = new THREE.Mesh(bodyGeo, bodyMat);
    carBody.position.y = 0.72;
    carBody.castShadow = true;
    carBody.receiveShadow = true;
    carGroup.add(carBody);

    // Parachoque dianteiro preto/cinza escuro
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.28, 0.3), bumperMat);
    frontBumper.position.set(0, 0.42, 2.28);
    frontBumper.castShadow = true;
    carGroup.add(frontBumper);

    // Parachoque traseiro preto
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.28, 0.3), bumperMat);
    rearBumper.position.set(0, 0.42, -2.28);
    rearBumper.castShadow = true;
    carGroup.add(rearBumper);

    // Grade frontal do radiador preta
    const grill = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 0.08), new THREE.MeshStandardMaterial({ color: 0x0a0f1d, metalness: 0.8 }));
    grill.position.set(0, 0.68, 2.27);
    carGroup.add(grill);

    // Placa branca na frente
    const plateGeo = new THREE.BoxGeometry(0.7, 0.18, 0.04);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const frontPlate = new THREE.Mesh(plateGeo, plateMat);
    frontPlate.position.set(0, 0.4, 2.44);
    carGroup.add(frontPlate);

    const rearPlate = new THREE.Mesh(plateGeo, plateMat);
    rearPlate.position.set(0, 0.4, -2.44);
    carGroup.add(rearPlate);

    // Cabine com teto aerodinâmico
    const cabinGeo = new THREE.BoxGeometry(1.9, 0.78, 2.4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: cfg.roof, roughness: 0.3, metalness: 0.5 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.45, -0.2);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    carGroup.add(cabin);

    // 1. VIDRO PRETO NA FRENTE (Para-brisa preto brilhante aerodinâmico)
    const blackGlassMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Vidro preto puro
      roughness: 0.12,
      metalness: 0.85,
    });

    const windshieldGeo = new THREE.BoxGeometry(1.75, 0.65, 0.12);
    windshieldGeo.rotateX(0.24);
    const windshield = new THREE.Mesh(windshieldGeo, blackGlassMat);
    windshield.position.set(0, 1.4, 1.02);
    windshield.castShadow = true;
    carGroup.add(windshield);

    // Vidros laterais pretos fumê
    for (const s of [-1, 1]) {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 1.8), blackGlassMat);
      sideGlass.position.set(s * 0.96, 1.42, -0.2);
      carGroup.add(sideGlass);

      // Maçanetas das portas
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.18), bumperMat);
      handle.position.set(s * 1.12, 0.85, 0.1);
      carGroup.add(handle);
    }

    // Vidro traseiro preto
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.54, 0.08), blackGlassMat);
    rearGlass.position.set(0, 1.42, -1.38);
    carGroup.add(rearGlass);

    // 2. FAROL AMARELO NA FRENTE (Emissivo amarelo dourado vibrante)
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const lightGeo = new THREE.BoxGeometry(0.38, 0.22, 0.12);

    const headL = new THREE.Mesh(lightGeo, headlightMat);
    headL.position.set(-0.82, 0.74, 2.26);
    carGroup.add(headL);

    const headR = new THREE.Mesh(lightGeo, headlightMat);
    headR.position.set(0.82, 0.74, 2.26);
    carGroup.add(headR);

    // 3. FAROL VERMELHO ATRÁS (Lanternas traseiras vermelhas luminosas)
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    const tailL = new THREE.Mesh(lightGeo, tailMat);
    tailL.position.set(-0.82, 0.74, -2.26);
    carGroup.add(tailL);

    const tailR = new THREE.Mesh(lightGeo, tailMat);
    tailR.position.set(0.82, 0.74, -2.26);
    carGroup.add(tailR);

    // Retrovisores laterais
    for (const s of [-1, 1]) {
      const mirrorGeo = new THREE.BoxGeometry(0.32, 0.16, 0.2);
      const mirror = new THREE.Mesh(mirrorGeo, bodyMat);
      mirror.position.set(s * 1.15, 1.3, 0.7);
      mirror.castShadow = true;
      carGroup.add(mirror);
    }

    // 4. 4 RODAS PRETAS COM CALOTA CINZA
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.32, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 }); // Pneu preto

    // Calota cinza metálica
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Cinza
      metalness: 0.85,
      roughness: 0.3,
    });

    const wheelOffsets = [
      [-1.1, 0.4, 1.4],
      [1.1, 0.4, 1.4],
      [-1.1, 0.4, -1.4],
      [1.1, 0.4, -1.4],
    ];

    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;

      // Calota cinza no centro da roda
      const hubGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.33, 12);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, hubMat);
      wheel.add(hub);

      // Centro do cubo preto
      const centerCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.34, 8),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      centerCap.rotateZ(Math.PI / 2);
      wheel.add(centerCap);

      carGroup.add(wheel);
      wheels.push(wheel);
    });

    scene.add(carGroup);
    return { group: carGroup, wheels };
  };

  carConfigs.forEach((cfg) => {
    const { group, wheels } = createDetailedCar(cfg);
    const startPos = cfg.route[cfg.startWp].clone();
    group.position.copy(startPos);

    cars.push({
      group,
      colorName: cfg.name,
      speed: 7.2,
      maxSpeed: 7.8,
      waypoints: cfg.route,
      currentWpIndex: (cfg.startWp + 1) % cfg.route.length,
      rotationY: 0,
      wheels,
      honkCooldown: 0,
      stoppedByRedLight: false,
      stoppedByPedestrian: false,
      hasTheoPassenger: false,
    });
  });

  // =========================================================================
  // --- MOTOS COLORIDAS ESTILOSAS (ESPORTIVAS & SCOOTERS) NO CENÁRIO ---
  // =========================================================================
  const motos: CityMoto[] = [];

  const createDetailedMotorcycle = (cfg: {
    name: string;
    bodyColor: number;
    hasDriver?: boolean;
  }): { group: THREE.Group; wheels: THREE.Mesh[]; frontFork: THREE.Group; rider?: THREE.Group } => {
    const motoGroup = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
    const bodyMat = new THREE.MeshStandardMaterial({ color: cfg.bodyColor, metalness: 0.7, roughness: 0.25 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    // Chassi central
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 1.2), frameMat);
    chassis.position.y = 0.58;
    chassis.castShadow = true;
    motoGroup.add(chassis);

    // Tanque de combustível aerodinâmico
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.35, 0.7), bodyMat);
    tank.position.set(0, 0.82, 0.15);
    tank.castShadow = true;
    motoGroup.add(tank);

    // Assento preto anatômico
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.75), seatMat);
    seat.position.set(0, 0.76, -0.4);
    seat.castShadow = true;
    motoGroup.add(seat);

    // Escapamento cromado
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.1, 8), chromeMat);
    exhaust.rotation.x = Math.PI / 2 - 0.1;
    exhaust.position.set(0.26, 0.36, -0.35);
    exhaust.castShadow = true;
    motoGroup.add(exhaust);

    // Motor
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.42), chromeMat);
    engine.position.set(0, 0.42, 0.05);
    motoGroup.add(engine);

    // Farol dianteiro
    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 2.2 })
    );
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.9, 0.88);
    motoGroup.add(headlight);

    // Lanterna traseira
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.1, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.8 })
    );
    taillight.position.set(0, 0.78, -0.82);
    motoGroup.add(taillight);

    // Garfo dianteiro articulado com guidão
    const frontFork = new THREE.Group();
    frontFork.position.set(0, 0.42, 0.85);

    const forkPoles = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), chromeMat);
    forkPoles.position.set(0, 0.25, 0);
    forkPoles.rotation.x = -0.22;
    frontFork.add(forkPoles);

    // Guidão
    const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.04), chromeMat);
    handlebar.position.set(0, 0.65, -0.05);
    frontFork.add(handlebar);

    for (const s of [-1, 1]) {
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.06), seatMat);
      grip.position.set(s * 0.36, 0.65, -0.05);
      frontFork.add(grip);
    }

    // Rodas
    const wheels: THREE.Mesh[] = [];
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.16, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.position.set(0, -0.06, 0);
    frontWheel.castShadow = true;
    const fHub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.17, 10), chromeMat);
    fHub.rotateZ(Math.PI / 2);
    frontWheel.add(fHub);
    frontFork.add(frontWheel);
    wheels.push(frontWheel);

    motoGroup.add(frontFork);

    const rearWheel = new THREE.Mesh(wheelGeo, tireMat);
    rearWheel.position.set(0, 0.36, -0.75);
    rearWheel.castShadow = true;
    const rHub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.17, 10), chromeMat);
    rHub.rotateZ(Math.PI / 2);
    rearWheel.add(rHub);
    motoGroup.add(rearWheel);
    wheels.push(rearWheel);

    let riderGroup: THREE.Group | undefined;
    // Piloto NPC na moto em trânsito
    if (cfg.hasDriver) {
      const rider = new THREE.Group();
      rider.position.set(0, 0.75, -0.25);

      const rBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.3), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
      rBody.position.y = 0.32;
      rBody.rotation.x = 0.25;
      rider.add(rBody);

      // Capacete esportivo com viseira
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), new THREE.MeshStandardMaterial({ color: cfg.bodyColor, metalness: 0.5 }));
      helmet.position.set(0, 0.72, 0.1);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.14), new THREE.MeshStandardMaterial({ color: 0x0a0f1d, metalness: 0.9 }));
      visor.position.set(0, 0.72, 0.22);
      rider.add(helmet);
      rider.add(visor);

      motoGroup.add(rider);
      riderGroup = rider;
    }

    scene.add(motoGroup);
    return { group: motoGroup, wheels, frontFork, rider: riderGroup };
  };

  const motoConfigs = [
    { name: 'Moto Esportiva Vermelha', bodyColor: 0xef4444, route: routeCircuit1, startWp: 1, isParked: false, hasDriver: true },
    { name: 'Scooter Ninja Verde', bodyColor: 0x10b981, route: routeCircuit2, startWp: 3, isParked: false, hasDriver: true },
    { name: 'Moto Esportiva Azul (Oficina)', bodyColor: 0x2563eb, initialPos: new THREE.Vector3(26, 0, -16), initialRot: 0.15, isParked: true, hasDriver: false },
    { name: 'Scooter da Pizza Amarela', bodyColor: 0xfacc15, initialPos: new THREE.Vector3(-18, 0, -16), initialRot: -0.2, isParked: true, hasDriver: false },
  ];

  motoConfigs.forEach((cfg) => {
    const { group, wheels, frontFork, rider } = createDetailedMotorcycle(cfg);
    const startPos = cfg.isParked && cfg.initialPos ? cfg.initialPos.clone() : (cfg.route ? cfg.route[cfg.startWp || 0].clone() : new THREE.Vector3());
    group.position.copy(startPos);
    if (cfg.initialRot) group.rotation.y = cfg.initialRot;

    motos.push({
      group,
      colorName: cfg.name,
      speed: cfg.isParked ? 0 : 8.5,
      maxSpeed: 9.2,
      waypoints: cfg.route || [],
      currentWpIndex: cfg.route ? ((cfg.startWp || 0) + 1) % cfg.route.length : 0,
      rotationY: cfg.initialRot || 0,
      wheels,
      frontFork,
      rider,
      isParked: cfg.isParked,
      hasTheoPassenger: false,
    });
  });

  // =========================================================================
  // --- 10 NPCS REALISTAS ESTILO PERSONAGEM THEO LUCCA (ROSTO, CABELO, TÊNIS) ---
  // =========================================================================
  const npcsData: {
    name: string;
    role: string;
    phrase: string;
    pos: THREE.Vector3;
    skinTone: number;
    shirtColor: number;
    pantsColor: number;
    hairColor: number;
    hairStyle: 'bakerHat' | 'policeCap' | 'shortHair' | 'pigtails' | 'curlyBun' | 'fedora' | 'longWavy';
    isChild?: boolean;
    hasApron?: boolean;
  }[] = [
    { 
      name: 'Vovó Maria', 
      role: 'Vovó na Praça', 
      phrase: 'Oi Theo Lucca! Que bênção de dia! Como você está crescendo lindo!', 
      pos: new THREE.Vector3(22, 0, 24),
      skinTone: 0xf6d8ae,
      shirtColor: 0xd8b4fe,
      pantsColor: 0x475569,
      hairColor: 0x94a3b8,
      hairStyle: 'curlyBun',
    },
    { 
      name: 'Carteiro Carlos', 
      role: 'Carteiro Amigo', 
      phrase: 'Olá Theo! As caixas de correio estão prontas para as entregas de jornal!', 
      pos: new THREE.Vector3(-44, 0, -59),
      skinTone: 0xc68652,
      shirtColor: 0x0284c7,
      pantsColor: 0x1e293b,
      hairColor: 0x22130b,
      hairStyle: 'shortHair',
    },
    { 
      name: 'Padeiro Seu Zé', 
      role: 'Mestre da Padaria', 
      phrase: 'Bom dia Theo! Venha ver o pão saindo do forno quentinho e crocante!', 
      pos: new THREE.Vector3(-42, 0, -20),
      skinTone: 0xc68652,
      shirtColor: 0xf59e0b,
      pantsColor: 0x334155,
      hairColor: 0x22130b,
      hairStyle: 'bakerHat',
      hasApron: true,
    },
    { 
      name: 'Florista Dona Rosa', 
      role: 'Cuidando das Flores', 
      phrase: 'Oi Theo Lucca! Que lindo seu boné azul! As flores adoram o seu carinho!', 
      pos: new THREE.Vector3(26, 0, 20),
      skinTone: 0xf6d8ae,
      shirtColor: 0xec4899,
      pantsColor: 0x334155,
      hairColor: 0x64748b,
      hairStyle: 'curlyBun',
    },
    { 
      name: 'Pedrinho', 
      role: 'Criança no Parque', 
      phrase: 'E aí Theo! Vamos brincar de correr no parque?', 
      pos: new THREE.Vector3(-24, 0, 52),
      skinTone: 0xc68652,
      shirtColor: 0x22c55e,
      pantsColor: 0x1d4ed8,
      hairColor: 0x3e1f07,
      hairStyle: 'shortHair',
      isChild: true,
    },
    { 
      name: 'Bia', 
      role: 'Amiguinha da Escola', 
      phrase: 'Oi Theo! Seu tênis vermelho com solado branco é muito maneiro!', 
      pos: new THREE.Vector3(-34, 0, 52),
      skinTone: 0xf6d8ae,
      shirtColor: 0xf43f5e,
      pantsColor: 0x8b5cf6,
      hairColor: 0x22130b,
      hairStyle: 'pigtails',
      isChild: true,
    },
    { 
      name: 'Policial Amigo', 
      role: 'Guarda de Trânsito', 
      phrase: 'Parabéns Theo! Continue sempre atravessando na faixa com segurança!', 
      pos: new THREE.Vector3(8.5, 0, 8.5),
      skinTone: 0x8d5524,
      shirtColor: 0x1e3a8a,
      pantsColor: 0x0f172a,
      hairColor: 0x1e293b,
      hairStyle: 'policeCap',
    },
    { 
      name: 'Dona Carmen', 
      role: 'Cliente do Mercado', 
      phrase: 'Oi Theo! As maçãs do mercado estão docinhas e maravilhosas!', 
      pos: new THREE.Vector3(-20, 0, 22),
      skinTone: 0xe0ac69,
      shirtColor: 0x14b8a6,
      pantsColor: 0x334155,
      hairColor: 0x3e1f07,
      hairStyle: 'curlyBun',
    },
    { 
      name: 'Sr. João', 
      role: 'Morador do Bairro', 
      phrase: 'Oi amigão Theo! Obrigado pela entrega da pizza quentinha!', 
      pos: new THREE.Vector3(-32, 0, -59),
      skinTone: 0xf6d8ae,
      shirtColor: 0x64748b,
      pantsColor: 0x1e293b,
      hairColor: 0x475569,
      hairStyle: 'fedora',
    },
    { 
      name: 'Marina', 
      role: 'Passeando na Praia', 
      phrase: 'Oi Theo! O mar azul está lindo e as conchas douradas estão brilhando!', 
      pos: new THREE.Vector3(76, 0, -18),
      skinTone: 0xc68652,
      shirtColor: 0x06b6d4,
      pantsColor: 0xf8fafc,
      hairColor: 0x3e1f07,
      hairStyle: 'longWavy',
    },
  ];

  const npcs: CityNPC[] = [];

  const createStylizedCitizen = (data: typeof npcsData[0]) => {
    const npcGroup = new THREE.Group();
    npcGroup.position.copy(data.pos);

    const isChild = !!data.isChild;
    const scale = isChild ? 0.72 : 1.0;
    const sGroup = new THREE.Group();
    sGroup.scale.set(scale, scale, scale);
    npcGroup.add(sGroup);

    const skinMat = new THREE.MeshStandardMaterial({ color: data.skinTone, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: data.hairColor, roughness: 0.85 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: data.shirtColor, roughness: 0.65 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: data.pantsColor, roughness: 0.8 });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const glintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 });
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // Solado branco característico
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });

    // 1. Tronco com Camiseta / Uniforme
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.62, 0.26);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    sGroup.add(torso);

    if (data.hasApron) {
      const apron = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.05), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }));
      apron.position.set(0, 0.9, 0.14);
      sGroup.add(apron);
    }

    // 2. Cabeça com Rosto Estilo Pixar/Theo Lucca
    const head = new THREE.Group();
    head.position.y = 1.48;

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), skinMat);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Olhos Expressivos
    for (const side of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), eyeWhiteMat);
      eyeWhite.position.set(side * 0.075, 0.04, 0.19);
      head.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), pupilMat);
      pupil.position.set(side * 0.075, 0.04, 0.23);
      head.add(pupil);

      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), glintMat);
      glint.position.set(side * 0.075 + 0.012, 0.055, 0.25);
      head.add(glint);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.02), hairMat);
      brow.position.set(side * 0.075, 0.11, 0.2);
      head.add(brow);
    }

    // Boca com Sorriso Amigável
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.022, 0.02), new THREE.MeshStandardMaterial({ color: 0x991b1b }));
    mouth.position.set(0, -0.07, 0.2);
    head.add(mouth);

    // Cabelos & Chapéus Característicos
    if (data.hairStyle === 'bakerHat') {
      const toqueGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.35, 16);
      const toque = new THREE.Mesh(toqueGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
      toque.position.y = 0.28;
      toque.castShadow = true;
      head.add(toque);

      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.04), hairMat);
      mustache.position.set(0, -0.04, 0.22);
      head.add(mustache);
    } else if (data.hairStyle === 'policeCap') {
      const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.15, 14), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
      capMesh.position.y = 0.18;
      head.add(capMesh);
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 }));
      badge.position.set(0, 0.18, 0.24);
      head.add(badge);
    } else if (data.hairStyle === 'pigtails') {
      const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 12), hairMat);
      hairBase.position.y = 0.04;
      head.add(hairBase);
      for (const side of [-1, 1]) {
        const pigtail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.32, 8), hairMat);
        pigtail.position.set(side * 0.25, 0.05, -0.05);
        pigtail.rotation.z = side * 0.5;
        head.add(pigtail);
      }
    } else if (data.hairStyle === 'curlyBun') {
      const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), hairMat);
      hairBase.position.y = 0.03;
      head.add(hairBase);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), hairMat);
      bun.position.set(0, 0.24, -0.1);
      head.add(bun);
    } else if (data.hairStyle === 'fedora') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      brim.position.y = 0.15;
      head.add(brim);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.18, 14), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      crown.position.y = 0.24;
      head.add(crown);
    } else {
      const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.235, 14, 14), hairMat);
      hairMesh.position.set(0, 0.04, -0.02);
      head.add(hairMesh);
    }

    sGroup.add(head);

    // 3. Braços com Mãos
    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.52, 8);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.28, 1.2, 0);
    const lMesh = new THREE.Mesh(armGeo, shirtMat);
    lMesh.position.y = -0.26;
    lMesh.castShadow = true;
    leftArm.add(lMesh);
    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), skinMat);
    lHand.position.y = -0.52;
    leftArm.add(lHand);
    sGroup.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.28, 1.2, 0);
    const rMesh = new THREE.Mesh(armGeo, shirtMat);
    rMesh.position.y = -0.26;
    rMesh.castShadow = true;
    rightArm.add(rMesh);
    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), skinMat);
    rHand.position.y = -0.52;
    rightArm.add(rHand);
    sGroup.add(rightArm);

    // 4. Pernas com Calça e Tênis com Solado Branco (igual Theo!)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.58, 8);
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.12, 0.62, 0);
    const legLMesh = new THREE.Mesh(legGeo, pantsMat);
    legLMesh.position.y = -0.29;
    legLMesh.castShadow = true;
    leftLeg.add(legLMesh);

    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), shoeMat);
    shoeL.position.set(0, -0.58, 0.04);
    const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.05, 0.29), soleMat);
    soleL.position.set(0, -0.62, 0.04);
    leftLeg.add(shoeL);
    leftLeg.add(soleL);
    sGroup.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.12, 0.62, 0);
    const legRMesh = new THREE.Mesh(legGeo, pantsMat);
    legRMesh.position.y = -0.29;
    legRMesh.castShadow = true;
    rightLeg.add(legRMesh);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), shoeMat);
    shoeR.position.set(0, -0.58, 0.04);
    const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.05, 0.29), soleMat);
    soleR.position.set(0, -0.62, 0.04);
    rightLeg.add(shoeR);
    rightLeg.add(soleR);
    sGroup.add(rightLeg);

    scene.add(npcGroup);

    return { group: npcGroup, head, leftArm, rightArm, leftLeg, rightLeg };
  };

  npcsData.forEach((data) => {
    const { group, head, leftArm, rightArm, leftLeg, rightLeg } = createStylizedCitizen(data);
    npcs.push({
      group,
      name: data.name,
      role: data.role,
      phrase: data.phrase,
      position: data.pos.clone(),
      walkTimer: Math.random() * 5,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      isWaving: false,
    });
  });

  // --- 30 MOEDINHAS DOURADAS BRILHANTES ---
  const coins: StreetCoin[] = [];
  const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.07, 16);
  coinGeo.rotateZ(Math.PI / 2);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
  });

  const coinCoords = [
    [0, -18], [0, 18], [0, 38], [0, -38],
    [-14, 0], [14, 0], [-38, 0], [38, 0],
    [-20, -20], [-20, -28], // Dentro da Pizzaria
    [-42, -20], [-42, -28], // Dentro da Padaria
    [-20, 30], [-20, 24],   // Dentro do Mercado
    [-45, 30], [-45, 24],   // Dentro da Loja de Brinquedos
    [28, -24], [28, -30],   // Dentro da Loja de Roupas
    [30, 24], [34, 30], [26, 32], // Na Praça da Fonte
    [-38, -60], [-48, -60], // No Bairro Residencial
    [75, -12], [75, 12], [86, -22], [86, 22], // Na Praia
  ];

  coinCoords.forEach(([cx, cz], i) => {
    const mesh = new THREE.Mesh(coinGeo, coinMat);
    mesh.position.set(cx, 0.45, cz);
    mesh.castShadow = true;
    scene.add(mesh);

    coins.push({
      mesh,
      position: mesh.position,
      value: i % 3 === 0 ? 2 : 1,
      collected: false,
    });
  });

  // --- BEACON VERTICAL INDICADOR DE OBJETIVO ---
  const beaconGroup = new THREE.Group();
  const beaconCylGeo = new THREE.CylinderGeometry(0.5, 0.5, 50, 16);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.45,
  });
  const beaconCyl = new THREE.Mesh(beaconCylGeo, beaconMat);
  beaconCyl.position.y = 25;
  beaconGroup.add(beaconCyl);
  scene.add(beaconGroup);

  const setBeaconPosition = (pos: THREE.Vector3 | null) => {
    if (!pos) {
      beaconGroup.visible = false;
    } else {
      beaconGroup.visible = true;
      beaconGroup.position.set(pos.x, 0, pos.z);
    }
  };

  // --- ATUALIZAÇÃO DA CIDADE REALISTA ---
  const updateCity = (timeSec: number, delta: number, theoPos: THREE.Vector3) => {
    // 1. Semáforos funcionais
    trafficLights.forEach((tl, i) => {
      tl.timer += delta;
      const offset = (i % 2) * 12;
      const cycleTime = (tl.timer + offset) % 25;

      if (cycleTime < 11) {
        tl.state = 'green';
        (tl.greenMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4;
        (tl.yellowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
        (tl.redMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
      } else if (cycleTime < 14) {
        tl.state = 'yellow';
        (tl.greenMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
        (tl.yellowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4;
        (tl.redMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
      } else {
        tl.state = 'red';
        (tl.greenMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
        (tl.yellowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
        (tl.redMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4;
      }
    });

    // 2. Movimentação dos carros por waypoints contínuos (se Theo estiver dirigindo, o controle é do jogador)
    cars.forEach((car) => {
      if (car.hasTheoPassenger) return; // Theo está dirigindo!

      const targetWp = car.waypoints[car.currentWpIndex];
      const curPos = car.group.position;

      const dx = targetWp.x - curPos.x;
      const dz = targetWp.z - curPos.z;
      const distToWp = Math.hypot(dx, dz);

      if (distToWp < 4.2) {
        car.currentWpIndex = (car.currentWpIndex + 1) % car.waypoints.length;
      }

      const targetAngle = Math.atan2(dx, dz);
      let angleDiff = targetAngle - car.rotationY;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      car.rotationY += angleDiff * Math.min(1, 3.6 * delta);

      // Verificação de Semáforo
      let mustStopAtLight = false;
      for (const tl of trafficLights) {
        const dLight = Math.hypot(curPos.x - tl.position.x, curPos.z - tl.position.z);
        if (dLight < 9.5 && (tl.state === 'red' || tl.state === 'yellow')) {
          mustStopAtLight = true;
          break;
        }
      }

      // Detecção de Theo Lucca na frente
      const distToTheo = Math.hypot(curPos.x - theoPos.x, curPos.z - theoPos.z);
      const isTheoInFront = distToTheo < 7.2;

      if (isTheoInFront) {
        car.speed = Math.max(0, car.speed - 14 * delta);
        car.stoppedByPedestrian = true;

        car.honkCooldown -= delta;
        if (car.honkCooldown <= 0) {
          soundManager.playCuteHorn();
          car.honkCooldown = 3.5;
        }
      } else if (mustStopAtLight) {
        car.speed = Math.max(0, car.speed - 10 * delta);
        car.stoppedByRedLight = true;
      } else {
        car.speed = Math.min(car.maxSpeed, car.speed + 5 * delta);
        car.stoppedByPedestrian = false;
        car.stoppedByRedLight = false;
      }

      curPos.x += Math.sin(car.rotationY) * car.speed * delta;
      curPos.z += Math.cos(car.rotationY) * car.speed * delta;
      car.group.rotation.y = car.rotationY;

      for (const w of car.wheels) {
        w.rotation.x += car.speed * delta * 2.8;
      }
    });

    // 2.1 Movimentação das Motos em trânsito
    motos.forEach((moto) => {
      if (moto.isParked || moto.hasTheoPassenger) return;

      if (!moto.waypoints || moto.waypoints.length === 0) return;
      const targetWp = moto.waypoints[moto.currentWpIndex];
      const curPos = moto.group.position;

      const dx = targetWp.x - curPos.x;
      const dz = targetWp.z - curPos.z;
      const distToWp = Math.hypot(dx, dz);

      if (distToWp < 3.8) {
        moto.currentWpIndex = (moto.currentWpIndex + 1) % moto.waypoints.length;
      }

      const targetAngle = Math.atan2(dx, dz);
      let angleDiff = targetAngle - moto.rotationY;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      moto.rotationY += angleDiff * Math.min(1, 4.2 * delta);

      // Semáforo para motos
      let mustStop = false;
      for (const tl of trafficLights) {
        const dLight = Math.hypot(curPos.x - tl.position.x, curPos.z - tl.position.z);
        if (dLight < 9.0 && (tl.state === 'red' || tl.state === 'yellow')) {
          mustStop = true;
          break;
        }
      }

      const distToTheo = Math.hypot(curPos.x - theoPos.x, curPos.z - theoPos.z);
      if (distToTheo < 6.0) {
        moto.speed = Math.max(0, moto.speed - 16 * delta);
      } else if (mustStop) {
        moto.speed = Math.max(0, moto.speed - 12 * delta);
      } else {
        moto.speed = Math.min(moto.maxSpeed, moto.speed + 6 * delta);
      }

      curPos.x += Math.sin(moto.rotationY) * moto.speed * delta;
      curPos.z += Math.cos(moto.rotationY) * moto.speed * delta;
      moto.group.rotation.y = moto.rotationY;

      for (const w of moto.wheels) {
        w.rotation.x += moto.speed * delta * 3.2;
      }
    });

    // 3. Atualização dos NPCs
    for (const npc of npcs) {
      const distToTheo = npc.group.position.distanceTo(theoPos);

      if (distToTheo < 5.0) {
        npc.isWaving = true;
        const lookDir = Math.atan2(theoPos.x - npc.group.position.x, theoPos.z - npc.group.position.z);
        npc.group.rotation.y = lookDir;

        npc.rightArm.rotation.x = -2.2;
        npc.rightArm.rotation.z = Math.sin(timeSec * 10) * 0.35;
        npc.leftArm.rotation.x = 0;
        npc.leftLeg.rotation.x = 0;
        npc.rightLeg.rotation.x = 0;
      } else {
        npc.isWaving = false;
        npc.walkTimer += delta;

        const walkCycle = Math.sin(timeSec * 6);
        npc.leftArm.rotation.x = walkCycle * 0.45;
        npc.rightArm.rotation.x = -walkCycle * 0.45;
        npc.rightArm.rotation.z = 0;
        npc.leftLeg.rotation.x = -walkCycle * 0.45;
        npc.rightLeg.rotation.x = walkCycle * 0.45;
      }
    }

    // 4. Animação das Moedas
    for (const c of coins) {
      if (!c.collected) {
        c.mesh.rotation.y += delta * 2.6;
        c.mesh.position.y = 0.45 + Math.sin(timeSec * 4 + c.position.x) * 0.08;
      }
    }

    // 5. Ondas suaves da praia e borbulhar da água
    waterMesh.position.y = 0.03 + Math.sin(timeSec * 1.5) * 0.04;

    // 6. Movimento das nuvens no céu
    for (const cl of clouds) {
      cl.position.x += delta * 1.2;
      if (cl.position.x > 130) {
        cl.position.x = -130;
      }
    }
  };

  return {
    scene,
    trafficLights,
    cars,
    motos,
    motorcycles: motos,
    npcs,
    coins,
    locations,
    colliders: {
      boxes: boxColliders,
      circles: circleColliders,
    },
    sunLight,
    skyLight,
    waterMesh,
    flowerBeds,
    mailboxes,
    customerHouses,
    beaconGroup,
    setBeaconPosition,
    updateCity,
  };
}
