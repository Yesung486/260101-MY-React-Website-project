
import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { Difficulty, LevelConfig } from '../types';

interface RoomProps {
  levelIndex: number;
  onInteract: (objectId: string) => void;
  unlocked: boolean;
  difficulty: Difficulty;
  currentLevel: LevelConfig;
  discoveredItems: Set<string>;
  inspectingItem: any | null; // Passed from App
  onQuizSubmit: (answer: string) => void;
  onCloseModal: () => void;
}

const Room: React.FC<RoomProps> = ({ 
    levelIndex, onInteract, unlocked, difficulty, currentLevel, discoveredItems,
    inspectingItem, onQuizSubmit, onCloseModal
}) => {
  const [localState, setLocalState] = useState<any>({});
  const [tick, setTick] = useState(0);
  const [quizInput, setQuizInput] = useState("");
  const quizInputRef = useRef<HTMLInputElement>(null);

  // Animation Tick
  useEffect(() => {
    const interval = setInterval(() => setTick(t => (t + 1) % 100), 100);
    return () => clearInterval(interval);
  }, []);

  // Reset local visual state when level changes
  useEffect(() => {
    setLocalState({});
  }, [levelIndex]);

  // Focus input when modal opens
  useEffect(() => {
    if (inspectingItem) {
        setQuizInput("");
        setTimeout(() => quizInputRef.current?.focus(), 100);
    }
  }, [inspectingItem]);

  const handleInteraction = (id: string, visualEffect?: () => void) => {
    if (inspectingItem) return; // Block clicks if modal open
    if (visualEffect) visualEffect();
    audioService.playBeep(800, 'sine', 0.05);
    onInteract(id);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onQuizSubmit(quizInput);
  };

  const isSolved = (id: string) => {
    const interaction = currentLevel.itemInteractions[id];
    return interaction && interaction.reveal && discoveredItems.has(interaction.reveal);
  };

  const getRevealText = (id: string) => currentLevel.itemInteractions[id]?.reveal || '';

  const getEasyCueClass = () => {
    return difficulty === Difficulty.EASY ? "filter drop-shadow-[0_0_8px_gold] stroke-yellow-300" : "";
  };

  // Standard Interactive Style (Subtle hover, tactile press)
  const interactClass = "cursor-pointer transition-all duration-200 hover:brightness-125 hover:scale-[1.02] active:scale-95";

  // --- Clue Positions for Visual Lines ---
  // Approximate center points of clue items for each level
  const cluePositions: Record<number, {x: number, y: number}[]> = {
      0: [{x: 150, y: 440}, {x: 700, y: 100}, {x: 360, y: 400}], // Lv 1 (Moss, Glitch, Box)
      1: [{x: 445, y: 295}, {x: 420, y: 560}, {x: 635, y: 340}], // Lv 2 (Rack, Cable, Console)
      2: [{x: 600, y: 350}, {x: 400, y: 380}, {x: 480, y: 440}], // Lv 3 (Scope, Tank, Notes)
      3: [{x: 625, y: 150}, {x: 625, y: 410}, {x: 220, y: 460}], // Lv 4 (Screen1, Screen2, File)
      4: [{x: 400, y: 300}, {x: 150, y: 200}, {x: 650, y: 450}], // Lv 5 (Fan, Pipe, Valve)
      5: [{x: 120, y: 250}, {x: 680, y: 390}, {x: 445, y: 490}], // Lv 6 (Tape, Terminal, Book)
      6: [{x: 650, y: 450}, {x: 400, y: 295}, {x: 150, y: 400}], // Lv 7 (Laser, Shield, Packet)
      7: [{x: 600, y: 250}, {x: 400, y: 350}, {x: 190, y: 230}], // Lv 8 (Hazmat, Vial, Vent)
      8: [{x: 200, y: 200}, {x: 600, y: 400}, {x: 500, y: 120}], // Lv 9 (Synapse, Memory, Dream)
      9: [{x: 200, y: 200}, {x: 600, y: 400}, {x: 400, y: 300}], // Lv 10 (Node1, Node2, Core)
  };

  // --- SVG DEFINITIONS ---
  const renderDefs = () => (
    <defs>
      {/* Soft Glow */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      {/* Intense Neon */}
      <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      {/* Metallic Gradient */}
      <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#889" />
        <stop offset="50%" stopColor="#ccd" />
        <stop offset="100%" stopColor="#667" />
      </linearGradient>
       {/* Dark Metal */}
      <linearGradient id="darkMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#445" />
        <stop offset="100%" stopColor="#223" />
      </linearGradient>
      {/* Glass */}
      <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
      </linearGradient>
      {/* Paper */}
      <filter id="paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
        <feDiffuseLighting in="noise" lightingColor="#fdf6e3" surfaceScale="2">
          <feDistantLight azimuth="45" elevation="60"/>
        </feDiffuseLighting>
      </filter>
      {/* Screen Scanlines */}
      <pattern id="scanlines" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="1" fill="#000" opacity="0.3"/>
      </pattern>
       {/* Hazard Stripe */}
       <pattern id="hazard" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
         <rect width="10" height="20" fill="#eab308"/>
         <rect x="10" width="10" height="20" fill="#111"/>
       </pattern>
    </defs>
  );

  // --- RENDERERS FOR EACH LEVEL ---
  
  // Level 1: Storage (Clues: Moss[0], Glitch[1], Box[2])
  const renderLevel1 = () => (
    <>
       <path d="M0 100 H800 M50 0 V600" stroke="#333" strokeWidth="40" />
       <g onClick={() => handleInteraction('lv1_trap')} className={interactClass}>
            <rect x="500" y="450" width="100" height="60" fill="#222" stroke="#555" strokeWidth="2" />
            {[0,1,2,3,4].map(i => <line key={i} x1={500+i*20} y1="450" x2={500+i*20} y2="510" stroke="#444" strokeWidth="3"/>)}
            <line x1="500" y1="480" x2="600" y2="480" stroke="#444" strokeWidth="3"/>
            <text x="550" y="535" textAnchor="middle" fill="#d44" fontSize="12" fontWeight="bold">DANGER</text>
       </g>
       <g 
          onClick={() => {
            handleInteraction('lv1_moss');
            setLocalState({ ...localState, mossHidden: true });
            setTimeout(() => setLocalState((prev: any) => ({ ...prev, mossHidden: false })), 3000);
          }} 
          className={`${interactClass} ${getEasyCueClass()}`}
          style={{ opacity: localState.mossHidden || isSolved('lv1_moss') ? 0.2 : 1 }}
        >
          <path d="M120 480 Q90 400 150 400 T210 450 T180 500 T120 480 Z" fill="#2a4" stroke="#4f4" strokeWidth="2" strokeDasharray="3,3" filter="url(#glow)" />
          <circle cx="140" cy="440" r="3" fill="#cfc" />
          <circle cx="170" cy="420" r="4" fill="#cfc" />
       </g>
       {isSolved('lv1_moss') && (
           <g filter="url(#glow)">
             <text x="150" y="450" textAnchor="middle" fill="#282" fontSize="12" fontWeight="bold">SEQ.I</text>
             <text x="150" y="475" textAnchor="middle" fill="#4f4" fontSize="32" fontWeight="bold" fontFamily="monospace" style={{textShadow: "0 0 10px #0f0"}}>{getRevealText('lv1_moss')}</text>
           </g>
       )}
        <g 
            onClick={() => handleInteraction('lv1_glitch')}
            className={`${interactClass} ${!isSolved('lv1_glitch') && getEasyCueClass()}`}
        >
            {isSolved('lv1_glitch') && <text x="700" y="70" textAnchor="middle" fill="#088" fontSize="12" fontWeight="bold">SEQ.II</text>}
            <text 
                x="700" y="100" 
                fill={isSolved('lv1_glitch') ? "#0ff" : "#4f8"}
                filter="url(#neon)"
                fontSize={isSolved('lv1_glitch') ? "40" : "24"}
                fontWeight="bold"
                className={!isSolved('lv1_glitch') ? "animate-pulse" : ""}
                textAnchor="middle"
            >
                {isSolved('lv1_glitch') ? getRevealText('lv1_glitch') : (difficulty === Difficulty.EASY ? `DATA?` : `#ERR`)}
            </text>
            {!isSolved('lv1_glitch') && <rect x="690" y="80" width="60" height="30" fill="none" stroke="#aff" strokeDasharray="4" opacity="0.8" />}
        </g>
        <g onClick={() => handleInteraction('lv1_box')} className={`${interactClass} ${!isSolved('lv1_box') && getEasyCueClass()}`}>
            <rect x="300" y="350" width="120" height="90" fill="url(#metal)" stroke="#99a" strokeWidth="3" rx="4" />
            <rect x="310" y="360" width="100" height="70" fill="none" stroke="#556" strokeWidth="1" strokeDasharray="5" />
            {isSolved('lv1_box') ? (
                <>
                    <path d="M300 350 L290 280 L410 280 L420 350 Z" fill="#667" stroke="#889" />
                    <rect x="310" y="360" width="100" height="70" fill="#222" opacity="0.6" />
                    <rect x="340" y="380" width="40" height="40" fill="#ffe" transform="rotate(-5 360 400)" />
                    <text x="360" y="395" textAnchor="middle" fill="#555" fontSize="8" transform="rotate(-5 360 400)">SEQ.III</text>
                    <text x="360" y="415" textAnchor="middle" fill="#000" fontSize="28" fontWeight="bold" fontFamily="serif" transform="rotate(-5 360 400)">{getRevealText('lv1_box')}</text>
                </>
            ) : (
                <>
                    <rect x="350" y="380" width="20" height="30" fill="#333" stroke="#000" />
                    <circle cx="360" cy="395" r="4" fill="#f44" filter="url(#glow)" />
                </>
            )}
            <text x="360" y="430" textAnchor="middle" fill="#334" fontSize="10" fontWeight="bold" style={{letterSpacing: "2px"}}>SECURE</text>
        </g>
    </>
  );

  // Level 2: Server Room (Clues: Rack[0], Cable[1], Console[2])
  const renderLevel2 = () => (
    <>
      <path d="M0 600 L800 600 L600 400 L200 400 Z" fill="url(#metal)" opacity="0.2" />
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${150 + i * 200}, 150)`}>
            <rect x="0" y="0" width="140" height="350" fill="#1a1a1a" stroke="#555" strokeWidth="3" />
            {[...Array(6)].map((_, k) => (
                <rect key={k} x="10" y={20 + k * 55} width="120" height="40" fill="#111" stroke="#333" />
            ))}
            {[...Array(8)].map((_, j) => (
                <circle 
                    key={j} cx={25} cy={35 + j * 40} r="5" 
                    fill={Math.random() > 0.5 ? "#4f4" : "#f44"} 
                    filter="url(#glow)"
                    opacity={(tick + j + i) % 5 === 0 ? 1 : 0.4}
                />
            ))}
        </g>
      ))}
      <rect 
        x="160" y="270" width="120" height="40" fill="transparent" stroke="#f44" strokeWidth="2" strokeDasharray="4"
        className="cursor-pointer hover:fill-red-900/30" 
        onClick={() => handleInteraction('lv2_rack_error')}
      />
      <text x="220" y="295" textAnchor="middle" fill="#f44" fontSize="10" opacity="0.8">ERROR</text>
      <g onClick={() => handleInteraction('lv2_rack_clue')} className={`${interactClass} ${!isSolved('lv2_rack_clue') && getEasyCueClass()}`}>
        <rect x="360" y="270" width="120" height="40" fill="#222" stroke="#4f4" strokeWidth={isSolved('lv2_rack_clue') ? 2 : 1} />
        <rect x="420" y="275" width="50" height="30" fill="#000" />
        {isSolved('lv2_rack_clue') && <text x="420" y="265" fill="#4f4" fontSize="10" fontFamily="monospace">NODE:01</text>}
        <text x="445" y="295" textAnchor="middle" fill="#4f4" fontSize={isSolved('lv2_rack_clue') ? "20" : "12"} fontFamily="monospace" filter="url(#glow)">
            {isSolved('lv2_rack_clue') ? getRevealText('lv2_rack_clue') : "chk_id"}
        </text>
      </g>
      <g onClick={() => handleInteraction('lv2_cable')} className={`${interactClass} ${!isSolved('lv2_cable') && getEasyCueClass()}`}>
        {/* Transparent Hit Box for thin cable */}
        <path d="M250 500 C 300 550, 500 600, 600 500" stroke="transparent" strokeWidth="40" fill="none" />
        
        <path d="M250 500 C 300 550, 500 600, 600 500" stroke="#333" strokeWidth="16" fill="none" />
        <path d="M250 500 C 300 550, 500 600, 600 500" stroke="#555" strokeWidth="12" fill="none" strokeDasharray="20,5" />
        <path d="M260 500 C 310 550, 510 600, 610 500" stroke="#777" strokeWidth="4" fill="none" />
        {isSolved('lv2_cable') && (
            <g transform="translate(420, 560) rotate(-10)">
                <rect x="-20" y="-15" width="40" height="30" fill="#eee" rx="2" />
                <text x="0" y="-5" textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">LINE:02</text>
                <text x="0" y="10" textAnchor="middle" fill="#000" fontSize="20" fontWeight="bold">{getRevealText('lv2_cable')}</text>
            </g>
        )}
      </g>
      <g onClick={() => handleInteraction('lv2_console')} className={`${interactClass} ${!isSolved('lv2_console') && getEasyCueClass()}`}>
        <path d="M580 300 L680 300 L700 380 L560 380 Z" fill="url(#darkMetal)" stroke="#668" strokeWidth="2" />
        <rect x="590" y="310" width="90" height="50" fill="#001" stroke="#445" />
        {isSolved('lv2_console') && <text x="635" y="325" textAnchor="middle" fill="#4af" fontSize="8" fontFamily="monospace">ADM:03</text>}
        <text x="635" y="345" textAnchor="middle" fill={isSolved('lv2_console') ? "#fff" : "#4af"} fontSize={isSolved('lv2_console') ? "32" : "12"} fontWeight="bold" fontFamily="monospace" filter="url(#glow)">
            {isSolved('lv2_console') ? getRevealText('lv2_console') : "LOGIN"}
        </text>
      </g>
    </>
  );

  // Level 3: Bio-Lab (Clues: Scope[0], Tank[1], Notes[2])
  const renderLevel3 = () => (
    <>
      <rect x="0" y="0" width="800" height="600" fill="#0a0a0a" />
      <rect x="50" y="450" width="700" height="20" fill="#333" />
      <g transform="translate(600, 350)" className={`${interactClass} ${!isSolved('lv3_scope') && getEasyCueClass()}`} onClick={() => handleInteraction('lv3_scope')}>
         {/* Transparent Hit Box for Microscope - Increases Clickable Area */}
         <rect x="-40" y="-20" width="120" height="140" fill="transparent" />
         
         <path d="M0 100 L20 0 L40 0 L60 100" fill="#444" stroke="#aaa" strokeWidth="2" />
         <path d="M20 10 L-20 30" stroke="#aaa" strokeWidth="6" strokeLinecap="round" />
         <circle cx="-25" cy="35" r="15" fill="#222" stroke="#fff" strokeWidth="2" />
         <circle cx="-25" cy="35" r="5" fill="#fff" opacity="0.3" />
         {isSolved('lv3_scope') && (
             <g transform="translate(30, -30)">
                 <circle cx="0" cy="0" r="25" fill="#fff" stroke="#aaa" strokeWidth="2" />
                 <text x="0" y="-12" textAnchor="middle" fill="#555" fontSize="8">CELL-A</text>
                 <text x="0" y="12" textAnchor="middle" fill="#000" fontSize="24" fontWeight="bold">{getRevealText('lv3_scope')}</text>
             </g>
         )}
      </g>
      <g onClick={() => handleInteraction('lv3_chart')} className="opacity-50 hover:opacity-100 transition-opacity">
        <rect x="250" y="100" width="300" height="150" fill="#112" stroke="#4f4" strokeWidth="2" />
        <text x="400" y="180" textAnchor="middle" fill="#4f4" fontSize="40" opacity="0.2">PERIODIC</text>
      </g>
      <g onClick={() => handleInteraction('lv3_tank')} className={`${interactClass} ${!isSolved('lv3_tank') && getEasyCueClass()}`}>
          <defs>
              <linearGradient id="liquid" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#4f4" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#4f4" stopOpacity="0.2"/>
              </linearGradient>
          </defs>
          <rect x="350" y="280" width="100" height="170" fill="url(#liquid)" stroke="#8f8" strokeWidth="2" rx="10" />
          <path d="M355 290 L365 290" stroke="#fff" strokeWidth="2" opacity="0.5" />
          <path d="M355 300 L360 300" stroke="#fff" strokeWidth="2" opacity="0.5" />
          <circle cx="400" cy="400" r="8" fill="#dfd" opacity="0.7">
             <animate attributeName="cy" values="400;300" dur="3s" repeatCount="indefinite" />
          </circle>
          {isSolved('lv3_tank') ? (
               <g>
                   <text x="400" y="350" textAnchor="middle" fill="#030" fontSize="10" fontWeight="bold">SPEC-B</text>
                   <text x="400" y="380" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="bold" filter="url(#glow)">{getRevealText('lv3_tank')}</text>
               </g>
          ) : (
               <text x="400" y="430" textAnchor="middle" fill="#050" fontSize="12" fontWeight="bold" className="bg-white px-2">SAMPLE</text>
          )}
      </g>
      <g onClick={() => handleInteraction('lv3_notes')} className={`${interactClass} ${!isSolved('lv3_notes') && getEasyCueClass()}`}>
        {isSolved('lv3_notes') ? (
            <>
                <rect x="440" y="380" width="80" height="90" fill="#fff" stroke="#ccc" transform="rotate(-5 480 425)" filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.5))" />
                <line x1="450" y1="400" x2="510" y2="400" stroke="#000" strokeWidth="1" transform="rotate(-5 480 425)" opacity="0.2"/>
                <text x="480" y="415" textAnchor="middle" fill="#555" fontSize="8" transform="rotate(-5 480 425)">PAGE-C</text>
                <text x="480" y="440" textAnchor="middle" fill="#d00" fontSize="36" fontWeight="bold" fontFamily="serif" transform="rotate(-5 480 425)">{getRevealText('lv3_notes')}</text>
            </>
        ) : (
            <>
                <rect x="450" y="400" width="70" height="50" fill="#eee" stroke="#999" transform="skewX(-10)" />
                <rect x="470" y="395" width="30" height="10" fill="#444" />
                <text x="485" y="430" textAnchor="middle" fill="#555" fontSize="10" fontWeight="bold">NOTES</text>
            </>
        )}
      </g>
    </>
  );

  // Level 4: Surveillance (Clues: Screen1[0], Screen2[1], File[2])
  const renderLevel4 = () => (
    <>
      <rect x="0" y="0" width="800" height="600" fill="#111" />
      <g onClick={() => handleInteraction('lv4_screen_trap')} className="cursor-pointer hover:brightness-125">
          <rect x="50" y="50" width="250" height="180" fill="#000" stroke="#555" strokeWidth="6" />
          <rect x="60" y="60" width="230" height="160" fill="url(#scanlines)" />
          <text x="175" y="140" textAnchor="middle" fill="#f44" fontSize="24" fontWeight="bold" opacity="0.8" filter="url(#glow)">NO SIGNAL</text>
      </g>
      <g onClick={() => handleInteraction('lv4_screen_1')} className={`${interactClass} ${!isSolved('lv4_screen_1') && getEasyCueClass()}`}>
          <rect x="500" y="50" width="250" height="180" fill="#000" stroke="#555" strokeWidth="6" />
          <rect x="510" y="60" width="230" height="160" fill="#051105" />
          <rect x="510" y="60" width="230" height="160" fill="url(#scanlines)" opacity="0.3" />
          {isSolved('lv4_screen_1') ? (
               <g>
                 <text x="540" y="80" fill="#4f4" fontSize="12" fontFamily="monospace">CAM-01</text>
                 <text x="625" y="150" textAnchor="middle" fill="#4f4" fontSize="50" fontWeight="bold" fontFamily="monospace" filter="url(#neon)">{getRevealText('lv4_screen_1')}</text>
               </g>
          ) : (
               <>
                 <text x="525" y="80" fill="#4f4" fontSize="12" fontFamily="monospace">CAM-01</text>
                 <text x="700" y="80" fill="#f44" fontSize="12" fontFamily="monospace">●REC</text>
                 <rect x="550" y="100" width="40" height="60" fill="#121" stroke="#262" />
                 <rect x="660" y="120" width="40" height="60" fill="#121" stroke="#262" />
               </>
          )}
      </g>
      <g onClick={() => handleInteraction('lv4_screen_2')} className={`${interactClass} ${!isSolved('lv4_screen_2') && getEasyCueClass()}`}>
          <rect x="500" y="300" width="250" height="180" fill="#000" stroke="#555" strokeWidth="6" />
          <rect x="510" y="310" width="230" height="160" fill="#001" />
          <line x1="510" y1="390" x2="740" y2="390" stroke="#4f4" strokeWidth="2" opacity="0.3" />
          <line x1="625" y1="310" x2="625" y2="470" stroke="#4f4" strokeWidth="2" opacity="0.3" />
          {isSolved('lv4_screen_2') ? (
              <g>
                <text x="540" y="330" fill="#4f4" fontSize="12" fontFamily="monospace">CAM-02</text>
                <text x="625" y="410" textAnchor="middle" fill="#fff" fontSize="50" fontWeight="bold" fontFamily="monospace" filter="url(#glow)">{getRevealText('lv4_screen_2')}</text>
              </g>
          ) : (
              <g>
                <text x="540" y="330" fill="#4f4" fontSize="12" fontFamily="monospace">CAM-02</text>
                <path d="M580 370 L670 410 M670 370 L580 410" stroke="#4f4" strokeWidth="3" opacity="0.6" />
              </g>
          )}
      </g>
      <g onClick={() => handleInteraction('lv4_file')} className={`${interactClass} hover:-translate-y-1 ${!isSolved('lv4_file') && getEasyCueClass()}`}>
         {isSolved('lv4_file') ? (
             <g transform="translate(150, 400)">
                 <rect x="0" y="0" width="140" height="100" fill="#fdf6e3" stroke="#dcb" shadow="true" filter="drop-shadow(4px 4px 4px rgba(0,0,0,0.5))" />
                 <text x="70" y="30" textAnchor="middle" fill="#555" fontSize="10">DOC-03</text>
                 <text x="70" y="65" textAnchor="middle" fill="#d00" fontSize="40" fontWeight="bold" fontFamily="serif" transform="rotate(-10 70 50)">{getRevealText('lv4_file')}</text>
                 <text x="70" y="90" textAnchor="middle" fill="#000" fontSize="10">CONFIDENTIAL</text>
             </g>
         ) : (
             <g transform="translate(150, 400)">
                <path d="M0 20 L140 20 L140 100 L0 100 Z" fill="#eab308" />
                <path d="M0 35 L60 35 L80 45 L140 45 L140 100 L0 100 Z" fill="#facc15" />
                <text x="70" y="80" textAnchor="middle" fill="#713f12" fontSize="14" fontWeight="bold">TOP SECRET</text>
             </g>
         )}
      </g>
    </>
  );

  // Level 5: Cooling System (Clues: Fan[0], Pipe[1], Valve[2])
  const renderLevel5 = () => (
    <>
       <path d="M0 150 H800 M0 450 H800 M200 0 V600 M600 0 V600" stroke="#444" strokeWidth="30" fill="none" />
       <path d="M0 150 H800 M0 450 H800" stroke="#555" strokeWidth="10" fill="none" />
       <g transform="translate(400, 300)" onClick={() => handleInteraction('lv5_fan')} className={`${interactClass} ${!isSolved('lv5_fan') && getEasyCueClass()}`}>
          <circle cx="0" cy="0" r="140" fill="#222" stroke="#666" strokeWidth="8" />
          <circle cx="0" cy="0" r="130" fill="#111" />
          {isSolved('lv5_fan') ? (
              <g>
                 <path d="M0 0 L0 -110 Q35 -130 60 -110 L20 -20 Z" fill="#777" stroke="#999" strokeWidth="2" />
                 <text x="50" y="-80" textAnchor="middle" fill="#aaa" fontSize="12" transform="rotate(15)">SYS-1</text>
                 <text x="30" y="-50" textAnchor="middle" fill="#0ff" fontSize="36" fontWeight="bold" fontFamily="monospace" filter="url(#glow)" transform="rotate(15)">{getRevealText('lv5_fan')}</text>
                 <path d="M0 0 L110 0 Q130 35 110 60 L20 20 Z" fill="#555" />
                 <path d="M0 0 L0 110 Q-35 130 -60 110 L-20 20 Z" fill="#555" />
                 <path d="M0 0 L-110 0 Q-130 -35 -110 -60 L-20 -20 Z" fill="#555" />
              </g>
          ) : (
              <g className="animate-spin" style={{ animationDuration: '0.2s' }}>
                <path d="M0 0 L0 -120 L40 -120 L10 -10 Z" fill="#888" />
                <path d="M0 0 L120 0 L120 40 L10 10 Z" fill="#888" />
                <path d="M0 0 L0 120 L-40 120 L-10 10 Z" fill="#888" />
                <path d="M0 0 L-120 0 L-120 -40 L-10 -10 Z" fill="#888" />
              </g>
          )}
          <circle cx="0" cy="0" r="20" fill="url(#metal)" stroke="#aaa" strokeWidth="2" />
       </g>
       <g transform="translate(150, 200)" onClick={() => handleInteraction('lv5_pipe')} className={`${interactClass} ${!isSolved('lv5_pipe') && getEasyCueClass()}`}>
           <circle cx="0" cy="0" r="60" fill="#ccc" stroke="#888" strokeWidth="6" />
           <circle cx="0" cy="0" r="50" fill="#fff" />
           {[...Array(8)].map((_, i) => <line key={i} x1="0" y1="-40" x2="0" y2="-50" stroke="#000" strokeWidth="2" transform={`rotate(${i * 45})`} />)}
           <line x1="0" y1="0" x2="0" y2="-45" stroke="#d00" strokeWidth="3" transform={`rotate(${isSolved('lv5_pipe') ? 45 : -45})`} className="transition-transform duration-1000" />
           <circle cx="0" cy="0" r="5" fill="#333" />
           {isSolved('lv5_pipe') && (
               <>
                 <text x="0" y="-20" textAnchor="middle" fill="#555" fontSize="8" fontWeight="bold">SYS-2</text>
                 <text x="0" y="30" textAnchor="middle" fill="#000" fontSize="28" fontWeight="bold" fontFamily="monospace">{getRevealText('lv5_pipe')}</text>
               </>
           )}
       </g>
       <g transform="translate(650, 450)" onClick={() => handleInteraction('lv5_valve')} className={`${interactClass} ${!isSolved('lv5_valve') && getEasyCueClass()}`}>
           <circle cx="0" cy="0" r="50" fill="none" stroke="#d44" strokeWidth="10" className="animate-spin" style={{ animationDuration: '8s' }} />
           <line x1="-50" y1="0" x2="50" y2="0" stroke="#d44" strokeWidth="10" className="animate-spin" style={{ animationDuration: '8s' }} />
           <line x1="0" y1="-50" x2="0" y2="50" stroke="#d44" strokeWidth="10" className="animate-spin" style={{ animationDuration: '8s' }} />
           {isSolved('lv5_valve') ? (
               <g>
                 <text x="0" y="-20" textAnchor="middle" fill="#aaa" fontSize="8" fontWeight="bold">SYS-3</text>
                 <text x="0" y="20" textAnchor="middle" fill="#fff" fontSize="36" fontWeight="bold" filter="url(#glow)">{getRevealText('lv5_valve')}</text>
               </g>
           ) : (
               <circle cx="0" cy="0" r="15" fill="#822" />
           )}
       </g>
       <rect x="300" y="550" width="200" height="30" fill="url(#metal)" stroke="#0ff" className={`${interactClass} hover:stroke-white`} onClick={() => handleInteraction('lv5_trap')} />
       <text x="400" y="570" textAnchor="middle" fill="#0ff" fontSize="12" fontWeight="bold" letterSpacing="1">CAUTION: LN2</text>
    </>
  );

  // Level 6: Archive (Clues: Tape[0], Terminal[1], Book[2])
  const renderLevel6 = () => (
    <>
       <rect x="0" y="0" width="800" height="600" fill="#151005" />
       {[0, 1, 2, 3].map(i => (
         <g key={i} transform={`translate(${60 + i * 180}, 100)`}>
            <rect x="0" y="0" width="120" height="400" fill="#3b2515" stroke="#6d4c30" strokeWidth="4" />
            <line x1="10" y1="100" x2="110" y2="100" stroke="#6d4c30" strokeWidth="4"/>
            <line x1="10" y1="200" x2="110" y2="200" stroke="#6d4c30" strokeWidth="4"/>
            <line x1="10" y1="300" x2="110" y2="300" stroke="#6d4c30" strokeWidth="4"/>
         </g>
       ))}
       <g transform="translate(120, 250)" className={`${interactClass} ${!isSolved('lv6_tape') && getEasyCueClass()}`} onClick={() => handleInteraction('lv6_tape')}>
          <circle cx="0" cy="0" r="40" fill="#222" stroke="#f80" strokeWidth="3" />
          <circle cx="0" cy="0" r="15" fill="none" stroke="#f80" strokeWidth="20" strokeDasharray="12 6" className="animate-spin" style={{ animationDuration: '3s' }} />
          {isSolved('lv6_tape') && (
              <g>
                 <text x="0" y="-15" textAnchor="middle" fill="#b62" fontSize="8" fontWeight="bold">VOL.1</text>
                 <text x="0" y="10" textAnchor="middle" fill="#f80" fontSize="24" fontWeight="bold" fontFamily="monospace" filter="url(#glow)">{getRevealText('lv6_tape')}</text>
              </g>
          )}
       </g>
       <g onClick={() => handleInteraction('lv6_terminal')} className={`${interactClass} ${!isSolved('lv6_terminal') && getEasyCueClass()}`}>
            <rect x="600" y="320" width="160" height="120" fill="#221" stroke="#f80" strokeWidth="3" rx="8" />
            <rect x="610" y="330" width="140" height="100" fill="#100" />
            {isSolved('lv6_terminal') && <text x="680" y="350" textAnchor="middle" fill="#b62" fontSize="8">ACC.2</text>}
            <text x="680" y="390" textAnchor="middle" fill="#f80" fontSize={isSolved('lv6_terminal') ? "40" : "24"} fontFamily="monospace" filter="url(#glow)">
                {isSolved('lv6_terminal') ? getRevealText('lv6_terminal') : ">_LOGIN"}
            </text>
       </g>
       <g onClick={() => handleInteraction('lv6_book')} className={`${interactClass} hover:-translate-y-1 ${!isSolved('lv6_book') && getEasyCueClass()}`}>
           <path d="M420 450 L470 460 L470 520 L420 510 Z" fill="#632" stroke="#854" strokeWidth="2" />
           <path d="M420 450 L425 451" stroke="#fff" strokeWidth="4" />
           {isSolved('lv6_book') && (
               <g transform="rotate(10 445 490)">
                   <rect x="425" y="460" width="40" height="50" fill="#fff" />
                   <text x="445" y="475" textAnchor="middle" fill="#555" fontSize="8">CH.3</text>
                   <text x="445" y="500" textAnchor="middle" fill="#000" fontSize="24" fontFamily="serif" fontWeight="bold">{getRevealText('lv6_book')}</text>
               </g>
           )}
       </g>
       <g transform="translate(300, 80)" onClick={() => handleInteraction('lv6_trap')} className="cursor-pointer hover:scale-105 transition-transform active:scale-95">
           <circle cx="0" cy="0" r="20" fill="#822" stroke="#a44" strokeWidth="2" />
           <circle cx="0" cy="0" r="10" fill="red" className="animate-ping" />
           <text x="0" y="40" textAnchor="middle" fill="#d44" fontSize="10">SECURITY</text>
       </g>
    </>
  );

  // Level 7: Firewall (Clues: Laser[0], Shield[1], Packet[2])
  const renderLevel7 = () => (
    <>
       <rect width="800" height="600" fill="#050000" />
       <path d="M0 400 L800 400 M0 450 L800 450 M0 500 L800 500 M0 550 L800 550" stroke="#500" strokeWidth="1" />
       <path d="M200 400 L0 600 M600 400 L800 600 M400 400 L400 600" stroke="#500" strokeWidth="1" />
       <line x1="0" y1="150" x2="800" y2="150" stroke="#f00" strokeWidth="4" filter="url(#neon)">
         <animate attributeName="y1" values="100;500;100" dur="4s" repeatCount="indefinite" />
         <animate attributeName="y2" values="100;500;100" dur="4s" repeatCount="indefinite" />
       </line>
       <g onClick={() => handleInteraction('lv7_shield')} className={`${interactClass} ${!isSolved('lv7_shield') && getEasyCueClass()}`}>
          <path d="M400 200 L460 280 L400 360 L340 280 Z" fill="#400" stroke="#f44" strokeWidth="4" filter="url(#neon)" />
          {isSolved('lv7_shield') && (
            <g>
                <text x="400" y="260" textAnchor="middle" fill="#f88" fontSize="10" fontFamily="monospace">LAYER-2</text>
                <text x="400" y="295" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="bold" fontFamily="monospace">{getRevealText('lv7_shield')}</text>
            </g>
          )}
       </g>
       <g transform="translate(150, 400)" onClick={() => handleInteraction('lv7_packet')} className={`${interactClass} ${!isSolved('lv7_packet') && getEasyCueClass()}`}>
           <rect x="-30" y="-30" width="60" height="60" fill="none" stroke={isSolved('lv7_packet') ? "#0f0" : "#f00"} strokeWidth="4" className="animate-spin" style={{ animationDuration: '4s' }} filter="url(#neon)" />
           <rect x="-15" y="-15" width="30" height="30" fill={isSolved('lv7_packet') ? "#0f0" : "#500"} />
           {isSolved('lv7_packet') && (
            <g>
                <text x="0" y="-35" textAnchor="middle" fill="#0f0" fontSize="10">LAYER-3</text>
                <text x="0" y="10" textAnchor="middle" fill="#000" fontSize="20" fontWeight="bold">{getRevealText('lv7_packet')}</text>
            </g>
           )}
       </g>
       <g transform="translate(650, 450)" onClick={() => handleInteraction('lv7_laser')} className={`${interactClass} ${!isSolved('lv7_laser') && getEasyCueClass()}`}>
           <rect x="-50" y="-70" width="100" height="140" fill="#200" stroke="#f44" strokeWidth="3" />
           {isSolved('lv7_laser') ? (
                <g>
                    <text x="0" y="-50" textAnchor="middle" fill="#f88" fontSize="10" fontFamily="monospace">LAYER-1</text>
                    <text x="0" y="10" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="bold" filter="url(#glow)">{getRevealText('lv7_laser')}</text>
                </g>
           ) : (
                <path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#f44" strokeWidth="6" />
           )}
       </g>
    </>
  );

  // Level 8: Quarantine (Clues: Hazmat[0], Sample[1], Vent[2])
  const renderLevel8 = () => (
    <>
       <rect x="0" y="0" width="800" height="600" fill="#111" />
       <rect x="0" y="50" width="800" height="40" fill="url(#hazard)" />
       <rect x="0" y="550" width="800" height="40" fill="url(#hazard)" />
       <circle cx="400" cy="300" r="150" fill="#0f0" opacity="0.15" filter="url(#glow)">
          <animate attributeName="r" values="150;160;150" dur="4s" repeatCount="indefinite" />
       </circle>
       <g transform="translate(600, 250)" onClick={() => handleInteraction('lv8_hazmat')} className={`${interactClass} ${!isSolved('lv8_hazmat') && getEasyCueClass()}`}>
            <path d="M0 -35 A 35 35 0 0 1 0 35 A 35 35 0 0 1 0 -35" fill="#444" stroke="#ff0" strokeWidth="4" />
            <path d="M-45 35 L45 35 L55 160 L-55 160 Z" fill="#333" stroke="#555" strokeWidth="2" />
            <rect x="-20" y="60" width="40" height="20" fill="#ff0" />
            {isSolved('lv8_hazmat') && (
                <g>
                    <text x="0" y="-5" textAnchor="middle" fill="#ff0" fontSize="8" fontWeight="bold">NO.1</text>
                    <text x="0" y="75" textAnchor="middle" fill="#000" fontSize="18" fontWeight="bold">{getRevealText('lv8_hazmat')}</text>
                </g>
            )}
       </g>
       <g transform="translate(120, 180)" onClick={() => handleInteraction('lv8_vent')} className={`${interactClass} ${!isSolved('lv8_vent') && getEasyCueClass()}`}>
            {isSolved('lv8_vent') ? (
                <>
                    <rect x="0" y="0" width="140" height="100" fill="#000" stroke="#888" strokeWidth="4" />
                    <text x="70" y="30" textAnchor="middle" fill="#555" fontSize="10" fontWeight="bold">NO.3</text>
                    <text x="70" y="70" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="bold" filter="url(#glow)">{getRevealText('lv8_vent')}</text>
                </>
            ) : (
                <g>
                    <rect x="0" y="0" width="140" height="100" fill="url(#metal)" stroke="#888" strokeWidth="4" />
                    {[1,2,3,4,5,6].map(i => <line key={i} x1={i*20} y1="5" x2={i*20} y2="95" stroke="#555" strokeWidth="4" />)}
                </g>
            )}
       </g>
       <g transform="translate(400, 350)" onClick={() => handleInteraction('lv8_sample')} className={`${interactClass} ${!isSolved('lv8_sample') && getEasyCueClass()}`}>
            <path d="M-20 0 L20 0 L20 80 A 20 20 0 0 1 -20 80 Z" fill="#020" stroke="#0f0" strokeWidth="2" />
            <rect x="-20" y="15" width="40" height="50" fill="#0f0" opacity="0.8" filter="url(#glow)" />
            {isSolved('lv8_sample') && (
                <g>
                   <text x="0" y="0" textAnchor="middle" fill="#0f0" fontSize="8" fontWeight="bold">NO.2</text>
                   <text x="0" y="45" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="bold">{getRevealText('lv8_sample')}</text>
                </g>
            )}
       </g>
    </>
  );

  // Level 9: Neural Link (Clues: Synapse[0], Memory[1], Dream[2])
  const renderLevel9 = () => (
    <>
       <rect x="0" y="0" width="800" height="600" fill="#0a000a" />
       <path d="M200 200 L600 400 M200 200 L300 500 M600 400 L500 100" stroke="#e0f" strokeWidth="3" opacity="0.6">
          <animate attributeName="stroke-dasharray" values="10,10;20,20" dur="2s" repeatCount="indefinite" />
       </path>
       <g transform="translate(200, 200)" onClick={() => handleInteraction('lv9_synapse')} className={`${interactClass} ${!isSolved('lv9_synapse') && getEasyCueClass()}`}>
          <circle cx="0" cy="0" r="50" fill="#304" stroke="#d0f" strokeWidth="3" />
          <circle cx="0" cy="0" r="40" fill="#609" filter="url(#neon)" opacity="0.8">
             <animate attributeName="r" values="30;45;30" dur="2s" repeatCount="indefinite" />
          </circle>
          {isSolved('lv9_synapse') && (
            <g>
                <text x="0" y="-15" textAnchor="middle" fill="#e0f" fontSize="14" fontWeight="bold">α</text>
                <text x="0" y="15" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="bold">{getRevealText('lv9_synapse')}</text>
            </g>
          )}
       </g>
       <g transform="translate(600, 400)" onClick={() => handleInteraction('lv9_memory')} className={`${interactClass} ${!isSolved('lv9_memory') && getEasyCueClass()}`}>
          <rect x="-35" y="-35" width="70" height="70" fill="none" stroke="#f0f" strokeWidth="3" className="animate-spin" style={{ animationDuration: '6s' }} filter="url(#neon)" />
          <rect x="-25" y="-25" width="50" height="50" fill="#a0a" opacity="0.6" />
          {isSolved('lv9_memory') && (
            <g>
                <text x="0" y="-10" textAnchor="middle" fill="#f0f" fontSize="14" fontWeight="bold">β</text>
                <text x="0" y="15" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold">{getRevealText('lv9_memory')}</text>
            </g>
          )}
       </g>
       <g transform="translate(500, 120)" onClick={() => handleInteraction('lv9_dream')} className={`${interactClass} ${!isSolved('lv9_dream') && getEasyCueClass()}`}>
          <path d="M0 -50 L45 30 L-45 30 Z" fill="#202" stroke="#f0f" strokeWidth="3" filter="url(#neon)" />
          {isSolved('lv9_dream') ? (
              <g>
                  <text x="0" y="-10" textAnchor="middle" fill="#f0f" fontSize="14" fontWeight="bold">γ</text>
                  <text x="0" y="20" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="bold">{getRevealText('lv9_dream')}</text>
              </g>
          ) : (
              <circle cx="0" cy="-5" r="8" fill="#fff" opacity="0.8" className="animate-ping" />
          )}
       </g>
    </>
  );

  // Level 10: The Core (Clues: Node1[0], Node2[1], Core[2])
  const renderLevel10 = () => (
    <>
      <rect x="0" y="0" width="800" height="600" fill="#000" />
      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="30%" stopColor="#0f0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="300" r="280" fill="none" stroke="#050" strokeWidth="2" />
      <circle cx="400" cy="300" r="240" fill="none" stroke="#080" strokeWidth="3" strokeDasharray="30,15" className="animate-spin" style={{ animationDuration: '20s' }} />
      <g transform="translate(400, 300)" onClick={() => handleInteraction('lv10_core')} className={interactClass}>
         <circle cx="0" cy="0" r="90" fill="url(#coreGrad)" filter="url(#neon)" />
         <circle cx="0" cy="0" r="100" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6">
             <animate attributeName="r" values="95;105;95" dur="1s" repeatCount="indefinite" />
         </circle>
         {isSolved('lv10_core') && (
            <g>
                <text x="0" y="-30" textAnchor="middle" fill="#050" fontSize="16" fontWeight="bold">KEY_Z</text>
                <text x="0" y="15" textAnchor="middle" fill="#000" fontSize="50" fontWeight="bold">{getRevealText('lv10_core')}</text>
            </g>
         )}
      </g>
      <g transform="translate(200, 200)" onClick={() => handleInteraction('lv10_node_1')} className={`${interactClass} ${!isSolved('lv10_node_1') && getEasyCueClass()}`}>
         <circle cx="0" cy="0" r="30" fill="#000" stroke="#0f0" strokeWidth="3" />
         <line x1="0" y1="0" x2="200" y2="100" stroke="#0f0" strokeWidth="2" opacity="0.4" />
         {isSolved('lv10_node_1') && (
            <g>
                <text x="0" y="-15" textAnchor="middle" fill="#050" fontSize="10" fontWeight="bold">KEY_X</text>
                <text x="0" y="8" textAnchor="middle" fill="#0f0" fontSize="24" fontWeight="bold" filter="url(#glow)">{getRevealText('lv10_node_1')}</text>
            </g>
         )}
      </g>
      <g transform="translate(600, 400)" onClick={() => handleInteraction('lv10_node_2')} className={`${interactClass} ${!isSolved('lv10_node_2') && getEasyCueClass()}`}>
         <circle cx="0" cy="0" r="30" fill="#000" stroke="#0f0" strokeWidth="3" />
         <line x1="0" y1="0" x2="-200" y2="-100" stroke="#0f0" strokeWidth="2" opacity="0.4" />
         {isSolved('lv10_node_2') && (
            <g>
                <text x="0" y="-15" textAnchor="middle" fill="#050" fontSize="10" fontWeight="bold">KEY_Y</text>
                <text x="0" y="8" textAnchor="middle" fill="#0f0" fontSize="24" fontWeight="bold" filter="url(#glow)">{getRevealText('lv10_node_2')}</text>
            </g>
         )}
      </g>
    </>
  );

  // Door/Exit Location (Approximated for line drawing target)
  const exitX = 400;
  const exitY = 550;

  return (
    <div className="relative w-full h-full bg-black border-2 border-green-800 rounded-lg overflow-hidden select-none shadow-[0_0_30px_rgba(0,255,0,0.15)]">
      {/* Global SVG Container */}
      <svg 
         viewBox="0 0 800 600" 
         className={`w-full h-full absolute inset-0 bg-[#080808] transition-all duration-300 ${inspectingItem ? 'blur-sm brightness-50' : ''}`}
      >
        {renderDefs()}
        
        {/* Render Level Specific Content */}
        {levelIndex === 0 && renderLevel1()}
        {levelIndex === 1 && renderLevel2()}
        {levelIndex === 2 && renderLevel3()}
        {levelIndex === 3 && renderLevel4()}
        {levelIndex === 4 && renderLevel5()}
        {levelIndex === 5 && renderLevel6()}
        {levelIndex === 6 && renderLevel7()}
        {levelIndex === 7 && renderLevel8()}
        {levelIndex === 8 && renderLevel9()}
        {levelIndex === 9 && renderLevel10()}

        {/* Visual Proof: Red Lines connecting Clues to Exit when Unlocked */}
        {unlocked && cluePositions[levelIndex]?.map((pos, i) => (
             <line 
                key={`proof-line-${i}`}
                x1={pos.x} y1={pos.y}
                x2={exitX} y2={exitY}
                stroke="red" strokeWidth="2"
                strokeDasharray="10 5"
                opacity="0.6"
                className="animate-pulse"
             />
        ))}

        {/* Global Door (Exit) - Styled as a Holographic Panel */}
        {levelIndex < 9 && (
          <g 
             onClick={() => handleInteraction('door')}
             className={`transition-all duration-500 ${unlocked ? 'cursor-pointer opacity-100 hover:scale-[1.05]' : 'opacity-40 pointer-events-none'}`}
          >
             <rect x="350" y="520" width="100" height="60" fill="#222" stroke="#555" strokeWidth="2" />
             <rect x="360" y="530" width="80" height="40" fill="#000" stroke={unlocked ? "#0f0" : "#500"} strokeWidth="2" />
             <text x="400" y="555" textAnchor="middle" fill={unlocked ? "#0f0" : "#555"} fontSize="16" fontFamily="monospace" fontWeight="bold" filter={unlocked ? "url(#neon)" : ""}>
                 {unlocked ? "EXIT_OPEN" : "LOCKED"}
             </text>
             {unlocked && <rect x="360" y="530" width="80" height="40" fill="#0f0" opacity="0.2" className="animate-pulse" />}
          </g>
        )}
        
        {/* Level 10 Final Trigger */}
        {levelIndex === 9 && (
            <text 
                x="400" y="550" textAnchor="middle" 
                fill={unlocked ? "#fff" : "transparent"} 
                fontSize="48" 
                fontWeight="bold"
                filter="url(#neon)"
                className="cursor-pointer animate-bounce hover:fill-green-300"
                onClick={() => handleInteraction('door')}
            >
                INITIATE PURGE
            </text>
        )}

      </svg>
      
      {/* CRT Scanline Overlay & Vignette (Subtle) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
      
      {/* Visual Quiz Modal Overlay */}
      {inspectingItem && (
         <div className="absolute inset-0 z-40 flex items-center justify-center p-4 animate-fade-in bg-black/40 backdrop-blur-sm">
             <div className="bg-black/80 border-2 border-green-500 p-6 rounded-lg max-w-md w-full shadow-[0_0_20px_rgba(0,255,0,0.2)] text-green-400 font-mono relative">
                 <button 
                    onClick={onCloseModal}
                    className="absolute top-2 right-2 text-green-700 hover:text-green-300 font-bold"
                 >
                    X
                 </button>
                 
                 <div className="flex items-center gap-2 mb-4 border-b border-green-800 pb-2">
                     <span className="text-xl font-bold animate-pulse">🔒 SECURITY ACCESS</span>
                 </div>
                 
                 <p className="text-sm text-green-600 mb-2">TARGET: {inspectingItem.name}</p>
                 <p className="text-lg text-white mb-6 leading-relaxed">
                    {inspectingItem.quiz.question}
                 </p>
                 
                 <form onSubmit={handleModalSubmit} className="flex flex-col gap-3">
                     <input 
                        ref={quizInputRef}
                        type="text" 
                        value={quizInput}
                        onChange={(e) => setQuizInput(e.target.value)}
                        placeholder={inspectingItem.quiz.placeholder || "정답을 입력하세요..."}
                        className="bg-green-900/20 border border-green-600 rounded px-4 py-3 text-white outline-none focus:border-green-400 focus:shadow-[0_0_10px_green] transition-all"
                     />
                     <button 
                        type="submit" 
                        className="bg-green-700 hover:bg-green-600 text-black font-bold py-2 rounded transition-colors"
                     >
                        UNLOCK
                     </button>
                 </form>
             </div>
         </div>
      )}

      {/* UI Overlay: Level Indicator */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></div>
         <div className="text-green-400 font-mono text-sm bg-black/80 px-3 py-1 rounded border border-green-800 shadow-lg backdrop-blur-sm">
            PROTOCOL_LV: {String(levelIndex + 1).padStart(2, '0')}
         </div>
      </div>
    </div>
  );
};

export default Room;
