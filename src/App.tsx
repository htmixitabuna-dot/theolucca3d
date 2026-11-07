import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Coins, 
  RotateCcw, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { GameEngine, CityHUDState, BackpackItem } from './simulation/GameEngine';
import { soundManager } from './simulation/audio';
import { GtaKidHUD } from './components/GtaKidHUD';
import { ShopModal, BackpackModal, JobsModal } from './components/CityModals';
import { UnityProjectExplorer } from './components/UnityProjectExplorer';
import { MixamoGuideModal } from './components/MixamoGuideModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Estados de navegação
  const [activeTab, setActiveTab] = useState<'simulator' | 'unityCode'>('simulator');
  const [isRunning, setIsRunning] = useState(false);

  // Modais
  const [showShopModal, setShowShopModal] = useState(false);
  const [showBackpackModal, setShowBackpackModal] = useState(false);
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [showMixamoGuide, setShowMixamoGuide] = useState(false);
  const [victoryMission, setVictoryMission] = useState<{ title: string; reward: number } | null>(null);

  // Estado da HUD da Cidade (Com R$ 3.00 inicial e Missão 1)
  const [hudState, setHudState] = useState<CityHUDState>({
    money: 3.00,
    stamina: 100,
    isExhausted: false,
    coinsCollected: 0,
    totalCoins: 24,
    backpack: [],
    activeJob: null,
    currentMission: {
      id: 1,
      title: 'Missão 1: Primeiro Trabalho',
      description: 'Trabalhe 1 vez e ganhe seus primeiros R$ 20!',
      reward: 15,
      progress: 0,
      total: 1,
      completed: false,
    },
    nearestLocation: null,
    nearestNPC: null,
    nearestCar: null,
    isInCar: false,
    carName: '',
    dialogueText: null,
    distanceToTarget: 0,
  });

  // Inicialização do GameEngine Three.js
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(canvasMountRef.current, {
      onHUDUpdate: (newState) => {
        setHudState(newState);
      },
      onCoinCollected: (_val, _newTotal) => {
        confetti({
          particleCount: 22,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#facc15', '#f59e0b', '#fbbf24'],
        });
      },
      onJobCompleted: (_jobName, reward) => {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#38bdf8', '#fbbf24', '#f59e0b'],
        });
      },
      onMissionCompleted: (title, reward) => {
        setVictoryMission({ title, reward });
        confetti({
          particleCount: 140,
          spread: 95,
          origin: { y: 0.55 },
          colors: ['#38bdf8', '#fbbf24', '#22c55e', '#ef4444', '#a855f7'],
        });
      },
      onItemPurchased: (_item) => {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#a855f7', '#38bdf8', '#f59e0b'],
        });
      },
    });

    gameEngineRef.current = engine;

    return () => {
      engine.destroy();
      gameEngineRef.current = null;
      soundManager.stopAll();
    };
  }, []);

  // Para o som e a simulação imediatamente ao mudar de aba, alternar para o código Unity ou minimizar a tela
  useEffect(() => {
    if (activeTab !== 'simulator') {
      soundManager.pauseAll();
      gameEngineRef.current?.pause();
    } else {
      soundManager.resumeAll();
      gameEngineRef.current?.resume();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        soundManager.pauseAll();
        gameEngineRef.current?.pause();
      } else if (activeTab === 'simulator') {
        soundManager.resumeAll();
        gameEngineRef.current?.resume();
      }
    };

    const handleWindowBlur = () => {
      soundManager.pauseAll();
      gameEngineRef.current?.pause();
    };

    const handleWindowFocus = () => {
      if (activeTab === 'simulator' && !document.hidden) {
        soundManager.resumeAll();
        gameEngineRef.current?.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pagehide', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pagehide', handleWindowBlur);
    };
  }, [activeTab]);

  // Handlers dos Controles
  const handleJoystickMove = (x: number, y: number) => {
    gameEngineRef.current?.setJoystickInput(x, y);
  };

  const handleToggleRun = () => {
    gameEngineRef.current?.toggleRun();
    setIsRunning(gameEngineRef.current?.getIsRunning() || false);
  };

  const handleJump = () => {
    gameEngineRef.current?.jump();
  };

  const handleWork = () => {
    gameEngineRef.current?.tryInteractOrWork();
  };

  const handleOpenShop = () => {
    setShowShopModal(true);
  };

  const handleSpeak = () => {
    gameEngineRef.current?.waveAndSpeak();
  };

  const handleToggleCarRide = () => {
    gameEngineRef.current?.toggleCarRide();
  };

  const handleHonk = () => {
    gameEngineRef.current?.honkHorn();
  };

  const handleCameraRotate = (dx: number, dy: number) => {
    gameEngineRef.current?.rotateCamera(dx, dy);
  };

  const handleTurnLeft = () => {
    gameEngineRef.current?.turnCameraLeft(0.24);
  };

  const handleTurnRight = () => {
    gameEngineRef.current?.turnCameraRight(0.24);
  };

  const handleBuyItem = (item: BackpackItem) => {
    gameEngineRef.current?.buyItem(item);
  };

  const handleUseBackpackItem = (item: BackpackItem) => {
    gameEngineRef.current?.useBackpackItem(item);
  };

  const handleSelectJob = (jobId: string) => {
    gameEngineRef.current?.startJob(jobId);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none flex flex-col font-sans">
      
      {/* ÁREA DE JOGO 100% FULL SCREEN ESTILO GTA INFANTIL (SEM TARJAS EXTERNAS) */}
      <div className="relative flex-1 w-full h-full">
        
        {/* CANVAS 3D DO THREE.JS */}
        <div 
          ref={canvasMountRef}
          className={`absolute inset-0 ${
            activeTab === 'simulator' ? 'block' : 'hidden'
          }`}
        />

        {/* HUD MOBILE GTA / FREE FIRE OVERLAY */}
        {activeTab === 'simulator' && (
          <GtaKidHUD
            hudState={hudState}
            isRunning={isRunning}
            onJoystickMove={handleJoystickMove}
            onToggleRun={handleToggleRun}
            onJump={handleJump}
            onWork={handleWork}
            onOpenShop={handleOpenShop}
            onSpeak={handleSpeak}
            onToggleCarRide={handleToggleCarRide}
            onHonk={handleHonk}
            onCameraRotate={handleCameraRotate}
            onTurnLeft={handleTurnLeft}
            onTurnRight={handleTurnRight}
            onOpenUnityCode={() => setActiveTab('unityCode')}
            onOpenBackpack={() => setShowBackpackModal(true)}
            onOpenJobsModal={() => setShowJobsModal(true)}
          />
        )}

        {/* EXPLORADOR DE CÓDIGO E ARQUIVOS UNITY 3D */}
        {activeTab === 'unityCode' && (
          <div className="absolute inset-0 z-40">
            <UnityProjectExplorer
              onClose={() => setActiveTab('simulator')}
              onOpenMixamoGuide={() => setShowMixamoGuide(true)}
            />
          </div>
        )}

      </div>

      {/* MODAL DAS LOJAS DA CIDADE (BRINQUEDOS, MERCADO, ROUPAS) */}
      <ShopModal
        isOpen={showShopModal}
        currentMoney={hudState.money}
        onClose={() => setShowShopModal(false)}
        onBuy={handleBuyItem}
      />

      {/* MODAL DA MOCHILA DO THEO LUCCA */}
      <BackpackModal
        isOpen={showBackpackModal}
        backpack={hudState.backpack}
        onClose={() => setShowBackpackModal(false)}
        onUseItem={handleUseBackpackItem}
      />

      {/* MODAL DOS 5 TRABALHOS DA CIDADE */}
      <JobsModal
        isOpen={showJobsModal}
        onClose={() => setShowJobsModal(false)}
        onSelectJob={handleSelectJob}
      />

      {/* MODAL DE MISSÃO PRINCIPAL CONCLUÍDA */}
      {victoryMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400 rounded-2xl max-w-sm w-full p-5 text-center shadow-[0_0_50px_rgba(245,158,11,0.45)] space-y-4">
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
              </div>
            </div>

            <div>
              <div className="text-xl font-black text-amber-400 tracking-wider font-['Rajdhani'] uppercase">
                MISSÃO CONCLUÍDA!
              </div>
              <h2 className="text-sm font-bold text-white mt-1">
                {victoryMission.title}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Theo Lucca completou a missão com excelência e recebeu a recompensa em dinheiro na carteira!
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-left space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Recompensa Paga:</span>
                <span className="text-amber-400 font-bold">+R$ {victoryMission.reward.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Saldo na Carteira:</span>
                <span className="text-emerald-400 font-bold">R$ {hudState.money.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setVictoryMission(null)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition"
              >
                <span>Continuar Aventura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GUIA MIXAMO FBX */}
      <MixamoGuideModal
        isOpen={showMixamoGuide}
        onClose={() => setShowMixamoGuide(false)}
      />

    </div>
  );
}
