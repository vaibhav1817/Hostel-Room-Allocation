import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Action {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
}

interface SpeedDialProps {
    actions: Action[];
}

const SpeedDial: React.FC<SpeedDialProps> = ({ actions }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    // Filter out disabled actions or render them disabled?
    // Usually speed dials just show available actions, but if disabled is important info (like "you can't do this yet"), keep it.
    // The previous UI disabled them, so I will support disabled state.

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col items-end gap-3 mb-2 pointer-events-auto">
                        {actions.map((action, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ duration: 0.2, delay: actions.length * 0.05 - index * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-md border border-border">
                                    {action.label}
                                </div>
                                <Button
                                    variant={action.variant || "outline"}
                                    size="icon"
                                    className={cn("h-12 w-12 rounded-full shadow-lg border-2", action.className)}
                                    onClick={() => {
                                        action.onClick();
                                        setIsOpen(false);
                                    }}
                                    disabled={action.disabled}
                                >
                                    {action.icon}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="pointer-events-auto">
                <Button
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-xl transition-transform duration-300",
                        isOpen ? "bg-destructive hover:bg-destructive/90 rotate-45" : "bg-primary hover:bg-primary/90"
                    )}
                    onClick={toggleOpen}
                >
                    <Plus className="h-8 w-8 text-primary-foreground" />
                </Button>
            </div>
        </div>
    );
};

export default SpeedDial;
