import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageLayoutProps {
    title: string;
    description?: string;
    children: ReactNode;
    action?: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, description, children, action }) => {
    return (
        <div className="min-h-screen -m-6 p-6 bg-slate-50/80 dark:bg-slate-950">
            {/* Common Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent dark:from-blue-900/10 blur-3xl -z-10" />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-6">
                    <div className="space-y-1">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-black tracking-tight text-primary"
                        >
                            {title}
                        </motion.h2>
                        {description && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-muted-foreground text-lg"
                            >
                                {description}
                            </motion.p>
                        )}
                    </div>
                    {action && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {action}
                        </motion.div>
                    )}
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default PageLayout;
