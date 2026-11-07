import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Package, 
  Briefcase, 
  Coins, 
  Sparkles, 
  Check, 
  MapPin, 
  Utensils, 
  Gamepad2, 
  Shirt, 
  Heart 
} from 'lucide-react';
import { BackpackItem, ActiveJob } from '../simulation/GameEngine';

// --- CATÁLOGO DE PRODUTOS DAS LOJAS DA CIDADE ---
export const SHOP_CATALOG: BackpackItem[] = [
  // Loja de Brinquedos
  { id: 'toy_car', name: 'Carrinho de Brinquedo', category: 'brinquedo', price: 30, icon: '🏎️', description: 'Carrinho esportivo vermelho super veloz!' },
  { id: 'toy_ball', name: 'Bola de Futebol', category: 'brinquedo', price: 15, icon: '⚽', description: 'Bola macia para jogar no parque e chutar gol!' },
  { id: 'toy_kite', name: 'Pipa Colorida', category: 'brinquedo', price: 20, icon: '🪁', description: 'Pipa de arco-íris para empinar na praia com o vento!' },
  { id: 'toy_bear', name: 'Ursinho de Pelúcia', category: 'brinquedo', price: 25, icon: '🧸', description: 'Ursinho fofinho companheiro de aventuras do Theo!' },

  // Supermercado
  { id: 'food_apple', name: 'Maçã Vermelha', category: 'comida', price: 5, icon: '🍎', description: 'Fruta fresca e crocante. Restaura 100% do fôlego!' },
  { id: 'food_juice', name: 'Suco de Laranja', category: 'comida', price: 8, icon: '🧃', description: 'Suco natural geladinho para matar a sede do Theo!' },
  { id: 'food_bread', name: 'Pão Quentinho', category: 'comida', price: 6, icon: '🥖', description: 'Pão da padaria crocante por fora e macio por dentro!' },
  { id: 'food_cookie', name: 'Biscoito Estrela', category: 'comida', price: 7, icon: '🍪', description: 'Biscoito doce de chocolate com formato de estrela!' },

  // Loja de Roupas
  { id: 'cloth_gold_cap', name: 'Boné Dourado Campeão', category: 'roupa', price: 40, icon: '🧢', description: 'Boné dourado reluzente estilo Free Fire campeão!' },
  { id: 'cloth_turbo_sneakers', name: 'Tênis Turbo com Luz', category: 'roupa', price: 60, icon: '👟', description: 'Tênis esportivo com luzinhas nos calcanhares!' },
  { id: 'cloth_hero_shirt', name: 'Camiseta de Super-Herói', category: 'roupa', price: 35, icon: '👕', description: 'Camiseta azul marinho com brasão dourado!' },
];

export interface ShopModalProps {
  isOpen: boolean;
  currentMoney: number;
  onClose: () => void;
  onBuy: (item: BackpackItem) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  currentMoney,
  onClose,
  onBuy,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'brinquedo' | 'comida' | 'roupa'>('todos');

  if (!isOpen) return null;

  const filteredItems = selectedCategory === 'todos' 
    ? SHOP_CATALOG 
    : SHOP_CATALOG.filter((i) => i.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm pointer-events-auto animate-fade-in font-sans">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-purple-500 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.35)] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Lojas da Cidade Real 3D
              </h2>
              <p className="text-[10px] text-slate-400">
                Brinquedos, Lanches e Roupas para o Theo Lucca
              </p>
            </div>
          </div>

          {/* Saldo na Carteira */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>R$ {currentMoney.toFixed(2)}</span>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="flex gap-1.5 p-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          {[
            { id: 'todos', label: 'Todos os Itens', icon: Sparkles },
            { id: 'brinquedo', label: 'Brinquedos', icon: Gamepad2 },
            { id: 'comida', label: 'Mercado & Comida', icon: Utensils },
            { id: 'roupa', label: 'Roupas & Bonés', icon: Shirt },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition text-[11px] ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grade de Itens */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const canAfford = currentMoney >= item.price;
            return (
              <div 
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 rounded-xl p-3 flex flex-col justify-between transition group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-2xl p-2 bg-slate-950 rounded-lg border border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{item.description}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="font-mono font-bold text-amber-400 text-xs">
                    R$ {item.price},00
                  </div>

                  <button
                    onClick={() => onBuy(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
                      canAfford 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Comprar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com Dica */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-400 font-mono">
          Os itens comprados são guardados diretamente na Mochila do Theo Lucca!
        </div>

      </div>
    </div>
  );
};

// --- MODAL DA MOCHILA (INVENTÁRIO DO THEO) ---
export interface BackpackModalProps {
  isOpen: boolean;
  backpack: BackpackItem[];
  onClose: () => void;
  onUseItem: (item: BackpackItem) => void;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  isOpen,
  backpack,
  onClose,
  onUseItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm pointer-events-auto animate-fade-in font-sans">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-600 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(217,119,6,0.35)] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500 flex items-center justify-center text-amber-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Mochila do Theo Lucca
              </h2>
              <p className="text-[10px] text-slate-400">
                Itens, Brinquedos e Lanches Coletados ({backpack.length} itens)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo da Mochila */}
        <div className="p-4 overflow-y-auto flex-1">
          {backpack.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🎒</div>
              <p className="text-xs text-slate-300 font-medium">A mochila do Theo está vazia!</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Trabalhe nas missões para ganhar R$ e visite a Loja de Brinquedos, Mercado ou Loja de Roupas!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {backpack.map((item, index) => (
                <div 
                  key={`${item.id}_${index}`}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-2 bg-slate-950 rounded-lg border border-slate-800">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-400">{item.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onUseItem(item);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex-shrink-0 transition"
                  >
                    {item.category === 'comida' ? 'Comer / Beber' : 'Brincar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Fechar Mochila
          </button>
        </div>

      </div>
    </div>
  );
};

// --- MODAL DE TRABALHOS DA CIDADE ---
export interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJob: (jobId: string) => void;
}

export const JobsModal: React.FC<JobsModalProps> = ({
  isOpen,
  onClose,
  onSelectJob,
}) => {
  if (!isOpen) return null;

  const jobsList = [
    {
      id: 'pizzaria_do_bairro',
      name: '1. Entregador de Pizza',
      reward: 'R$ 20,00',
      icon: '🍕',
      desc: 'Pegue a pizza na pizzaria e leve até a casa do vizinho marcada no mapa.',
      place: 'Pizzaria do Bairro',
    },
    {
      id: 'supermercado_central',
      name: '2. Ajudante do Mercado',
      reward: 'R$ 15,00',
      icon: '📦',
      desc: 'Pegue caixas de suprimentos na doca e organize nas prateleiras.',
      place: 'Supermercado Central',
    },
    {
      id: 'parque_jardineiro',
      name: '3. Jardineiro do Parque',
      reward: 'R$ 10,00',
      icon: '🌻',
      desc: 'Regue os 3 canteiros de flores com o regador para deixá-las floridas.',
      place: 'Parque das Flores',
    },
    {
      id: 'entregador_jornal',
      name: '4. Entregador de Jornal',
      reward: 'R$ 25,00',
      icon: '📰',
      desc: 'Entregue o jornal matinal nas caixas de correio dos vizinhos.',
      place: 'Banca Central',
    },
    {
      id: 'padaria_pao_quentinho',
      name: '5. Ajudante da Padaria',
      reward: 'R$ 12,00',
      icon: '🥖',
      desc: 'Leve sacola de pães quentinhos para a Vovó Maria na praça.',
      place: 'Padaria Pão Quentinho',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm pointer-events-auto animate-fade-in font-sans">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.35)] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Trabalhos da Cidade (Ganhe R$)
              </h2>
              <p className="text-[10px] text-slate-400">
                5 Missões de Trabalho Infantis para juntar moedas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista dos 5 Trabalhos */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {jobsList.map((job) => (
            <div 
              key={job.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/70 rounded-xl p-3 flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl p-2 bg-slate-950 rounded-lg border border-slate-800 flex-shrink-0">
                  {job.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white truncate">{job.name}</h3>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 font-mono text-[9px] font-bold">
                      +{job.reward}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{job.desc}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectJob(job.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow flex-shrink-0 transition"
              >
                Trabalhar
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Voltar à Cidade
          </button>
        </div>

      </div>
    </div>
  );
};
