"use client";

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Features } from "@/components/blocks/features-8";
import { Footer } from "@/components/ui/footer";
import { Github, Twitter } from "lucide-react";
import { Pricing } from "@/components/ui/single-pricing-card-1";

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: "spring" as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <></>
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="/signin"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">Introducing AI-Powered Music Analysis</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                        
                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        Music-Driven Wellness Journaling
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        MoodMelody is a wellness-focused, music-driven journaling platform that helps users understand and manage their emotions through music.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <Link href="/signin">
                                                <span className="text-nowrap">Get Started</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link href="#link">
                                            <span className="text-nowrap">See Demo</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    <img
                                        className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                                        src="/home-d.png"
                                        alt="MoodMelody Dashboard - Dark Mode"
                                        width="2700"
                                        height="1440"
                                    />
                                    <img
                                        className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                                        src="/home-l.png"
                                        alt="MoodMelody Dashboard - Light Mode"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <div className="relative" id="features">
                    <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                    <Features />
                        </div>
                <div id="pricing">
                    <Pricing />
                    </div>
            </main>
            <div id="footer">
                <Footer
                    logo={<></>}
                    brandName="MoodMelody"
                    socialLinks={[
                        { icon: <Github />, href: "https://github.com/hackstyx", label: "GitHub" },
                        { icon: <Twitter />, href: "https://x.com/hackstyx", label: "X (Twitter)" },
                    ]}
                    mainLinks={[
                        { href: "#features", label: "Features" },
                        { href: "#pricing", label: "Pricing" },
                    ]}
                    legalLinks={[
                        { href: "#privacy", label: "Privacy" },
                        { href: "#terms", label: "Terms" },
                    ]}
                    copyright={{
                        text: "© 2025 MoodMelody. All rights reserved.",
                        license: "MIT License",
                    }}
                />
            </div>
        </>
    )
}

const menuItems = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#footer' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto items-center gap-x-3">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2"
                            >
                                <Logo />
                            </Link>
                            <ThemeToggle />
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="/signin">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="/signin">
                                        <span>Sign Up</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <Link href="#">
                                        <span>Get Started</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <span className={cn('flex items-center gap-3 font-serif italic tracking-tight text-2xl md:text-3xl', className)}>
            {/* Stunning Music Diary Logo */}
        <svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
                className="h-11 w-11 md:h-12 md:w-12 drop-shadow-lg"
            >
            <defs>
                    <radialGradient id="badgeGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.7" />
                        <stop offset="60%" stopColor="#6366F1" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#312E81" stopOpacity="0.3" />
                    </radialGradient>
                    <linearGradient id="bookGradient" x1="10" y1="10" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FDE68A" />
                        <stop offset="1" stopColor="#F59E42" />
                    </linearGradient>
                    <linearGradient id="noteGradient2" x1="28" y1="14" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F472B6" />
                        <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
            </defs>
                {/* Glowing circular badge */}
                <circle cx="22" cy="22" r="20" fill="url(#badgeGlow)" />
                {/* Open diary/book */}
                <g>
                    <rect x="11" y="13" width="10" height="18" rx="3" fill="url(#bookGradient)" stroke="#fff" strokeWidth="1.5" />
                    <rect x="23" y="13" width="10" height="18" rx="3" fill="#fff" fillOpacity="0.95" stroke="#fff" strokeWidth="1.5" />
                    {/* Book spine */}
                    <rect x="20.5" y="13" width="3" height="18" rx="1.2" fill="#F59E42" fillOpacity="0.7" />
                    {/* Book lines */}
                    <line x1="14" y1="18" x2="19" y2="18" stroke="#F59E42" strokeWidth="0.8" opacity="0.5" />
                    <line x1="14" y1="22" x2="19" y2="22" stroke="#F59E42" strokeWidth="0.8" opacity="0.3" />
                    <line x1="14" y1="26" x2="19" y2="26" stroke="#F59E42" strokeWidth="0.8" opacity="0.2" />
                </g>
                {/* Dynamic music note overlay */}
                <g filter="url(#shadow2)">
                    <path d="M32 16V29A3 3 0 1 1 28 26" stroke="url(#noteGradient2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="28" cy="29" r="2.2" fill="url(#noteGradient2)" />
                    <rect x="32" y="13" width="2.5" height="5" rx="1.2" fill="url(#noteGradient2)" />
                </g>
                {/* Drop shadow filter for music note */}
                <filter id="shadow2" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7C3AED" floodOpacity="0.25" />
                </filter>
        </svg>
            <span>MoodMelody</span>
        </span>
    )
}