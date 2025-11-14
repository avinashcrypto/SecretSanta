import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );

  if (!animate) {
    return skeletonElement;
  }

  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Card skeleton preset
export function CardSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="90%" height={16} />
          <Skeleton variant="text" width="70%" height={16} />
        </div>

        {/* Footer */}
        <Skeleton variant="rectangular" width="100%" height={48} />
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="space-y-6">
        {/* Phase indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="space-y-2">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={16} />
            </div>
          </div>
          <Skeleton variant="text" width={100} height={24} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="60%" height={32} />
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Skeleton variant="text" width="40%" height={16} />
          <Skeleton variant="rectangular" width="100%" height={8} />
        </div>
      </div>
    </div>
  );
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" height={16} />
              <Skeleton variant="text" width="40%" height={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton variant="text" width="50%" height={24} />
          <Skeleton variant="text" width="80%" height={16} />
        </div>

        {/* Form fields */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="rectangular" width="100%" height={48} />
          </div>
        ))}

        {/* Submit button */}
        <Skeleton variant="rectangular" width="100%" height={56} />
      </div>
    </div>
  );
}
