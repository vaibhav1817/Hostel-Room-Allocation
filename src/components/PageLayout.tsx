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
        <div className="min-h-screen -m-6 p-6 page-bg relative overflow-hidden">
            {/* Decorative blobs — part of the premium light mesh */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[300px] rounded-full opacity-60"
                style={{
                    background: 'radial-gradient(ellipse, hsla(243,75%,82%,0.35) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    zIndex: 0,
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-20 w-[350px] h-[280px] rounded-full opacity-50"
                style={{
                    background: 'radial-gradient(ellipse, hsla(187,85%,72%,0.30) 0%, transparent 70%)',
                    filter: 'blur(55px)',
                    zIndex: 0,
                }}
            />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/60">
                    <div className="space-y-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="text-3xl font-black tracking-tight text-gradient"
                        >
                            {title}
                        </motion.h1>
                        {description && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="text-slate-500 text-base font-medium"
                            >
                                {description}
                            </motion.p>
                        )}
                    </div>
                    {action && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                        >
                            {action}
                        </motion.div>
                    )}
                </div>

                {/* ── Main Content ── */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default PageLayout;
