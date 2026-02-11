import React, { useRef, useEffect } from 'react';

interface InputBoxesProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isError: boolean;
  isDarkMode: boolean;
}

export const InputBoxes: React.FC<InputBoxesProps> = ({ length, value, onChange, onSubmit, isError, isDarkMode }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit input to the answer length
    const newVal = e.target.value.slice(0, length);
    onChange(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    const handleFocus = () => inputRef.current?.focus();
    handleFocus();
  }, [length]);

  return (
    <div className="relative flex flex-col items-center justify-center my-4 w-full max-w-3xl" onClick={handleClick}>
      {/* Visual Boxes */}
      <div className={`flex gap-2 sm:gap-4 flex-wrap justify-center px-4 ${isError ? 'animate-shake' : ''}`}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i] || '';
          const isFilled = !!char;
          
          // Style Logic for Monochrome Theme
          let boxStyle = "";
          
          if (isFilled) {
            // Invert colors for filled boxes
            boxStyle = isDarkMode 
              ? "bg-white text-black border-white" 
              : "bg-black text-white border-black";
          } else {
            // Outline for empty boxes
            boxStyle = "border-gray-500 text-transparent";
          }

          // Error State: just ensure border is visible/different if needed, but keeping it simple B/W often means shaking is enough.
          // Or we can make it blink or thicker border. 
          // User requested ONLY B/W. Let's stick to shake. 
          // If error, maybe make border thicker.
          if (isError) {
             // In B/W, error color is harder. We rely on animation.
             // Maybe dashed border?
             boxStyle += " border-dashed"; 
          }

          return (
            <div
              key={i}
              className={`
                w-10 h-10 sm:w-14 sm:h-14 
                border-2 sm:border-4 
                flex items-center justify-center 
                text-xl sm:text-3xl font-bold
                transition-all duration-200
                mb-2
                ${boxStyle}
              `}
            >
              {char}
            </div>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute top-0 left-0 w-full h-full cursor-text"
        autoComplete="off"
        autoFocus
      />
      
      <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        {value.length} / {length} 글자
      </p>
    </div>
  );
};