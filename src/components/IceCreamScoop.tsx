import React, { useState } from 'react';

export const FLAVOR_IMAGES: Record<string, string> = {
  'Chocolate Malteado': '/chocolatemalteado.webp',
  'Chocolate': '/chocolatemalteado.webp',
  'Fresa': '/fresa.webp',
  'Mantecado': '/mantecado.webp',
  'Napolitano': '/napolitano.webp',
  'Tiramisu': '/tiramisu.webp',
  'Biscotti Dolci': '/biscottidolci.webp',
  'Brazo Gitano de Coco': '/brazogitanodecoco.webp',
  "Hershey's": '/hersheys.webp',
  'Sundae de Arequipe': '/sundaearequipe.webp',
  'Sundae de Chocolate': '/sundaechocolate.webp',
  'Sundae de Fresa': '/sundaefresa.webp',
  'Brownie Snickers': '/browniesnickers.webp',
  'Oreo': '/oreo.webp',
  'Ron Pasas': '/ronpasas.webp',
  'Tia Gesua': '/tiagesua.webp',
  'Cheesecake de Fresa': '/cheesecakefresa.webp',
  'Chocolatissimo': '/chocolatissimo.webp',
  'Chocolattisimo': '/chocolatissimo.webp',
  'Brownie': '/brownie.webp',
  'Brownie Fudge': '/browniefudge.webp',
  'Coco': '/coco.webp',
  'Pistacho': '/pistacho.webp',
  'Ferrero Rocher': '/ferrerorocher.webp',
  'Chocolate Dubai': '/chocolatedubai.webp',
  'Ferrero Rochers': '/ferrerorocher.webp',
  'Merengada Ferrero': '/merengadagelatoferreros.webp',
  'Merengada Reeses': '/merengadagelatoreeses.webp',
  'Merengada Oreo': '/merengadagelatooreo.webp',
  'Merengada Nutella': '/merengadagelatonutella.webp',
  'Merengada B-ready': '/merengadagelatobready.webp',
  'Merengada Raffaello': '/merengadagelatoraffaello.webp',
};

export const FLAVOR_COLORS: Record<string, string | string[]> = {
  'Fresa': '#ffbfa3',
  'Mantecado': '#fffdd0',
  'Chocolate Malteado': '#6b3e2e',
  'Chocolate': '#4e2a1d',
  'Dulce de Leche': '#c89f70',
  'Napolitano': ['#ffbfa3', '#fffdd0', '#4e2a1d'],
  'Tiramisu': '#cda579',
  'Biscotti Dolci': '#e3c295',
  "Hershey's": '#351c15',
  'Sundae de Arequipe': '#e0b589',
  'Sundae de Chocolate': '#351c15',
  'Sundae de Fresa': '#ffbfa3',
  'Brownie Snickers': '#5c3a21',
  'Oreo': '#2c2c2c',
  'Ron Pasas': '#b57952',
  'Tia Gesua': '#c59b6d',
  'Cheesecake de Fresa': '#ffd1dc',
  'Chocolatissimo': '#22110c',
  'Chocolattisimo': '#22110c',
  'Brownie': '#3e2723',
  'Brownie Fudge': '#351c15',
  'Coco': '#ffffff',
  'Brazo Gitano de Coco': '#f0eed8',
  'Ferrero Rocher': '#b78c43',
  'Chocolate Dubai': '#2a1711',
  'Pistacho': '#a9c77e',
  'PISTACHO': '#a9c77e',
  'NOCCIOLA': '#bca476',
  'Nutella': '#5c3a21',
  'Original': '#e8d4a2',
  'Toddy Crunch': '#6b3e2e',
  'Ferrero Rochers': '#b78c43',
  'Frutos del Bosque': '#864367',
  'Merengada Reeses': '#db9947',
  'Merengada Oreo': '#2c2c2c',
  'Merengada Nutella': '#5c3a21',
  'Merengada B-ready': '#e3c295',
  'Merengada Raffaello': '#f4f4f4',
  'Merengada Ferrero': '#b78c43',
  'Frapuccino Original': '#cda579',
  'Frapuccino Tiramisu': '#bca476',
};

export const IceCreamScoop = ({ flavorName, className = "w-8 h-8" }: { flavorName: string, className?: string }) => {
  const [imgError, setImgError] = useState(false);
  const colorDef = FLAVOR_COLORS[flavorName] || '#fffdd0';
  const isGradient = Array.isArray(colorDef);
  const colorId = flavorName.replace(/[^a-zA-Z0-9]/g, '');
  const imageUrl = FLAVOR_IMAGES[flavorName];

  const renderSvg = () => {
    if (isGradient) {
      return (
        <svg viewBox="0 0 100 100" className={`filter drop-shadow-md ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`grad-${colorId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorDef[0]} />
              <stop offset="33%" stopColor={colorDef[0]} />
              <stop offset="33%" stopColor={colorDef[1]} />
              <stop offset="66%" stopColor={colorDef[1]} />
              <stop offset="66%" stopColor={colorDef[2]} />
              <stop offset="100%" stopColor={colorDef[2]} />
            </linearGradient>
            <linearGradient id={`shadow-${colorId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M50 8C27.9086 8 10 25.9086 10 48C10 65.097 20.7303 79.6896 35.8858 85.5786C36.6853 87.218 38.3842 88.3333 40.3333 88.3333C42.4746 88.3333 44.3168 87.0396 45 85.1633C46.5492 85.7196 48.2393 86.0152 50 86.0152C51.6841 86.0152 53.3045 85.7483 54.8016 85.2443C55.4975 87.0347 57.29 88.2652 59.3561 88.2652C61.3533 88.2652 63.0903 87.1147 63.8166 85.4214C78.96 79.6108 89.6667 65.0592 89.6667 48C89.6667 25.9086 71.758 8 49.6667 8H50Z" fill={`url(#grad-${colorId})`}/>
          <path d="M50 8C27.9086 8 10 25.9086 10 48C10 65.097 20.7303 79.6896 35.8858 85.5786C36.6853 87.218 38.3842 88.3333 40.3333 88.3333C42.4746 88.3333 44.3168 87.0396 45 85.1633C46.5492 85.7196 48.2393 86.0152 50 86.0152C51.6841 86.0152 53.3045 85.7483 54.8016 85.2443C55.4975 87.0347 57.29 88.2652 59.3561 88.2652C61.3533 88.2652 63.0903 87.1147 63.8166 85.4214C78.96 79.6108 89.6667 65.0592 89.6667 48C89.6667 25.9086 71.758 8 49.6667 8H50Z" fill={`url(#shadow-${colorId})`}/>
          <path d="M30 30 C 40 15, 60 15, 70 30" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
        </svg>
      );
    }

    const hexColor = colorDef as string;
    
    return (
      <svg viewBox="0 0 100 100" className={`filter drop-shadow-md ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-${colorId}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="20%" stopColor={hexColor} stopOpacity="1" />
            <stop offset="80%" stopColor={hexColor} stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path d="M50 8C27.9086 8 10 25.9086 10 48C10 65.097 20.7303 79.6896 35.8858 85.5786C36.6853 87.218 38.3842 88.3333 40.3333 88.3333C42.4746 88.3333 44.3168 87.0396 45 85.1633C46.5492 85.7196 48.2393 86.0152 50 86.0152C51.6841 86.0152 53.3045 85.7483 54.8016 85.2443C55.4975 87.0347 57.29 88.2652 59.3561 88.2652C61.3533 88.2652 63.0903 87.1147 63.8166 85.4214C78.96 79.6108 89.6667 65.0592 89.6667 48C89.6667 25.9086 71.758 8 49.6667 8H50Z" fill={`url(#grad-${colorId})`}/>
        <path d="M30 30 C 40 15, 60 15, 70 30" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
        <path d="M35.8858 85.5786C36.6853 87.218 38.3842 88.3333 40.3333 88.3333C42.4746 88.3333 44.3168 87.0396 45 85.1633C46.5492 85.7196 48.2393 86.0152 50 86.0152C51.6841 86.0152 53.3045 85.7483 54.8016 85.2443C55.4975 87.0347 57.29 88.2652 59.3561 88.2652C61.3533 88.2652 63.0903 87.1147 63.8166 85.4214" stroke="#000000" strokeWidth="1" strokeOpacity="0.2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  };

  if (imageUrl && !imgError) {
    return (
      <img 
        src={imageUrl} 
        alt={`Helado sabor ${flavorName}`} 
        className={`object-contain filter drop-shadow-md rounded-full ${className}`} 
        onError={() => setImgError(true)}
      />
    );
  }

  return renderSvg();
};
