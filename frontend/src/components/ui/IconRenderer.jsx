import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Safely renders any Lucide icon by name with fallback
 */
export function IconRenderer({ name, className = 'w-5 h-5', ...props }) {
  if (!name) return <Icons.Circle className={className} {...props} />;

  // Convert kebab-case or lowercase to PascalCase (e.g. "shopping-bag" -> "ShoppingBag")
  const pascalName = name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  const IconComponent = Icons[pascalName] || Icons[name] || Icons.Circle;

  return <IconComponent className={className} {...props} />;
}
