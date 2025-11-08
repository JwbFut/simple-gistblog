'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function LayoutWrapper({
    children,
    isEntering = true,
}: {
    children: React.ReactNode;
    isEntering?: boolean;
}) {
    const pathname = usePathname();

    const isForward = pathname.startsWith('/blogs');

    const xEnter = isForward ? 300 : -300;
    const xExit = isForward ? -100 : 100;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{
                    x: isEntering ? xEnter : 0,
                    opacity: isEntering ? 0 : 1
                }}
                animate={{
                    x: 0,
                    opacity: 1,
                    transition: { duration: 0.35, ease: 'easeOut' }
                }}
                exit={{
                    x: xExit,
                    opacity: 0,
                    transition: { duration: 0.25, ease: 'easeIn' }
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}