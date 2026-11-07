import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  Box, 
  Layers, 
  Settings, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Gamepad2,
  Code2
} from 'lucide-react';
import JSZip from 'jszip';
import { UNITY_PROJECT_FILES, UnityFile } from '../unity-data/unityFiles';

export interface UnityProjectExplorerProps {
  onClose?: () => void;
  onOpenMixamoGuide: () => void;
}

export const UnityProjectExplorer: React.FC<UnityProjectExplorerProps> = ({
  onClose,
  onOpenMixamoGuide,
}) => {
  const [selectedFile, setSelectedFile] = useState<UnityFile>(UNITY_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    Assets: true,
    Scripts: true,
    Models: true,
    Scenes: true,
    UI: true,
    ProjectSettings: true,
  });

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const copyToClipboard = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSingleFile = (file: UnityFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFullProjectZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();

      // Adiciona cada arquivo no seu respectivo caminho no ZIP
      UNITY_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Adiciona README do Projeto com Instruções de Instalação no Unity Hub
      const readmeContent = `# THEO LUCCA - CIDADE REAL 3D (UNITY 3D GTA INFANTIL)

Projeto completo de jogo Unity estilo GTA infantil estrelado por Theo Lucca (menino de 4 anos).
Jogo 100% infantil: sem violência, sem armas, com trânsito que não atropela (carros param e buzinam fofo), pedestres amigáveis, 5 trabalhos para ganhar R$ e lojas de brinquedos/mercado/roupas.

## Como Abrir no Unity:
1. Extraia o conteúdo deste arquivo .ZIP em uma pasta no seu computador (ex: \`C:/Projetos/TheoLuccaCidadeReal3D\`).
2. Abra o **Unity Hub**.
3. Clique em **Add** / **Open** e selecione a pasta extraída.
4. Recomendado: Unity 2022.3 LTS, Unity 2023.2 ou Unity 6 (URP - Universal Render Pipeline).
5. Abra a cena \`Assets/Scenes/Cidade.unity\`.
6. Pressione **Play** no Unity para jogar!

## Estrutura do Projeto:
- \`Assets/Models/theo_lucca.fbx\` (Modelo realista com Humanoid Avatar e texturas PBR)
- \`Assets/Models/carros.fbx\` (5 carros coloridos com IA autônoma)
- \`Assets/Models/npcs.fbx\` (10 moradores da cidade com balões de fala)
- \`Assets/Scripts/PlayerController.cs\` (Controles do Theo com joystick, corrida, pulo, carona)
- \`Assets/Scripts/CarController.cs\` (Trânsito com semáforos e freio de segurança anti-atropelamento)
- \`Assets/Scripts/NPCController.cs\` (Pedestres que acenam e falam "Oi Theo!")
- \`Assets/Scripts/MoneyManager.cs\` (Carteira em R$ e moedas coletáveis)
- \`Assets/Scripts/JobManager.cs\` (5 trabalhos infantis com pagamentos em R$)
- \`Assets/Scripts/ShopManager.cs\` (Lojas de brinquedos, mercado e roupas com mochila)
- \`Assets/Scripts/MissionManager.cs\` (5 missões principais da campanha)
- \`Assets/Scenes/Cidade.unity\` (Cidade completa com ruas, faixas, semáforos, praia e lojas)
- \`Assets/UI/HUD.unity\` (HUD mobile completa estilo GTA/Free Fire)
`;
      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'TheoLucca_CidadeReal3D_UnityProject.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Falha ao gerar ZIP do Unity:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  // Categorias organizadas por pasta
  const scriptsFiles = UNITY_PROJECT_FILES.filter((f) => f.category === 'Scripts');
  const modelsFiles = UNITY_PROJECT_FILES.filter((f) => f.category === 'Models');
  const scenesFiles = UNITY_PROJECT_FILES.filter((f) => f.category === 'Scenes');
  const uiFiles = UNITY_PROJECT_FILES.filter((f) => f.category === 'UI');
  const settingsFiles = UNITY_PROJECT_FILES.filter((f) => f.category === 'ProjectSettings');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans border-t border-slate-800">
      
      {/* BARRA SUPERIOR DE CABEÇALHO DO PROJETO UNITY */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide font-['Rajdhani'] uppercase flex items-center gap-2">
              Unity 3D Project Hub
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                URP 60 FPS
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              THEO LUCCA - CIDADE REAL 3D (GTA Infantil • C# Scripts & Cenas)
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Voltar ao Jogo 3D</span>
            </button>
          )}

          <button
            onClick={onOpenMixamoGuide}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Box className="w-3.5 h-3.5" />
            Guia Mixamo .FBX
          </button>

          <button
            onClick={downloadFullProjectZip}
            disabled={downloadingZip}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 shadow-md flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloadingZip ? 'Gerando Pacote...' : 'Baixar Projeto Unity (.ZIP)'}
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL: EXPLORER NA ESQUERDA + VISUALIZADOR DE CÓDIGO NO CENTRO + INSPECTOR NA DIREITA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. ÁRVORE DE ARQUIVOS ESTILO UNITY (Project Tab) */}
        <div className="w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col">
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Project Explorer (Unity)</span>
            <span className="text-[10px] text-slate-500 font-mono">{UNITY_PROJECT_FILES.length} arquivos</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 text-xs space-y-1">
            
            {/* PASTA ASSETS */}
            <div>
              <div 
                onClick={() => toggleFolder('Assets')}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer text-slate-300 font-semibold"
              >
                {openFolders.Assets ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {openFolders.Assets ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <Folder className="w-4 h-4 text-amber-400" />}
                <span>Assets</span>
              </div>

              {openFolders.Assets && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  
                  {/* Scripts */}
                  <div>
                    <div 
                      onClick={() => toggleFolder('Scripts')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer text-slate-300 font-medium"
                    >
                      {openFolders.Scripts ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                      <Folder className="w-3.5 h-3.5 text-sky-400" />
                      <span>Scripts ({scriptsFiles.length})</span>
                    </div>
                    {openFolders.Scripts && (
                      <div className="pl-4 space-y-0.5">
                        {scriptsFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition ${
                              selectedFile.path === file.path 
                                ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Models */}
                  <div>
                    <div 
                      onClick={() => toggleFolder('Models')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer text-slate-300 font-medium"
                    >
                      {openFolders.Models ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                      <Folder className="w-3.5 h-3.5 text-purple-400" />
                      <span>Models ({modelsFiles.length})</span>
                    </div>
                    {openFolders.Models && (
                      <div className="pl-4 space-y-0.5">
                        {modelsFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition ${
                              selectedFile.path === file.path 
                                ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <Box className="w-3.5 h-3.5 text-purple-400" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scenes */}
                  <div>
                    <div 
                      onClick={() => toggleFolder('Scenes')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer text-slate-300 font-medium"
                    >
                      {openFolders.Scenes ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                      <Folder className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Scenes ({scenesFiles.length})</span>
                    </div>
                    {openFolders.Scenes && (
                      <div className="pl-4 space-y-0.5">
                        {scenesFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition ${
                              selectedFile.path === file.path 
                                ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* UI */}
                  <div>
                    <div 
                      onClick={() => toggleFolder('UI')}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer text-slate-300 font-medium"
                    >
                      {openFolders.UI ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                      <Folder className="w-3.5 h-3.5 text-rose-400" />
                      <span>UI ({uiFiles.length})</span>
                    </div>
                    {openFolders.UI && (
                      <div className="pl-4 space-y-0.5">
                        {uiFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition ${
                              selectedFile.path === file.path 
                                ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-rose-400" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* PASTA PROJECT SETTINGS */}
            <div>
              <div 
                onClick={() => toggleFolder('ProjectSettings')}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer text-slate-300 font-semibold"
              >
                {openFolders.ProjectSettings ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <Settings className="w-4 h-4 text-orange-400" />
                <span>ProjectSettings</span>
              </div>
              {openFolders.ProjectSettings && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  {settingsFiles.map((file) => (
                    <div
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition ${
                        selectedFile.path === file.path 
                          ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 text-orange-400" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 2. VISUALIZADOR DE CÓDIGO C# & ARQUIVOS */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* Header do Arquivo Selecionado */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Caminho:</span>
              <span className="text-xs font-mono font-bold text-amber-400">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Copiar código C# pronto para colar no Unity"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Código'}
              </button>

              <button
                onClick={() => downloadSingleFile(selectedFile)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Baixar este arquivo avulso"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar
              </button>
            </div>
          </div>

          {/* Descrição do Arquivo */}
          <div className="px-4 py-1.5 bg-slate-900/30 border-b border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{selectedFile.description}</span>
          </div>

          {/* Editor com Números de Linha */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 bg-slate-950">
            <pre className="select-text whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>

        {/* 3. PAINEL UNITY INSPECTOR (Propriedades do GameObject) */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col hidden lg:flex">
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Unity Inspector
          </div>

          <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3">
            {selectedFile.name === 'PlayerController.cs' && (
              <div className="space-y-3">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                    PlayerController (Script)
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Walk Speed:</span>
                      <span className="font-mono text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">4.5</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Run Speed:</span>
                      <span className="font-mono text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">8.5</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Rotation Speed:</span>
                      <span className="font-mono text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">14.0</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Jump Force (Impulse):</span>
                      <span className="font-mono text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded">6.8</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Fall Multiplier:</span>
                      <span className="font-mono text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded">2.5</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Ground Layer:</span>
                      <span className="font-mono text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded">Layer 9 (Ground)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
                    Rigidbody Physics
                  </div>
                  <p className="text-[11px] text-slate-400">
                    • Mass: 35 kg (Menino de 4 anos)<br/>
                    • Freeze Rotation: X, Y, Z marcados<br/>
                    • Collision: Continuous Dynamic
                  </p>
                </div>
              </div>
            )}

            {selectedFile.name === 'MissaoManager.cs' && (
              <div className="space-y-3">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                    MissaoManager (Singleton)
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Fase Inicial:</span>
                      <span className="font-mono text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded">Fase 1 Parque</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Coordenada da Fonte:</span>
                      <span className="font-mono text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded">(0, 0, -18)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Distância de Chegada:</span>
                      <span className="font-mono text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">3.5m</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Total de Estrelas:</span>
                      <span className="font-mono text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded">50</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedFile.name !== 'PlayerController.cs' && selectedFile.name !== 'MissaoManager.cs' && (
              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-2">
                <p className="font-semibold text-slate-200">Arquivo Pronto para o Unity</p>
                <p>
                  Copie o código com o botão <strong>"Copiar Código"</strong> ou baixe o pacote completo com todas as pastas clicando em <strong>"Baixar Projeto Unity (.ZIP)"</strong>.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  Compatível com Unity 2022.3 LTS, 2023.x e Unity 6.
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
