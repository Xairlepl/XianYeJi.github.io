import type { SyntheticEvent } from 'react';

const palette = [
  ['#dcfce7', '#16a34a'],
  ['#fef3c7', '#d97706'],
  ['#e0f2fe', '#0284c7'],
  ['#fee2e2', '#dc2626'],
  ['#ede9fe', '#7c3aed'],
  ['#f3f4f6', '#4b5563'],
];

const pickIcon = (name: string) => {
  if (/苹果|橙|芒|柑|水果/.test(name)) return '果';
  if (/菜|瓜|番茄|西兰花/.test(name)) return '蔬';
  if (/米|油|粮|面/.test(name)) return '粮';
  if (/肉|羊|鸡蛋|蛋/.test(name)) return '鲜';
  if (/鱼|虾|海参|海鲜/.test(name)) return '海';
  if (/茶|龙井|铁观音|普洱/.test(name)) return '茶';
  if (/奶|酸奶|乳/.test(name)) return '乳';
  return '农';
};

const pickPalette = (name: string) => {
  const seed = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[seed % palette.length];
};

export const getProductFallbackImage = (name = '鲜野集') => {
  const safeName = name.slice(0, 14);
  const [bg, fg] = pickPalette(name);
  const icon = pickIcon(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
      <rect width="640" height="640" rx="32" fill="${bg}"/>
      <circle cx="320" cy="250" r="120" fill="#ffffff" opacity="0.72"/>
      <text x="320" y="288" text-anchor="middle" font-family="Arial, sans-serif" font-size="112" font-weight="700" fill="${fg}">${icon}</text>
      <text x="320" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#1f2937">${safeName}</text>
      <text x="320" y="482" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">鲜野集 · 模拟商品图</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const setProductImageFallback = (
  event: SyntheticEvent<HTMLImageElement>,
  name?: string
) => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = getProductFallbackImage(name || image.alt);
};
