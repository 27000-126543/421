import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { SceneElement, SceneCategory } from '../../../shared/types';
import { sceneElements } from '../../../shared/mockData';

interface SceneEditorProps {
  selectedElements: SceneElement[];
  onElementsChange: (elements: SceneElement[]) => void;
}

const categories: { id: SceneCategory; label: string; icon: string }[] = [
  { id: 'plant', label: '植物', icon: '🌿' },
  { id: 'architecture', label: '建筑', icon: '🏰' },
  { id: 'creature', label: '生物', icon: '🐉' },
  { id: 'weather', label: '天气', icon: '🌤️' },
  { id: 'time', label: '时间', icon: '⏳' },
];

const gridSize = 18;

export default function SceneEditor({ selectedElements, onElementsChange }: SceneEditorProps) {
  const [activeCategory, setActiveCategory] = useState<SceneCategory>('plant');
  const [draggedElement, setDraggedElement] = useState<SceneElement | null>(null);

  const filteredElements = sceneElements.filter((e) => e.category === activeCategory);

  const handleDrop = (index: number) => {
    if (draggedElement) {
      const newElements = [...selectedElements];
      newElements[index] = draggedElement;
      onElementsChange(newElements.filter(Boolean));
      setDraggedElement(null);
    }
  };

  const removeElement = (index: number) => {
    const newElements = selectedElements.filter((_, i) => i !== index);
    onElementsChange(newElements);
  };

  const getStabilityColor = (mod: number) => {
    if (mod >= 10) return 'text-dream-green';
    if (mod >= 0) return 'text-dream-blue';
    if (mod >= -5) return 'text-dream-gold';
    return 'text-dream-red';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-dream-purple to-dream-blue text-white'
                : 'bg-dream-purple/10 text-dream-light/70 hover:bg-dream-purple/20'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span>🎨</span>
            场景元素库
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {filteredElements.map((element) => (
              <motion.div
                key={element.id}
                draggable
                onDragStart={() => setDraggedElement(element)}
                onDragEnd={() => setDraggedElement(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-dream-purple/10 border border-dream-purple/20 cursor-grab active:cursor-grabbing hover:border-dream-purple/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-4 h-4 text-dream-light/30 group-hover:text-dream-light/50" />
                  <span className="text-2xl">{element.icon}</span>
                </div>
                <p className="text-sm font-medium truncate">{element.name}</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className={getStabilityColor(element.stabilityModifier)}>
                    稳定 {element.stabilityModifier > 0 ? '+' : ''}{element.stabilityModifier}
                  </span>
                  <span className="text-dream-light/50">|</span>
                  <span className="text-dream-gold">经验 +{element.experienceModifier}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span>📐</span>
            已选元素 ({selectedElements.length}/{gridSize})
          </h4>
          <div className="hex-grid mb-4">
            {Array(gridSize).fill(null).map((_, index) => {
              const element = selectedElements[index];
              return (
                <motion.div
                  key={index}
                  className={`hex-cell ${element ? 'occupied' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  whileHover={{ scale: element ? 1.1 : 1.05 }}
                >
                  {element ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span className="text-xl">{element.icon}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(index);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dream-red text-white flex items-center justify-center text-xs hover:scale-110 transition-transform"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-dream-light/20 text-xs">+</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedElements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 max-h-40 overflow-y-auto"
              >
                {selectedElements.map((element, index) => (
                  <motion.div
                    key={`${element.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-dream-purple/10 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{element.icon}</span>
                      <span>{element.name}</span>
                    </div>
                    <button
                      onClick={() => removeElement(index)}
                      className="text-dream-red hover:bg-dream-red/20 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
