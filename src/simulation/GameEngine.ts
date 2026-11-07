import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createTheoLuccaModel, TheoLuccaRig } from './TheoLuccaModel';
import { createCityScene, CitySceneObjects, CityCar, CityMoto, CityNPC } from './CityScene';
import { soundManager } from './audio';

export interface BackpackItem {
  id: string;
  name: string;
  category: 'brinquedo' | 'comida' | 'roupa';
  price: number;
  icon: string;
  description: string;
}

export interface ActiveJob {
  id: string;
  name: string;
  reward: number;
  step: number;
  maxSteps: number;
  stepDesc: string;
  targetPos: THREE.Vector3;
  targetName: string;
  propType: 'none' | 'pizza' | 'wateringCan' | 'newspaper' | 'ball';
}

export interface MainMission {
  id: number;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
}

export interface CityHUDState {
  money: number;
  stamina: number;
  isExhausted: boolean;
  coinsCollected: number;
  totalCoins: number;
  backpack: BackpackItem[];
  activeJob: ActiveJob | null;
  currentMission: MainMission;
  nearestLocation: { name: string; category: string; label: string; dist: number } | null;
  nearestNPC: { name: string; role: string; phrase: string; dist: number } | null;
  nearestCar: { name: string; dist: number } | null;
  nearestMoto?: { name: string; dist: number } | null;
  isInCar: boolean;
  isDrivingMoto?: boolean;
  carName: string;
  vehicleSpeed?: number;
  dialogueText: string | null;
  distanceToTarget: number;
}

export interface GameEngineCallbacks {
  onHUDUpdate: (state: CityHUDState) => void;
  onCoinCollected: (val: number, newTotal: number) => void;
  onJobCompleted: (jobName: string, reward: number) => void;
  onMissionCompleted: (missionTitle: string, reward: number) => void;
  onItemPurchased: (item: BackpackItem) => void;
}

export class GameEngine {
  private container: HTMLDivElement;
  private callbacks: GameEngineCallbacks;

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private pmrem!: THREE.PMREMGenerator;

  private cityScene!: CitySceneObjects;
  private player!: TheoLuccaRig;

  // Estados de física e controle
  private playerPos = new THREE.Vector3(-14, 0, -14);
  private playerVelocity = new THREE.Vector3(0, 0, 0);
  private playerRotationY = Math.PI * 0.75;
  private isGrounded = true;

  private currentStamina = 100;
  private maxStamina = 100;
  private isExhausted = false;
  private isRunningInput = false;

  private moveInput = new THREE.Vector2(0, 0);
  private cameraAngles = { yaw: Math.PI * 0.75, pitch: 0.28 };

  // Sistema de Dinheiro & Inventário
  private money = 3.00;
  private coinsCollected = 0;
  private backpack: BackpackItem[] = [];

  // Sistema de Trabalhos
  private activeJob: ActiveJob | null = null;
  private pizzaDeliveriesCount = 0;
  private jobsFinishedCount = 0;

  // 5 Missões Principais da Cidade
  private missions: MainMission[] = [
    { id: 1, title: 'Missão 1: Primeiro Trabalho', description: 'Trabalhe 1 vez e ganhe seus primeiros R$ 20!', reward: 15, progress: 0, total: 1, completed: false },
    { id: 2, title: 'Missão 2: Caça às Moedas', description: 'Colete 10 moedinhas douradas pela cidade!', reward: 25, progress: 0, total: 10, completed: false },
    { id: 3, title: 'Missão 3: Bola de Futebol', description: 'Compre uma bola na Loja de Brinquedos!', reward: 20, progress: 0, total: 1, completed: false },
    { id: 4, title: 'Missão 4: Mestre da Pizza', description: 'Entregue 3 pizzas para os moradores do bairro!', reward: 50, progress: 0, total: 3, completed: false },
    { id: 5, title: 'Missão 5: Carrinho dos Sonhos', description: 'Junte dinheiro e compre o Carrinho de Brinquedo!', reward: 80, progress: 0, total: 1, completed: false },
  ];
  private currentMissionIndex = 0;

  // Sistema de Direção de Carros e Motos (GTA Infantil)
  private isInCar = false;
  private currentPassengerCar: CityCar | null = null;
  private currentMotorcycle: CityMoto | null = null;
  private isDrivingMoto = false;
  private vehicleSpeed = 0;
  private engineRevTimer = 0;

  // Interação e Acenar
  private waveTimer = 0;
  private dialogueText: string | null = null;
  private dialogueTimer = 0;

  // Loop & software GL guard
  private isSoftwareGl = false;
  private frameId = 0;
  private isDestroyed = false;
  private isPaused = false;
  private lastTime = 0;
  private stepTimer = 0;

  private keysPressed: Record<string, boolean> = {};

  constructor(container: HTMLDivElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 220);

    this.cityScene = createCityScene();
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.cityScene.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.player = createTheoLuccaModel();
    this.player.root.position.copy(this.playerPos);
    this.player.root.rotation.y = this.playerRotationY;
    this.cityScene.scene.add(this.player.root);

    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.lastTime = performance.now();
    this.tick();

    const userInteraction = () => {
      soundManager.startFountainAmbient();
      window.removeEventListener('pointerdown', userInteraction);
      window.removeEventListener('keydown', userInteraction);
    };
    window.addEventListener('pointerdown', userInteraction);
    window.addEventListener('keydown', userInteraction);
  }

  // --- CONTROLES E INPUTS ---
  public setJoystickInput(x: number, y: number) {
    this.moveInput.set(x, y);
  }

  public toggleRun(active?: boolean) {
    this.isRunningInput = active !== undefined ? active : !this.isRunningInput;
  }

  public getIsRunning(): boolean {
    return this.isRunningInput;
  }

  public jump() {
    if (this.isInCar || !this.isGrounded) return;
    this.isGrounded = false;
    this.playerVelocity.y = 7.0;
    soundManager.playJump();
  }

  public rotateCamera(deltaX: number, deltaY: number) {
    this.cameraAngles.yaw += deltaX * 0.005;
    this.cameraAngles.pitch = Math.max(0.08, Math.min(0.85, this.cameraAngles.pitch + deltaY * 0.004));
  }

  public turnCameraLeft(step: number = 0.22) {
    this.cameraAngles.yaw += step;
  }

  public turnCameraRight(step: number = 0.22) {
    this.cameraAngles.yaw -= step;
  }

  public honkHorn() {
    soundManager.playCuteHorn();
  }

  // Acenar / Falar com NPCs
  public waveAndSpeak() {
    this.waveTimer = 2.2;
    soundManager.playWaveHello();

    // Encontra o NPC mais próximo
    let nearest: CityNPC | null = null;
    let minDist = 7.0;

    for (const npc of this.cityScene.npcs) {
      const d = npc.group.position.distanceTo(this.playerPos);
      if (d < minDist) {
        minDist = d;
        nearest = npc;
      }
    }

    if (nearest) {
      const targetNPC: CityNPC = nearest;
      this.dialogueText = `${targetNPC.name}: "${targetNPC.phrase}"`;
    } else {
      this.dialogueText = 'Theo Lucca: "Oi cidade linda! Bom dia a todos!"';
    }
    this.dialogueTimer = 4.0;
  }

  // --- SISTEMA DE COLISÃO REALISTA (PAREDES, ÁRVORES, VEÍCULOS) ---
  private resolveCollisions(pos: THREE.Vector3, radius = 0.45, excludeObj?: any): boolean {
    if (!this.cityScene || !this.cityScene.colliders) return false;
    let collided = false;

    // 1. Árvores urbanas, coqueiros da praia e fonte d'água central
    for (const circle of this.cityScene.colliders.circles) {
      const dx = pos.x - circle.x;
      const dz = pos.z - circle.z;
      const distSq = dx * dx + dz * dz;
      const minDist = circle.radius + radius;
      if (distSq < minDist * minDist && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        pos.x += (dx / dist) * overlap;
        pos.z += (dz / dist) * overlap;
        collided = true;
      }
    }

    // 2. Paredes de prédios, lojas e casas residenciais (com portas abertas)
    for (const box of this.cityScene.colliders.boxes) {
      if (
        pos.x >= box.minX - radius &&
        pos.x <= box.maxX + radius &&
        pos.z >= box.minZ - radius &&
        pos.z <= box.maxZ + radius
      ) {
        const distLeft = pos.x - (box.minX - radius);
        const distRight = (box.maxX + radius) - pos.x;
        const distBack = pos.z - (box.minZ - radius);
        const distFront = (box.maxZ + radius) - pos.z;

        const minOverlap = Math.min(distLeft, distRight, distBack, distFront);
        if (minOverlap === distLeft) {
          pos.x = box.minX - radius;
        } else if (minOverlap === distRight) {
          pos.x = box.maxX + radius;
        } else if (minOverlap === distBack) {
          pos.z = box.minZ - radius;
        } else {
          pos.z = box.maxZ + radius;
        }
        collided = true;
      }
    }

    // 3. Colisão com outros carros e motos estacionados ou em trânsito
    for (const car of this.cityScene.cars) {
      if (excludeObj === car) continue;
      const dx = pos.x - car.group.position.x;
      const dz = pos.z - car.group.position.z;
      const distSq = dx * dx + dz * dz;
      const carRadius = 1.35 + radius;
      if (distSq < carRadius * carRadius && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = carRadius - dist;
        pos.x += (dx / dist) * overlap;
        pos.z += (dz / dist) * overlap;
        collided = true;
      }
    }

    for (const moto of this.cityScene.motorcycles) {
      if (excludeObj === moto) continue;
      const dx = pos.x - moto.group.position.x;
      const dz = pos.z - moto.group.position.z;
      const distSq = dx * dx + dz * dz;
      const motoRadius = 0.85 + radius;
      if (distSq < motoRadius * motoRadius && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = motoRadius - dist;
        pos.x += (dx / dist) * overlap;
        pos.z += (dz / dist) * overlap;
        collided = true;
      }
    }

    return collided;
  }

  // Entrar ou Sair de Veículo (Carro ou Moto)
  public toggleCarRide() {
    // Se Theo já está dirigindo um carro ou pilotando uma moto: descer do veículo
    if (this.isInCar || this.isDrivingMoto) {
      if (this.isInCar && this.currentPassengerCar) {
        const car = this.currentPassengerCar;
        car.hasTheoPassenger = false;
        // Posição lateral segura
        this.playerPos.x = car.group.position.x + Math.cos(car.rotationY) * 2.1;
        this.playerPos.z = car.group.position.z - Math.sin(car.rotationY) * 2.1;
        this.playerPos.y = 0;
        this.resolveCollisions(this.playerPos, 0.45);
        this.currentPassengerCar = null;
        this.isInCar = false;
      } else if (this.isDrivingMoto && this.currentMotorcycle) {
        const moto = this.currentMotorcycle;
        moto.hasTheoPassenger = false;
        if (moto.rider) moto.rider.visible = true;
        this.playerPos.x = moto.group.position.x + Math.cos(moto.rotationY) * 1.5;
        this.playerPos.z = moto.group.position.z - Math.sin(moto.rotationY) * 1.5;
        this.playerPos.y = 0;
        this.resolveCollisions(this.playerPos, 0.45);
        this.currentMotorcycle = null;
        this.isDrivingMoto = false;
      }
      this.vehicleSpeed = 0;
      soundManager.playCarDoor();
      soundManager.playCuteHorn();
      this.dialogueText = 'Theo: "Desci do veículo! Agora posso explorar a pé!"';
      this.dialogueTimer = 3.0;
      return;
    }

    // Procura o veículo mais próximo (carro ou moto dentro de 5.5m)
    let closestCar: CityCar | null = null;
    let minCarDist = 5.5;
    for (const car of this.cityScene.cars) {
      const d = car.group.position.distanceTo(this.playerPos);
      if (d < minCarDist) {
        minCarDist = d;
        closestCar = car;
      }
    }

    let closestMoto: CityMoto | null = null;
    let minMotoDist = 5.5;
    for (const moto of this.cityScene.motorcycles) {
      const d = moto.group.position.distanceTo(this.playerPos);
      if (d < minMotoDist) {
        minMotoDist = d;
        closestMoto = moto;
      }
    }

    // Se estiver mais perto de uma moto
    if (closestMoto && minMotoDist <= minCarDist) {
      this.isDrivingMoto = true;
      this.isInCar = false;
      this.currentMotorcycle = closestMoto;
      closestMoto.hasTheoPassenger = true;
      if (closestMoto.rider) closestMoto.rider.visible = false;
      this.vehicleSpeed = 0;
      soundManager.playCarDoor();
      soundManager.playEngineRev(true);
      this.dialogueText = `Theo subiu na ${closestMoto.colorName}! Use o joystick ou WASD para acelerar, frear e fazer curvas!`;
      this.dialogueTimer = 4.5;
      return;
    }

    // Se estiver mais perto de um carro
    if (closestCar) {
      this.isInCar = true;
      this.isDrivingMoto = false;
      this.currentPassengerCar = closestCar;
      closestCar.hasTheoPassenger = true;
      this.vehicleSpeed = 0;
      soundManager.playCarDoor();
      soundManager.playEngineRev(false);
      this.dialogueText = `Theo assumiu o volante do ${closestCar.colorName}! Use o joystick ou WASD para dirigir e fazer curvas!`;
      this.dialogueTimer = 4.5;
      return;
    }

    this.dialogueText = 'Aproxime-se de um carro ou de uma moto para poder dirigir!';
    this.dialogueTimer = 3.0;
  }

  // --- SISTEMA DE TRABALHOS (5 JOBS GTA INFANTIL) ---
  public startJob(jobId: string) {
    if (jobId === 'pizzaria_do_bairro') {
      this.activeJob = {
        id: 'pizza',
        name: 'Entregador de Pizza',
        reward: 20,
        step: 1,
        maxSteps: 2,
        stepDesc: 'Leve a caixa de pizza até a Casa Residencial!',
        targetPos: this.cityScene.customerHouses[0] || new THREE.Vector3(-36, 0, -37.5),
        targetName: 'Casa Residencial do Vizinho',
        propType: 'pizza',
      };
      this.player.setHeldPropType('pizza');
      this.cityScene.setBeaconPosition(this.activeJob.targetPos);
      this.dialogueText = 'Pizzaiolo: "Aqui está a pizza quentinha! Entregue na casa amarela!"';
      this.dialogueTimer = 4.0;
    } else if (jobId === 'supermercado_central') {
      this.activeJob = {
        id: 'mercado',
        name: 'Ajudante do Mercado',
        reward: 15,
        step: 1,
        maxSteps: 2,
        stepDesc: 'Leve as caixas de frutas até as prateleiras internas!',
        targetPos: new THREE.Vector3(-14, 0, 19),
        targetName: 'Prateleiras do Mercado',
        propType: 'none',
      };
      this.cityScene.setBeaconPosition(this.activeJob.targetPos);
      this.dialogueText = 'Gerente: "Obrigado Theo! Leve estas caixas até as prateleiras!"';
      this.dialogueTimer = 4.0;
    } else if (jobId === 'parque_jardineiro') {
      this.activeJob = {
        id: 'jardim',
        name: 'Jardineiro do Parque',
        reward: 10,
        step: 1,
        maxSteps: 3,
        stepDesc: 'Regue os 3 canteiros de flores do parque com o regador!',
        targetPos: this.cityScene.flowerBeds[0] || new THREE.Vector3(12, 0, 12),
        targetName: 'Canteiro de Flores 1',
        propType: 'wateringCan',
      };
      this.player.setHeldPropType('wateringCan');
      this.cityScene.setBeaconPosition(this.activeJob.targetPos);
      this.dialogueText = 'Florista: "Theo, aqui está o regador! Deixe as flores bem fresquinhas!"';
      this.dialogueTimer = 4.0;
    } else if (jobId === 'padaria_pao_quentinho') {
      this.activeJob = {
        id: 'padaria',
        name: 'Ajudante da Padaria',
        reward: 12,
        step: 1,
        maxSteps: 2,
        stepDesc: 'Leve o pão quentinho para a Vovó Maria na Praça!',
        targetPos: new THREE.Vector3(12, 0, 16),
        targetName: 'Vovó Maria na Praça',
        propType: 'none',
      };
      this.cityScene.setBeaconPosition(this.activeJob.targetPos);
      this.dialogueText = 'Seu Zé: "O pão saiu agora do forno! Entregue para a Vovó Maria!"';
      this.dialogueTimer = 4.0;
    } else {
      // Jornaleiro de bicicleta
      this.activeJob = {
        id: 'jornal',
        name: 'Entregador de Jornal',
        reward: 25,
        step: 1,
        maxSteps: 2,
        stepDesc: 'Coloque os jornais nas caixas de correio vermelhas!',
        targetPos: this.cityScene.mailboxes[0] || new THREE.Vector3(-33.8, 0, -36.5),
        targetName: 'Caixa de Correio 1',
        propType: 'newspaper',
      };
      this.player.setHeldPropType('newspaper');
      this.cityScene.setBeaconPosition(this.activeJob.targetPos);
      this.dialogueText = 'Banca de Jornal: "Entregue as notícias matinais nas caixas de correio!"';
      this.dialogueTimer = 4.0;
    }
  }

  // Tentar interagir ou trabalhar no local
  public tryInteractOrWork() {
    // 1. Se já está em um trabalho e está perto do objetivo
    if (this.activeJob) {
      const dist = this.playerPos.distanceTo(this.activeJob.targetPos);
      if (dist < 4.0) {
        if (this.activeJob.step < this.activeJob.maxSteps) {
          this.activeJob.step++;
          if (this.activeJob.id === 'jardim' && this.cityScene.flowerBeds[this.activeJob.step - 1]) {
            this.activeJob.targetPos = this.cityScene.flowerBeds[this.activeJob.step - 1];
            this.activeJob.targetName = `Canteiro de Flores ${this.activeJob.step}`;
            this.activeJob.stepDesc = `Regue o canteiro ${this.activeJob.step} de 3!`;
          } else if (this.activeJob.id === 'jornal' && this.cityScene.mailboxes[this.activeJob.step - 1]) {
            this.activeJob.targetPos = this.cityScene.mailboxes[this.activeJob.step - 1];
            this.activeJob.targetName = `Caixa de Correio ${this.activeJob.step}`;
            this.activeJob.stepDesc = `Entregue o jornal na caixa ${this.activeJob.step}!`;
          }
          this.cityScene.setBeaconPosition(this.activeJob.targetPos);
          soundManager.playStarCollect();
          return;
        }

        // Trabalho Concluído com Sucesso!
        const reward = this.activeJob.reward;
        this.money += reward;
        this.jobsFinishedCount++;
        soundManager.playCashEarn();

        if (this.activeJob.id === 'pizza') {
          this.pizzaDeliveriesCount++;
          this.checkMissionProgress(4, this.pizzaDeliveriesCount);
        }
        this.checkMissionProgress(1, this.jobsFinishedCount);

        this.callbacks.onJobCompleted(this.activeJob.name, reward);
        this.dialogueText = `PARABÉNS! Você concluiu o trabalho e ganhou R$ ${reward},00!`;
        this.dialogueTimer = 5.0;

        this.activeJob = null;
        this.player.setHeldPropType('none');
        this.cityScene.setBeaconPosition(null);
        return;
      }
    }

    // 2. Se está perto de um local de trabalho, inicia o trabalho
    let nearestLoc = this.getNearestLocation();
    if (nearestLoc && nearestLoc.dist < 3.8 && nearestLoc.category === 'job') {
      this.startJob(nearestLoc.id);
      return;
    }

    // 3. Falar com pessoas
    this.waveAndSpeak();
  }

  // --- SISTEMA DE COMPRAS NAS LOJAS ---
  public buyItem(item: BackpackItem): boolean {
    if (this.money < item.price) {
      this.dialogueText = `Dinheiro insuficiente! Você precisa de R$ ${item.price},00. Trabalhe mais para juntar moedas!`;
      this.dialogueTimer = 4.0;
      return false;
    }

    this.money -= item.price;
    this.backpack.push(item);
    soundManager.playPurchase();
    this.callbacks.onItemPurchased(item);

    this.dialogueText = `Você comprou ${item.name}! O item foi guardado na sua Mochila!`;
    this.dialogueTimer = 4.0;

    // Checagem de Missões
    if (item.name.toLowerCase().includes('bola')) {
      this.checkMissionProgress(3, 1);
    }
    if (item.name.toLowerCase().includes('carrinho')) {
      this.checkMissionProgress(5, 1);
    }

    return true;
  }

  // Usar item da mochila
  public useBackpackItem(item: BackpackItem) {
    if (item.category === 'comida') {
      this.currentStamina = 100;
      this.isExhausted = false;
      this.dialogueText = `Theo comeu/bebeu ${item.name}! Fôlego 100% restaurado!`;
      this.dialogueTimer = 3.5;
      soundManager.playStarCollect();
    } else if (item.name.toLowerCase().includes('bola')) {
      this.player.setHeldPropType('ball');
      this.dialogueText = 'Theo está brincando com a sua Bola de Futebol!';
      this.dialogueTimer = 3.5;
      soundManager.playJump();
    } else {
      this.dialogueText = `Theo usou ${item.name} da mochila!`;
      this.dialogueTimer = 3.0;
    }
  }

  private checkMissionProgress(missionId: number, progressVal: number) {
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission || mission.completed) return;

    mission.progress = Math.min(mission.total, progressVal);
    if (mission.progress >= mission.total) {
      mission.completed = true;
      this.money += mission.reward;
      soundManager.playMissionComplete();
      this.callbacks.onMissionCompleted(mission.title, mission.reward);

      if (this.currentMissionIndex < this.missions.length - 1) {
        this.currentMissionIndex++;
      }
    }
  }

  public getNearestLocation(): { id: string; name: string; category: string; label: string; dist: number } | null {
    let nearest: { id: string; name: string; category: string; label: string; dist: number } | null = null;
    let minDist = 999;

    for (const loc of this.cityScene.locations) {
      const d = loc.position.distanceTo(this.playerPos);
      if (d < minDist) {
        minDist = d;
        nearest = { id: loc.id, name: loc.name, category: loc.category, label: loc.label, dist: d };
      }
    }

    return nearest;
  }

  // --- GAME LOOP ---
  private tick = () => {
    if (this.isDestroyed || this.isPaused) return;

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.dialogueTimer > 0) {
      this.dialogueTimer -= delta;
      if (this.dialogueTimer <= 0) {
        this.dialogueText = null;
      }
    }

    if (this.waveTimer > 0) {
      this.waveTimer -= delta;
    }

    this.updatePhysicsAndMovement(delta, now * 0.001);
    this.updateCamera(delta);
    this.cityScene.updateCity(now * 0.001, delta, this.playerPos);
    this.checkCoinPickups();
    this.dispatchHUDData();

    this.renderer.render(this.cityScene.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updatePhysicsAndMovement(delta: number, timeSec: number) {
    // ==========================================
    // 1. MODO DIREÇÃO DE CARRO (GTA INFANTIL)
    // ==========================================
    if (this.isInCar && this.currentPassengerCar) {
      const car = this.currentPassengerCar;

      // Inputs de direção e aceleração
      let steerInput = this.moveInput.x;
      let throttleInput = this.moveInput.y;
      if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) steerInput -= 1;
      if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) steerInput += 1;
      if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) throttleInput += 1;
      if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) throttleInput -= 1;

      steerInput = THREE.MathUtils.clamp(steerInput, -1, 1);
      throttleInput = THREE.MathUtils.clamp(throttleInput, -1, 1);

      // Aceleração, freio e ré
      const maxForwardSpeed = 13.5;
      const maxReverseSpeed = -5.0;

      if (throttleInput > 0.1) {
        this.vehicleSpeed += 15.0 * throttleInput * delta;
        if (this.vehicleSpeed > maxForwardSpeed) this.vehicleSpeed = maxForwardSpeed;
      } else if (throttleInput < -0.1) {
        if (this.vehicleSpeed > 0.5) {
          // Freando
          this.vehicleSpeed -= 22.0 * delta;
          if (this.vehicleSpeed < 0) this.vehicleSpeed = 0;
        } else {
          // Engatando ré
          this.vehicleSpeed -= 9.0 * Math.abs(throttleInput) * delta;
          if (this.vehicleSpeed < maxReverseSpeed) this.vehicleSpeed = maxReverseSpeed;
        }
      } else {
        // Desaceleração suave / atrito
        if (this.vehicleSpeed > 0) {
          this.vehicleSpeed = Math.max(0, this.vehicleSpeed - 7.5 * delta);
        } else if (this.vehicleSpeed < 0) {
          this.vehicleSpeed = Math.min(0, this.vehicleSpeed + 7.5 * delta);
        }
      }

      // Curvas e esterçamento do carro
      if (Math.abs(this.vehicleSpeed) > 0.2 && Math.abs(steerInput) > 0.05) {
        const turnDirection = this.vehicleSpeed >= 0 ? 1 : -1;
        const turnRate = 2.4 * (Math.abs(this.vehicleSpeed) / 10 + 0.35);
        car.rotationY -= steerInput * turnRate * turnDirection * delta;
        car.group.rotation.y = car.rotationY;
      }

      // Deslocamento para frente na direção do carro
      const forwardX = Math.sin(car.rotationY);
      const forwardZ = Math.cos(car.rotationY);
      const tentativePos = car.group.position.clone();
      tentativePos.x += forwardX * this.vehicleSpeed * delta;
      tentativePos.z += forwardZ * this.vehicleSpeed * delta;

      // Limites do mapa
      tentativePos.x = Math.max(-103, Math.min(103, tentativePos.x));
      tentativePos.z = Math.max(-103, Math.min(103, tentativePos.z));

      // Colisão do carro com paredes, árvores e outros veículos (NÃO atravessa nada!)
      const collided = this.resolveCollisions(tentativePos, 1.4, car);
      if (collided) {
        this.vehicleSpeed *= -0.25; // rebate suavemente sem atravessar
      }

      car.group.position.copy(tentativePos);
      car.speed = this.vehicleSpeed;

      // Giro realista das 4 rodas
      for (const wheel of car.wheels) {
        wheel.rotation.x += this.vehicleSpeed * delta * 2.8;
      }

      // Som do motor acelerando
      if (Math.abs(this.vehicleSpeed) > 2.0) {
        this.engineRevTimer += delta;
        if (this.engineRevTimer > 1.6) {
          soundManager.playEngineRev(false);
          this.engineRevTimer = 0;
        }
      }

      // Theo posicionado no banco do motorista
      const driverOffsetX = Math.cos(car.rotationY) * 0.42;
      const driverOffsetZ = -Math.sin(car.rotationY) * 0.42;
      this.playerPos.x = car.group.position.x - driverOffsetX;
      this.playerPos.z = car.group.position.z - driverOffsetZ;
      this.playerPos.y = 0.48;
      this.playerRotationY = car.rotationY;

      this.player.root.position.copy(this.playerPos);
      this.player.root.rotation.y = this.playerRotationY;
      this.player.updateAnimation(timeSec, Math.abs(this.vehicleSpeed) / 10, true, false, false, true, false);
      return;
    }

    // ==========================================
    // 2. MODO PILOTAR MOTO (GTA INFANTIL)
    // ==========================================
    if (this.isDrivingMoto && this.currentMotorcycle) {
      const moto = this.currentMotorcycle;

      let steerInput = this.moveInput.x;
      let throttleInput = this.moveInput.y;
      if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) steerInput -= 1;
      if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) steerInput += 1;
      if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) throttleInput += 1;
      if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) throttleInput -= 1;

      steerInput = THREE.MathUtils.clamp(steerInput, -1, 1);
      throttleInput = THREE.MathUtils.clamp(throttleInput, -1, 1);

      const maxForwardSpeed = 16.0;
      const maxReverseSpeed = -4.5;

      if (throttleInput > 0.1) {
        this.vehicleSpeed += 17.5 * throttleInput * delta;
        if (this.vehicleSpeed > maxForwardSpeed) this.vehicleSpeed = maxForwardSpeed;
      } else if (throttleInput < -0.1) {
        if (this.vehicleSpeed > 0.5) {
          this.vehicleSpeed -= 24.0 * delta;
          if (this.vehicleSpeed < 0) this.vehicleSpeed = 0;
        } else {
          this.vehicleSpeed -= 8.5 * Math.abs(throttleInput) * delta;
          if (this.vehicleSpeed < maxReverseSpeed) this.vehicleSpeed = maxReverseSpeed;
        }
      } else {
        if (this.vehicleSpeed > 0) {
          this.vehicleSpeed = Math.max(0, this.vehicleSpeed - 8.0 * delta);
        } else if (this.vehicleSpeed < 0) {
          this.vehicleSpeed = Math.min(0, this.vehicleSpeed + 8.0 * delta);
        }
      }

      // Curvas da moto com inclinação realista
      if (Math.abs(this.vehicleSpeed) > 0.2 && Math.abs(steerInput) > 0.05) {
        const turnDirection = this.vehicleSpeed >= 0 ? 1 : -1;
        const turnRate = 2.9 * (Math.abs(this.vehicleSpeed) / 10 + 0.4);
        moto.rotationY -= steerInput * turnRate * turnDirection * delta;
        moto.group.rotation.y = moto.rotationY;
      }

      // Inclinação suave no eixo Z ao fazer curva
      const leanTarget = -steerInput * (this.vehicleSpeed / maxForwardSpeed) * 0.28;
      moto.group.rotation.z = THREE.MathUtils.damp(moto.group.rotation.z, leanTarget, 8, delta);

      const forwardX = Math.sin(moto.rotationY);
      const forwardZ = Math.cos(moto.rotationY);
      const tentativePos = moto.group.position.clone();
      tentativePos.x += forwardX * this.vehicleSpeed * delta;
      tentativePos.z += forwardZ * this.vehicleSpeed * delta;

      tentativePos.x = Math.max(-103, Math.min(103, tentativePos.x));
      tentativePos.z = Math.max(-103, Math.min(103, tentativePos.z));

      // Colisão da moto com paredes, árvores e carros (NÃO atravessa nada!)
      const collided = this.resolveCollisions(tentativePos, 0.85, moto);
      if (collided) {
        this.vehicleSpeed *= -0.2;
      }

      moto.group.position.copy(tentativePos);
      moto.speed = this.vehicleSpeed;

      // Giro das rodas da moto
      for (const wheel of moto.wheels) {
        wheel.rotation.x += this.vehicleSpeed * delta * 3.8;
      }

      // Som do acelerador da moto
      if (Math.abs(this.vehicleSpeed) > 2.0) {
        this.engineRevTimer += delta;
        if (this.engineRevTimer > 1.5) {
          soundManager.playEngineRev(true);
          this.engineRevTimer = 0;
        }
      }

      // Theo posicionado no banco segurando o guidão
      this.playerPos.copy(moto.group.position);
      this.playerPos.y = 0.54;
      this.playerRotationY = moto.rotationY;

      this.player.root.position.copy(this.playerPos);
      this.player.root.rotation.y = this.playerRotationY;
      this.player.updateAnimation(timeSec, Math.abs(this.vehicleSpeed) / 10, true, false, false, true, false);
      return;
    }

    // ==========================================
    // 3. MODO A PÉ COM COLISÃO SÓLIDA REALISTA
    // ==========================================
    let inputX = this.moveInput.x;
    let inputY = this.moveInput.y;

    if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) inputX -= 1;
    if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) inputX += 1;
    if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) inputY += 1;
    if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) inputY -= 1;

    const moveMag = Math.min(1.0, Math.hypot(inputX, inputY));
    const isMoving = moveMag > 0.08;

    let moveDir = new THREE.Vector3(0, 0, 0);
    if (isMoving) {
      const inputAngle = Math.atan2(-inputX, inputY);
      const worldAngle = this.cameraAngles.yaw + inputAngle;
      moveDir.set(Math.sin(worldAngle), 0, Math.cos(worldAngle)).normalize();

      const targetRotationY = Math.atan2(moveDir.x, moveDir.z);
      let angleDiff = targetRotationY - this.playerRotationY;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.playerRotationY += angleDiff * Math.min(1, 14 * delta);
    }

    const wantsToRun = (this.isRunningInput || this.keysPressed['ShiftLeft']) && !this.isExhausted;
    const moveSpeed = wantsToRun ? 8.2 : 4.5;

    if (isMoving && wantsToRun) {
      this.currentStamina -= 20 * delta;
      if (this.currentStamina <= 0) {
        this.currentStamina = 0;
        this.isExhausted = true;
        this.isRunningInput = false;
      }
    } else {
      this.currentStamina = Math.min(this.maxStamina, this.currentStamina + 18 * delta);
      if (this.isExhausted && this.currentStamina > 30) {
        this.isExhausted = false;
      }
    }

    if (isMoving) {
      this.playerPos.x += moveDir.x * moveSpeed * moveMag * delta;
      this.playerPos.z += moveDir.z * moveSpeed * moveMag * delta;

      // Limites da cidade aberta ampliada (220m x 220m)
      this.playerPos.x = Math.max(-105, Math.min(105, this.playerPos.x));
      this.playerPos.z = Math.max(-105, Math.min(105, this.playerPos.z));

      // COLISÃO COM PAREDES, ÁRVORES E VEÍCULOS (NÃO ATRAVESSA NADA!)
      this.resolveCollisions(this.playerPos, 0.45);

      if (this.isGrounded) {
        this.stepTimer += delta;
        const stepInterval = wantsToRun ? 0.22 : 0.35;
        if (this.stepTimer >= stepInterval) {
          soundManager.playFootstep(wantsToRun);
          this.stepTimer = 0;
        }
      }
    } else {
      this.stepTimer = 0.25;
    }

    if (!this.isGrounded) {
      this.playerVelocity.y -= 19.5 * delta;
      this.playerPos.y += this.playerVelocity.y * delta;

      if (this.playerPos.y <= 0) {
        this.playerPos.y = 0;
        this.playerVelocity.y = 0;
        this.isGrounded = true;
      }
    }

    this.player.root.position.copy(this.playerPos);
    this.player.root.rotation.y = this.playerRotationY;

    const animSpeed = isMoving ? (wantsToRun ? 1.0 : 0.5) : 0;
    this.player.updateAnimation(
      timeSec,
      animSpeed,
      this.isGrounded,
      wantsToRun,
      this.waveTimer > 0,
      false,
      this.activeJob !== null
    );
  }

  private updateCamera(delta: number) {
    let camDist = 3.8;

    if (this.isInCar && this.currentPassengerCar) {
      camDist = 7.2;
      const targetYaw = this.currentPassengerCar.rotationY + Math.PI;
      this.cameraAngles.yaw = THREE.MathUtils.damp(this.cameraAngles.yaw, targetYaw, 3.5, delta);
    } else if (this.isDrivingMoto && this.currentMotorcycle) {
      camDist = 5.6;
      const targetYaw = this.currentMotorcycle.rotationY + Math.PI;
      this.cameraAngles.yaw = THREE.MathUtils.damp(this.cameraAngles.yaw, targetYaw, 4.2, delta);
    }

    const targetLookAt = new THREE.Vector3(
      this.playerPos.x,
      this.playerPos.y + (this.isInCar || this.isDrivingMoto ? 1.1 : 0.85),
      this.playerPos.z
    );

    const pitch = this.cameraAngles.pitch;
    const yaw = this.cameraAngles.yaw;

    const desiredCamPos = new THREE.Vector3(
      targetLookAt.x - Math.sin(yaw) * Math.cos(pitch) * camDist,
      targetLookAt.y + Math.sin(pitch) * camDist,
      targetLookAt.z - Math.cos(yaw) * Math.cos(pitch) * camDist
    );

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, desiredCamPos.x, 14, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, desiredCamPos.y, 14, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, desiredCamPos.z, 14, delta);

    this.camera.lookAt(targetLookAt);
  }

  private checkCoinPickups() {
    this.cityScene.coins.forEach((coin) => {
      if (coin.collected) return;
      const d = this.playerPos.distanceTo(coin.position);
      if (d < 1.6) {
        coin.collected = true;
        coin.mesh.visible = false;
        this.money += coin.value;
        this.coinsCollected++;
        soundManager.playCoinCollect();

        this.checkMissionProgress(2, this.coinsCollected);
        this.callbacks.onCoinCollected(coin.value, this.money);
      }
    });
  }

  private dispatchHUDData() {
    let nearestLoc = this.getNearestLocation();

    // Carro mais próximo
    let nearestCar: { name: string; dist: number } | null = null;
    let minCarDist = 999;
    for (const car of this.cityScene.cars) {
      const d = car.group.position.distanceTo(this.playerPos);
      if (d < minCarDist) {
        minCarDist = d;
        nearestCar = { name: car.colorName, dist: d };
      }
    }

    // Moto mais próxima
    let nearestMoto: { name: string; dist: number } | null = null;
    let minMotoDist = 999;
    for (const moto of this.cityScene.motorcycles) {
      const d = moto.group.position.distanceTo(this.playerPos);
      if (d < minMotoDist) {
        minMotoDist = d;
        nearestMoto = { name: moto.colorName, dist: d };
      }
    }

    // NPC mais próximo
    let nearestNPC: { name: string; role: string; phrase: string; dist: number } | null = null;
    let minNPCDist = 999;
    for (const npc of this.cityScene.npcs) {
      const d = npc.group.position.distanceTo(this.playerPos);
      if (d < minNPCDist) {
        minNPCDist = d;
        nearestNPC = { name: npc.name, role: npc.role, phrase: npc.phrase, dist: d };
      }
    }

    let distanceToTarget = 0;
    if (this.activeJob) {
      distanceToTarget = this.playerPos.distanceTo(this.activeJob.targetPos);
    } else if (nearestLoc) {
      distanceToTarget = nearestLoc.dist;
    }

    const activeVehicleName = this.isInCar
      ? (this.currentPassengerCar?.colorName || 'Carro')
      : (this.isDrivingMoto ? (this.currentMotorcycle?.colorName || 'Moto') : '');

    this.callbacks.onHUDUpdate({
      money: this.money,
      stamina: Math.round(this.currentStamina),
      isExhausted: this.isExhausted,
      coinsCollected: this.coinsCollected,
      totalCoins: this.cityScene.coins.length,
      backpack: this.backpack,
      activeJob: this.activeJob,
      currentMission: this.missions[this.currentMissionIndex] || this.missions[0],
      nearestLocation: nearestLoc,
      nearestNPC,
      nearestCar,
      nearestMoto,
      isInCar: this.isInCar || this.isDrivingMoto,
      isDrivingMoto: this.isDrivingMoto,
      carName: activeVehicleName,
      vehicleSpeed: Math.round(Math.abs(this.vehicleSpeed) * 3.6),
      dialogueText: this.dialogueText,
      distanceToTarget,
    });
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      this.jump();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.isRunningInput = true;
    }
    if (e.code === 'KeyE' || e.code === 'KeyF') {
      this.tryInteractOrWork();
    }
    if (e.code === 'KeyH') {
      this.honkHorn();
    }
    if (e.code === 'KeyC') {
      this.toggleCarRide();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.isRunningInput = false;
    }
  };

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public pause() {
    this.isPaused = true;
    soundManager.pauseAll();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.frameId = 0;
  }

  public resume() {
    if (!this.isPaused || this.isDestroyed) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundManager.resumeAll();
    if (!this.frameId) {
      if (this.isSoftwareGl) {
        this.afterDraw(this.tick);
      } else {
        this.frameId = requestAnimationFrame(this.tick);
      }
    }
  }

  public destroy() {
    this.pause();
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.pmrem?.dispose();
    this.renderer?.dispose();

    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
