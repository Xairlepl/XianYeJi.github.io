import {
  Apple,
  LeafyGreen,
  Wheat,
  Beef,
  Fish,
  Nut,
  Coffee,
  Milk,
  Leaf,
  type LucideIcon,
} from 'lucide-react';

// 商品分类 id → 图标库图标映射（替代 emoji）
const categoryIconMap: Record<number, LucideIcon> = {
  1: Apple, // 新鲜水果
  2: LeafyGreen, // 时令蔬菜
  3: Wheat, // 粮油米面
  4: Beef, // 肉禽蛋品
  5: Fish, // 海鲜水产
  6: Nut, // 干货特产
  7: Coffee, // 茶叶饮品
  8: Milk, // 乳品烘焙
};

interface CategoryIconProps {
  id: number;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const CategoryIcon = ({ id, size = 20, className, strokeWidth = 2 }: CategoryIconProps) => {
  const Icon = categoryIconMap[id] ?? Leaf;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
};

export default CategoryIcon;
