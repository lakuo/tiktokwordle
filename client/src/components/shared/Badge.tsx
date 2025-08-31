interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'connected' | 'disconnected' | 'urgent' | 'timer';
  style?: React.CSSProperties;
  className?: string;
}

export function Badge({ children, variant = 'default', style, className = '' }: BadgeProps) {
  const baseClasses = 'badge';
  const variantClasses = variant !== 'default' ? variant : '';
  const classes = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <span className={classes} style={style}>
      {children}
    </span>
  );
}