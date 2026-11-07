import * as THREE from 'three';

/**
 * Procedural PBR Texture Generator
 * Zero external image dependencies - Generates high-fidelity 512x512 CanvasTextures
 * with sRGBColorSpace and max anisotropy for razor-sharp visual realism.
 */

// 1. Textura de Asfalto Realista com Grãos, Desgaste e Faixas
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base de asfalto escuro
  ctx.fillStyle = '#1e2430';
  ctx.fillRect(0, 0, 512, 512);

  // Ruído de agregados e pedriscos
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 32;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Marcas sutis de desgaste de pneus
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(15, 20, 25, 0.4)');
  grad.addColorStop(0.2, 'rgba(35, 42, 55, 0.1)');
  grad.addColorStop(0.5, 'rgba(15, 20, 25, 0.3)');
  grad.addColorStop(0.8, 'rgba(35, 42, 55, 0.1)');
  grad.addColorStop(1, 'rgba(15, 20, 25, 0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 2. Textura de Calçada com Placas de Concreto e Juntas
export function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Concreto cinza claro
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 512);

  // Textura granular de cimento
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Grade de lajotas quadradas com rejunte chanfrado
  const tileSize = 64;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Borda de chanfro suave
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let x = 1; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 3. Textura de Grama Verde Orgânica Natural
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base verde gramado
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, 0, 512, 512);

  // Variação multi-tom de folhagem e terra
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const shift = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(20, 34 + shift * 0.4));     // R
    data[i + 1] = Math.min(255, Math.max(70, 197 + shift));      // G
    data[i + 2] = Math.min(255, Math.max(20, 94 + shift * 0.5)); // B
  }
  ctx.putImageData(imgData, 0, 0);

  // Lâminas de grama desenhadas suavemente
  ctx.strokeStyle = 'rgba(21, 128, 61, 0.4)';
  ctx.lineWidth = 1.5;
  for (let k = 0; k < 600; k++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, y - Math.random() * 8);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 4. Textura de Areia Granular Dourada da Praia
export function createSandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.min(255, Math.max(0, 253 + noise * 0.5));
    data[i + 1] = Math.min(255, Math.max(0, 224 + noise));
    data[i + 2] = Math.min(255, Math.max(0, 100 + noise * 1.2));
  }
  ctx.putImageData(imgData, 0, 0);

  // Ondulações sutis de vento
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
  ctx.lineWidth = 3;
  for (let y = 20; y < 512; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(128, y + 10, 384, y - 10, 512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 5. Textura de Tijolos Cerâmicos para Edifícios
export function createBrickTexture(brickColor: string = '#b91c1c', mortarColor: string = '#cbd5e1'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = mortarColor;
  ctx.fillRect(0, 0, 512, 512);

  const brickH = 32;
  const brickW = 64;

  ctx.fillStyle = brickColor;
  for (let row = 0; row < 16; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let col = -1; col < 9; col++) {
      const bx = col * (brickW + 4) + offset;
      const by = row * (brickH + 4);

      // Tijolo com sutil gradiente
      ctx.fillRect(bx, by, brickW, brickH);

      // Ruído interno do tijolo
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(bx + 2, by + 2, brickW - 4, brickH - 4);
      ctx.fillStyle = brickColor;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 6. Textura de Piso Cerâmico Quadriculado (Pizzaria & Lojas)
export function createCheckeredFloorTexture(c1: string = '#ffffff', c2: string = '#b91c1c'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? c1 : c2;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Rejunte cinza fino
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 7. Textura de Piso de Madeira Nobre (Padaria & Lojas)
export function createWoodFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 512, 512);

  const plankH = 42;
  for (let y = 0; y < 512; y += plankH) {
    // Variação de tom entre réguas
    const tone = (Math.random() - 0.5) * 35;
    ctx.fillStyle = `rgb(${180 + tone}, ${83 + tone * 0.6}, ${9 + tone * 0.2})`;
    ctx.fillRect(0, y, 512, plankH - 2);

    // Fresta escura entre réguas
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, y + plankH - 2, 512, 2);

    // Veios da madeira
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, y + 6 + i * 8);
      ctx.bezierCurveTo(128, y + 4 + i * 8, 384, y + 9 + i * 8, 512, y + 7 + i * 8);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
