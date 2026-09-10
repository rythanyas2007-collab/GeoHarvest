import React from 'react';

export type StatusVariant =
  | 'healthy'
  | 'moderate'
  | 'needs_attention'
  | 'critical'
  | 'under_review'
  | 'verified'
  | 'operational'
  | 'needs_maintenance'
  | 'critical_damage'
  | 'inactive'
  | 'draft'
  | 'open'
  | 'completed';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = ''
}) => {
  const normalized = status.toLowerCase().replace(/[\s-]/g, '_');

  let bgClass = 'bg-[#F1F5F9]';
  let textClass = 'text-[#697586]';
  let borderClass = 'border-[#D9E0E7]';
  let dotClass = 'bg-[#697586]';

  if (['healthy', 'verified', 'operational', 'completed', 'active'].includes(normalized)) {
    bgClass = 'bg-[#EBF7F0]';
    textClass = 'text-[#248A52]';
    borderClass = 'border-[#B8E6CB]';
    dotClass = 'bg-[#248A52]';
  } else if (['moderate', 'in_progress', 'assigned', 'ranked'].includes(normalized)) {
    bgClass = 'bg-[#FEF6EC]';
    textClass = 'text-[#C77A13]';
    borderClass = 'border-[#F8DCB3]';
    dotClass = 'bg-[#C77A13]';
  } else if (['needs_attention', 'needs_maintenance', 'action_assigned', 'review_required'].includes(normalized)) {
    bgClass = 'bg-[#FEF2E8]';
    textClass = 'text-[#D0641A]';
    borderClass = 'border-[#F8D2B8]';
    dotClass = 'bg-[#D0641A]';
  } else if (['critical', 'critical_damage', 'rejected'].includes(normalized)) {
    bgClass = 'bg-[#FDF2F2]';
    textClass = 'text-[#BC3A3A]';
    borderClass = 'border-[#F8C8C8]';
    dotClass = 'bg-[#BC3A3A]';
  } else if (['under_review', 'action_approved', 'location_verified', 'submitted'].includes(normalized)) {
    bgClass = 'bg-[#EFF6FF]';
    textClass = 'text-[#2563A6]';
    borderClass = 'border-[#BFDBFE]';
    dotClass = 'bg-[#2563A6]';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  };

  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${textClass} ${borderClass} ${sizeClasses[size]} whitespace-nowrap tracking-tight ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {displayLabel}
    </span>
  );
};
