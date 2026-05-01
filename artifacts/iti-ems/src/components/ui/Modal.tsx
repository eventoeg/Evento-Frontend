
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'xl',
}: ModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className={`relative bg-white w-full ${maxWidthClasses[maxWidth]} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-outline/30 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="p-6 border-b border-outline/30 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-black tracking-tighter text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">{subtitle}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-surface rounded-full transition-colors text-on-surface-variant hover:text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
