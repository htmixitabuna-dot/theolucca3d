import React from 'react';
import { X, Box, CheckCircle2, Download, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export interface MixamoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixamoGuideModal: React.FC<MixamoGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Guia de Importação Mixamo .FBX & Rig do Theo Lucca
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Como configurar o esqueleto Humanoid, ossos e animações para Unity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          
          {/* Card Descritivo do Personagem */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-amber-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-bold text-lg font-['Rajdhani']">
                TL 4a
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-amber-400 font-bold text-sm">
                Theo Lucca - Especificações Realistas
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Menino de 4 anos com proporções anatômicas infantis reais (altura aproximada 1.05m). Pele morena clara (<code className="text-amber-300">#C68652</code>), cachos volumosos castanho escuro, boné azul royal, camisa azul com estrela, mochila marrom de aventureiro e tênis vermelho esportivo. <strong>Não é boneco blocado nem cubo.</strong>
              </p>
            </div>
          </div>

          {/* Passo a Passo Mixamo */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Passo a Passo no Adobe Mixamo (Grátis):
            </h4>

            {/* Passo 1 */}
            <div className="flex gap-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                01
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-200 text-xs">
                  Acessar o Mixamo e Fazer Upload
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Acesse <a href="https://www.mixamo.com" target="_blank" rel="noreferrer" className="text-sky-400 underline font-medium">mixamo.com</a> com sua conta gratuita da Adobe e clique no botão <strong>"Upload Character"</strong> para enviar seu arquivo <code>theo_lucca.obj</code> ou <code>theo_lucca.fbx</code>.
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex gap-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                02
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-200 text-xs">
                  Posicionamento dos Marcadores Anatômicos (Auto-Rigger)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Arraste os círculos para as articulações do menino Theo Lucca:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
                  <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-emerald-300">• Chin: Queixo</span>
                  <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-emerald-300">• Wrists: Pulsos</span>
                  <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-emerald-300">• Elbows: Cotovelos</span>
                  <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-emerald-300">• Knees: Joelhos</span>
                  <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-emerald-300">• Groin: Virilha</span>
                  <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-amber-300">• Skeleton: Standard (65)</span>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex gap-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                03
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-200 text-xs">
                  Baixar as Animações Essenciais do Mixamo
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No catálogo do Mixamo, pesquise e baixe cada uma destas animações no formato <strong>FBX for Unity (.fbx)</strong>:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-1 font-mono">
                  <li><strong>Idle</strong> (Casual Boy Idle / Breathing) &rarr; Com Skin (Mesh incluída)</li>
                  <li><strong>Walking</strong> &rarr; Marcar caixa <code className="text-amber-400 font-bold">In Place</code> &rarr; Without Skin</li>
                  <li><strong>Running</strong> (Fast Boy Sprint) &rarr; Marcar <code className="text-amber-400 font-bold">In Place</code> &rarr; Without Skin</li>
                  <li><strong>Jump</strong> (Joyful Jump / Leap) &rarr; Without Skin</li>
                </ul>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex gap-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                04
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-200 text-xs">
                  Configuração no Unity Inspector (Humanoid Avatar)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  1. Arraste <code>theo_lucca.fbx</code> para <code>Assets/Models/</code> no Unity.<br/>
                  2. No Inspector, clique na aba <strong>Rig</strong>.<br/>
                  3. Altere <strong>Animation Type</strong> para <span className="text-emerald-400 font-bold">Humanoid</span>.<br/>
                  4. Clique em <strong>Apply</strong> e depois em <strong>Configure...</strong> para confirmar os ossos verdes.<br/>
                  5. No Animator Controller, crie a Blend Tree com o parâmetro Float <code>Speed</code> (0 = Idle, 0.5 = Walk, 1.0 = Run).
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition"
          >
            Entendi, Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
