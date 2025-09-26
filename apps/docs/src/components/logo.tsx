"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function LogoIcon({ size }: { size: string }) {
    return (
        <motion.svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                height: size,
                width: size,
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
            }}
            className="group-hover:scale-110"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <title>Notr Logo</title>
            {/* Hexagonal container */}
            <motion.path
                d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
                style={{
                    fill: 'rgba(64, 64, 64, 0.2)',
                    stroke: '#525252',
                    strokeWidth: '1'
                }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
            />

            {/* Stacked layers representing data/database */}
            <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{
                    animation: 'slideUp 3s linear infinite'
                }}
            >
                <motion.path
                    d="M8 18L16 22L24 18"
                    style={{
                        stroke: '#525252',
                        strokeWidth: '1',
                        strokeLinecap: 'round'
                    }}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                />
                <motion.path
                    d="M8 14L16 18L24 14"
                    style={{
                        stroke: '#525252',
                        strokeWidth: '1',
                        strokeLinecap: 'round'
                    }}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                />
                <motion.path
                    d="M8 10L16 14L24 10"
                    style={{
                        stroke: '#525252',
                        strokeWidth: '1',
                        strokeLinecap: 'round'
                    }}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                />
            </motion.g>

            {/* Grid lines */}
            <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <path
                    d="M16 2V30"
                    style={{
                        stroke: 'rgba(82, 82, 82, 0.4)',
                        strokeWidth: '0.75',
                        strokeDasharray: '2 2'
                    }}
                />
                <path
                    d="M4 9L28 9"
                    style={{
                        stroke: 'rgba(82, 82, 82, 0.4)',
                        strokeWidth: '0.75',
                        strokeDasharray: '2 2'
                    }}
                />
                <path
                    d="M4 23L28 23"
                    style={{
                        stroke: 'rgba(82, 82, 82, 0.4)',
                        strokeWidth: '0.75',
                        strokeDasharray: '2 2'
                    }}
                />
            </motion.g>

            {/* Corner dots */}
            <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
            >
                <motion.circle
                    cx="16"
                    cy="2"
                    r="1.5"
                    style={{ fill: '#737373' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.3 }}
                />
                <motion.circle
                    cx="28"
                    cy="9"
                    r="1.5"
                    style={{ fill: '#737373' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                />
                <motion.circle
                    cx="28"
                    cy="23"
                    r="1.5"
                    style={{ fill: '#737373' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.5 }}
                />
                <motion.circle
                    cx="16"
                    cy="30"
                    r="1.5"
                    style={{ fill: '#737373' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.6 }}
                />
                <motion.circle
                    cx="4"
                    cy="23"
                    r="1.5"
                    style={{ fill: '#737373' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.7 }}
                />
                <motion.circle
                    cx="4"
                    cy="9"
                    r="1.5"
                    style={{ fill: '#737373' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.8 }}
                />
            </motion.g>
        </motion.svg>
    );
}

type TProps = {
    href?: string;
    appName?: string;
    size?: 'sm' | 'md' | 'lg';
};

export function Logo({ href = "/", appName = "stoeten", size = 'md' }: TProps) {
    const sizeMap = {
        sm: { container: '2.25rem', icon: '1.5rem' },
        md: { container: '2.75rem', icon: '1.75rem' },
        lg: { container: '3.5rem', icon: '2rem' }
    };
    
    const currentSize = sizeMap[size];
    
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Link href={href}>
                <motion.div
                    className="group"
                    style={{
                        position: 'relative',
                        display: 'flex',
                        height: currentSize.container,
                        width: currentSize.container,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.76, 0, 0.24, 1],
                        delay: 0.2,
                    }}
                >
                    {/* Background gradient */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: '0',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(to bottom right, rgba(64, 64, 64, 0.2), rgba(64, 64, 64, 0.15), rgba(64, 64, 64, 0.1))'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    />

                    {/* Glow effect */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: '0',
                            borderRadius: '0.75rem',
                            background: 'rgba(64, 64, 64, 0.1)',
                            filter: 'blur(1rem)'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    />

                    {/* Main container */}
                    <motion.div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            height: '100%',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(to bottom right, rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 0.6))',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(64, 64, 64, 0.4)'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <LogoIcon size={currentSize.icon} />
                    </motion.div>

                    {/* Tooltip */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            left: '100%',
                            marginLeft: '1rem',
                            display: 'none',
                            zIndex: 50
                        }}
                        className="group-hover:block"
                        initial={{ opacity: 0, x: -20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.8 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: 0.1,
                        }}
                    >
                        {/* Tooltip arrow */}
                        <div style={{
                            position: 'absolute',
                            left: '0',
                            top: '50%',
                            transform: 'translateY(-50%) translateX(-0.5rem)'
                        }}>
                            <div style={{
                                width: '0',
                                height: '0',
                                borderTop: '6px solid transparent',
                                borderBottom: '6px solid transparent',
                                borderRight: '8px solid rgba(10, 10, 10, 0.95)'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '0.125rem',
                                transform: 'translateY(-50%)',
                                width: '0',
                                height: '0',
                                borderTop: '5px solid transparent',
                                borderBottom: '5px solid transparent',
                                borderRight: '7px solid rgba(64, 64, 64, 0.4)'
                            }}></div>
                        </div>

                        <motion.div
                            style={{
                                position: 'relative',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(to bottom right, rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.9), rgba(10, 10, 10, 0.85))',
                                backdropFilter: 'blur(1rem)',
                                padding: '0.625rem 1rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(64, 64, 64, 0.4)'
                            }}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.2 }}
                        >
                            {/* Inner glow */}
                            <div style={{
                                position: 'absolute',
                                inset: '0',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(to bottom right, rgba(64, 64, 64, 0.15), rgba(64, 64, 64, 0.08), transparent)',
                                opacity: 0.6
                            }}></div>

                            {/* Content */}
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    width: '0.5rem',
                                    height: '0.5rem',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(to bottom right, #737373, rgba(115, 115, 115, 0.7))',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }}></div>
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    background: 'linear-gradient(to right, #ededed, rgba(237, 237, 237, 0.8))',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {appName}
                                </span>
                            </div>

                            {/* Shimmer effect */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: '0',
                                    borderRadius: '0.75rem',
                                    background: 'linear-gradient(to right, transparent, rgba(64, 64, 64, 0.15), transparent)'
                                }}
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "linear",
                                }}
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </Link>
        </div>
    );
}