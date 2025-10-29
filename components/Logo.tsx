import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <svg
        aria-label="Veravox Logo"
        role="img"
        width="40"
        height="40"
        viewBox="0 0 100 95"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10"
      >
        <title>Veravox Logo</title>
        <desc>A heart shape, with the left half resembling a red ladybug wing and the right half a grey elephant wing.</desc>
        <g>
          {/* Heart shape composed of two halves */}
          {/* Left half: Ladybug wing */}
          <path
            d="M50,30 C10,-10 10,50 50,95"
            fill="#E53935" // red
          />
          {/* Right half: Elephant wing */}
          <path
            d="M50,30 C90,-10 90,50 50,95"
            fill="#B0BEC5" // blue-grey
          />
          
          {/* Ladybug spots */}
          <circle cx="35" cy="45" r="5" fill="#212121" />
          <circle cx="25" cy="65" r="4" fill="#212121" />
          <circle cx="40" cy="75" r="3" fill="#212121" />
          
          {/* Elephant wing feathers */}
          <path d="M60 40 Q 70 50, 65 60" stroke="#78909C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M65 50 Q 75 60, 70 70" stroke="#78909C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M70 60 Q 80 70, 75 80" stroke="#78909C" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Elephant trunk element at bottom */}
           <path d="M50 95 C 45 80, 55 80, 50 70" stroke="#78909C" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-['Poppins']">
        Veravox
      </h1>
    </div>
  );
};
