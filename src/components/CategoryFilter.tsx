import React from 'react';
import { AppCategory } from '../types';
import { useSound } from '../../hooks/useSound';

interface CategoryFilterProps {
  currentCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
}

// Hick's Law: Grouping options simplifies decision making.
// We use a horizontal scrollable list for mobile friendliness.

const CategoryFilter: React.FC<CategoryFilterProps> = ({ currentCategory, onSelectCategory }) => {
  const { playClick } = useSound();
  const categories = Object.values(AppCategory);

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => {
            playClick();
            onSelectCategory(cat);
          }}
          className={`
            px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border
            ${currentCategory === cat 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30 shadow-lg scale-105' 
              : 'bg-white/10 text-gray-600 dark:text-gray-300 border-white/20 hover:bg-white/20 hover:border-white/40'}
            backdrop-blur-sm
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;