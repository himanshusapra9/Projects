'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface FilterGroup {
  id: string;
  label: string;
  type: 'range' | 'select' | 'multi_select';
  options?: { value: string; label: string; count?: number }[];
  range?: { min: number; max: number; unit: string };
}

function getFiltersForQuery(query: string): FilterGroup[] {
  const q = query.toLowerCase();

  const baseFilters: FilterGroup[] = [
    {
      id: 'rating', label: 'Minimum rating', type: 'select',
      options: [
        { value: '4.5', label: '4.5+ stars' },
        { value: '4.0', label: '4.0+ stars' },
        { value: '3.5', label: '3.5+ stars' },
      ],
    },
    {
      id: 'return_risk', label: 'Return risk', type: 'select',
      options: [
        { value: 'low', label: 'Low only' },
        { value: 'low_moderate', label: 'Low or moderate' },
      ],
    },
  ];

  if (q.includes('headphone') || q.includes('earbud') || q.includes('airpod') || q.includes('audio')) {
    return [
      { id: 'price', label: 'Price range', type: 'range', range: { min: 0, max: 500, unit: '$' } },
      { id: 'brand', label: 'Brand', type: 'multi_select', options: [
        { value: 'sony', label: 'Sony' }, { value: 'bose', label: 'Bose' },
        { value: 'apple', label: 'Apple' }, { value: 'jbl', label: 'JBL' },
      ]},
      { id: 'style', label: 'Style', type: 'select', options: [
        { value: 'over-ear', label: 'Over-ear' }, { value: 'in-ear', label: 'In-ear' }, { value: 'on-ear', label: 'On-ear' },
      ]},
      ...baseFilters,
    ];
  }

  if (q.includes('phone') || q.includes('smartphone') || q.includes('iphone') || q.includes('galaxy')) {
    return [
      { id: 'price', label: 'Price range', type: 'range', range: { min: 0, max: 2000, unit: '$' } },
      { id: 'brand', label: 'Brand', type: 'multi_select', options: [
        { value: 'apple', label: 'Apple' }, { value: 'samsung', label: 'Samsung' },
        { value: 'google', label: 'Google' }, { value: 'oneplus', label: 'OnePlus' },
      ]},
      { id: 'storage', label: 'Storage', type: 'select', options: [
        { value: '128', label: '128GB+' }, { value: '256', label: '256GB+' }, { value: '512', label: '512GB+' },
      ]},
      ...baseFilters,
    ];
  }

  if (q.includes('laptop') || q.includes('macbook') || q.includes('notebook')) {
    return [
      { id: 'price', label: 'Price range', type: 'range', range: { min: 0, max: 3000, unit: '$' } },
      { id: 'brand', label: 'Brand', type: 'multi_select', options: [
        { value: 'apple', label: 'Apple' }, { value: 'lenovo', label: 'Lenovo' },
        { value: 'dell', label: 'Dell' }, { value: 'hp', label: 'HP' }, { value: 'asus', label: 'ASUS' },
      ]},
      { id: 'ram', label: 'RAM', type: 'select', options: [
        { value: '8', label: '8GB+' }, { value: '16', label: '16GB+' }, { value: '32', label: '32GB+' },
      ]},
      ...baseFilters,
    ];
  }

  if (q.includes('shoe') || q.includes('sneaker') || q.includes('running') || q.includes('boot')) {
    return [
      { id: 'price', label: 'Price range', type: 'range', range: { min: 0, max: 300, unit: '$' } },
      { id: 'brand', label: 'Brand', type: 'multi_select', options: [
        { value: 'nike', label: 'Nike' }, { value: 'adidas', label: 'Adidas' },
        { value: 'newbalance', label: 'New Balance' }, { value: 'brooks', label: 'Brooks' },
      ]},
      { id: 'material', label: 'Material', type: 'multi_select', options: [
        { value: 'mesh', label: 'Mesh' }, { value: 'leather', label: 'Leather' }, { value: 'synthetic', label: 'Synthetic' },
      ]},
      ...baseFilters,
    ];
  }

  // Default generic filters
  return [
    { id: 'price', label: 'Price range', type: 'range', range: { min: 0, max: 1000, unit: '$' } },
    ...baseFilters,
  ];
}

interface FilterSidebarProps {
  query?: string;
  onFilterChange?: (filters: Record<string, unknown>) => void;
}

export function FilterSidebar({ query = '', onFilterChange }: FilterSidebarProps) {
  const filters = getFiltersForQuery(query);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ price: true, brand: true });
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [priceValue, setPriceValue] = useState(filters[0]?.range?.max ?? 1000);

  const toggleGroup = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const activeCount = Object.keys(activeFilters).length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-[13px] font-semibold">Filters</h3>
          {activeCount > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={() => { setActiveFilters({}); onFilterChange?.({}); }} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            Clear all
          </button>
        )}
      </div>

      {query && (
        <div className="px-5 py-3 bg-[#FAFAFF] border-b border-border/30">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#6D28D9] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-[#6D28D9]">AI-suggested filters</p>
              <p className="text-[10px] text-[#6D28D9]/60 mt-0.5">Based on your search for &ldquo;{query}&rdquo;</p>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-border/50">
        {filters.map(group => (
          <div key={group.id} className="px-5">
            <button onClick={() => toggleGroup(group.id)} className="w-full py-3 flex items-center justify-between text-[12px] font-semibold text-foreground">
              {group.label}
              {expanded[group.id] ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>

            {expanded[group.id] && (
              <div className="pb-3">
                {group.type === 'range' && group.range && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={group.range.min}
                      max={group.range.max}
                      value={priceValue}
                      onChange={(e) => setPriceValue(Number(e.target.value))}
                      className="w-full h-1 bg-[#E7E5E4] rounded-full appearance-none cursor-pointer accent-[#18181B]"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{group.range.unit}0</span>
                      <span>{group.range.unit}{priceValue}</span>
                    </div>
                  </div>
                )}

                {(group.type === 'select' || group.type === 'multi_select') && group.options && (
                  <div className="space-y-1">
                    {group.options.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                        <input
                          type={group.type === 'multi_select' ? 'checkbox' : 'radio'}
                          name={group.id}
                          value={opt.value}
                          className="h-3.5 w-3.5 rounded border-border text-accent accent-[#18181B]"
                          onChange={() => {
                            setActiveFilters(prev => ({ ...prev, [group.id]: opt.value }));
                            onFilterChange?.({ ...activeFilters, [group.id]: opt.value });
                          }}
                        />
                        <span className="text-[12px] text-muted group-hover:text-foreground transition-colors flex-1">{opt.label}</span>
                        {opt.count !== undefined && <span className="text-[10px] text-muted-foreground">{opt.count}</span>}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-[#FAFAF9] border-t border-border/30">
        <p className="text-[10px] text-muted-foreground">
          <span className="font-medium">Hard filters</span> exclude products. <span className="font-medium">Preferences</span> influence ranking without hiding results.
        </p>
      </div>
    </div>
  );
}
