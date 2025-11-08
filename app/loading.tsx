"use client"

import LayoutWrapper from '@/components/LayoutWrapper';
import { motion } from 'motion/react';

const DOTS = 15;

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur z-50">
            <LayoutWrapper isEntering={true}>
                <div className="flex gap-3">
                    {[...Array(DOTS)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                x: [0, -18, 0],
                            }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: i * 0.6,
                                ease: 'easeInOut',
                            }}
                            className="w-2 h-2 rounded-full bg-blue-400"
                        />
                    ))}
                </div>
            </LayoutWrapper>
        </div>
    );
}