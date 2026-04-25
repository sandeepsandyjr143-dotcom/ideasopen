import { useRef, useEffect } from 'react';

export default function CategoryTabs({ categories, activeCategory, onCategoryChange, variant = 'business' }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeTab = activeRef.current;
      const scrollLeft = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const baseStyles = variant === 'futurefeed'
    ? 'bg-secondary text-white'
    : 'bg-primary text-white';
  
  const inactiveStyles = variant === 'futurefeed'
    ? 'bg-secondary/10 text-secondary hover:bg-secondary/20'
    : 'bg-primary/10 text-primary hover:bg-primary/20';

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4 -mx-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((category) => (
        <button
          key={category}
          ref={activeCategory === category ? activeRef : null}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all min-h-[40px] ${
            activeCategory === category ? baseStyles : inactiveStyles
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
