'use client';
import React, { useState } from 'react';
import { PlusIcon, ShieldCheckIcon, Music2, BarChart3, Sparkles, Headphones, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { BorderTrail } from './border-trail';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';
import { Component as Card3D } from './3d-card-1';

const PREMIUM_FEATURES = [
	{ icon: Music2, label: 'Unlimited music recommendations', gradient: 'from-violet-500 to-fuchsia-500' },
	{ icon: BarChart3, label: 'Advanced mood analytics', gradient: 'from-fuchsia-500 to-rose-500' },
	{ icon: Sparkles, label: 'AI-powered insights', gradient: 'from-rose-500 to-amber-500' },
	{ icon: Headphones, label: 'Priority support', gradient: 'from-amber-500 to-orange-500' },
];

export function Pricing() {
	const [showPremiumCard, setShowPremiumCard] = useState(false);

	return (
		<section className="relative overflow-hidden py-12">
			<div id="pricing" className="mx-auto w-full max-w-6xl space-y-5 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="mx-auto max-w-xl space-y-5"
				>
					<div className="flex justify-center">
						<div className="rounded-lg border px-4 py-1 font-mono">Pricing</div>
					</div>
					<h2 className="mt-5 text-center text-2xl font-bold tracking-tighter md:text-3xl lg:text-4xl">
						Affordable Music-Driven Wellness
					</h2>
					<p className="text-muted-foreground mt-5 text-center text-sm md:text-base">
						Enjoy all features for a single price.
					</p>
				</motion.div>

				<div className="relative">
					<div
						className={cn(
							'z--10 pointer-events-none absolute inset-0 size-full',
							'bg-[linear-gradient(to_right,--theme(--color-foreground/.2)_1px,transparent_1px),linear-gradient(to_bottom,--theme(--color-foreground/.2)_1px,transparent_1px)]',
							'bg-[size:32px_32px]',
							'[mask-image:radial-gradient(ellipse_at_center,var(--background)_10%,transparent)]',
						)}
					/>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						viewport={{ once: true }}
						className="mx-auto w-full max-w-2xl space-y-2"
					>	
						<div className="grid md:grid-cols-2 bg-background relative border p-4">
							<PlusIcon className="absolute -top-3 -left-3  size-5.5" />
							<PlusIcon className="absolute -top-3 -right-3 size-5.5" />
							<PlusIcon className="absolute -bottom-3 -left-3 size-5.5" />
							<PlusIcon className="absolute -right-3 -bottom-3 size-5.5" />

							<div className="w-full px-4 pt-5 pb-4">
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold">Basic</h3>
										<div className="flex items-center gap-x-1">
											<span className="text-muted-foreground text-sm line-through">$8.99</span>
											<Badge variant="secondary">100% off</Badge>
										</div>
									</div>
									<p className="text-muted-foreground text-sm">Best value for general users!</p>
								</div>
								<div className="mt-10 space-y-4">
									<div className="text-muted-foreground flex items-end gap-0.5 text-xl">
										<span>$</span>
										<span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											0
										</span>
										<span>/month</span>
									</div>
									<Button className="w-full" variant="outline" asChild>
										<a href="/signin">Start Your Journey</a>
									</Button>
								</div>
							</div>
							<div className="relative w-full rounded-lg border px-4 pt-5 pb-4">
								<BorderTrail
									style={{
										boxShadow:
											'0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
									}}
									size={100}
								/>
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold">Premium</h3>
										<div className="flex items-center gap-x-1">
											<span className="text-muted-foreground text-sm line-through">$99.99</span>
											<Badge>90% off</Badge>
										</div>
									</div>
									<p className="text-muted-foreground text-sm">Unlock savings with an Premium membership!</p>
								</div>
								<div className="mt-10 space-y-4">
									<div className="text-muted-foreground flex items-end text-xl">
										<span>$</span>
										<span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											9.99
										</span>
										<span>/month</span>
									</div>
									<Button 
										className="w-full" 
										onClick={() => setShowPremiumCard(true)}
									>
										Get Started Now
									</Button>
								</div>
							</div>
						</div>

						<div className="text-muted-foreground flex items-center justify-center gap-x-2 text-sm">
							<ShieldCheckIcon className="size-4" />
							<span>Access to all features with no hidden fees</span>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Premium Card Popup - Fits viewport, no scroll */}
			<Dialog open={showPremiumCard} onOpenChange={setShowPremiumCard}>
				<DialogContent
					className={cn(
						'w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden',
						'border-0 p-0 gap-0 rounded-2xl sm:rounded-3xl',
						'bg-slate-950/95 dark:bg-slate-950/98 backdrop-blur-2xl',
						'shadow-[0_0_0_1px_rgba(255,255,255,.06),0_24px_80px_-12px_rgba(0,0,0,.6),0_0_80px_-40px_rgba(139,92,246,.4)]',
						'pr-8 sm:pr-6',
						'[&_[data-slot=dialog-close]]:text-slate-400 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:rounded-lg'
					)}
				>
					{/* Subtle gradient orbs */}
					<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
						<div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
						<div className="absolute top-1/2 -left-24 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
						<div className="absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
					</div>

					{/* Layout: side-by-side on lg, stacked on small screens — all fits in 90vh */}
					<div className="relative flex flex-col lg:flex-row lg:items-stretch min-h-0 max-h-[90vh]">
						{/* Left: 3D Card — only on lg */}
						<motion.div
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
							className="hidden lg:flex flex-shrink-0 items-center justify-center p-6 min-w-0 lg:w-[42%]"
						>
							<div className="scale-90 origin-center max-w-full">
								<div className="max-w-[280px] mx-auto">
									<Card3D />
								</div>
							</div>
						</motion.div>

						{/* Right (or full width on mobile): header + features + CTA */}
						<div className="relative flex flex-col flex-1 min-h-0 py-6 sm:py-7 px-5 sm:px-6 lg:px-6 lg:py-6 justify-between">
							<div>
								<motion.span
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
									className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300"
								>
									Premium
								</motion.span>
								<DialogTitle
									className={cn(
										'mt-3 text-xl sm:text-2xl lg:text-2xl font-bold tracking-tight',
										'bg-gradient-to-r from-violet-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent',
										'pr-0 text-left lg:text-left'
									)}
								>
									<motion.span
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 0.05 }}
										className="block"
									>
										Premium MoodMelody Experience
									</motion.span>
								</DialogTitle>
								<DialogDescription
									className={cn(
										'text-slate-400 text-sm mt-1.5 max-w-md pr-0 text-left'
									)}
								>
									<motion.span
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 0.1 }}
										className="block"
									>
										Unlock unlimited music recommendations, advanced mood analytics, and exclusive features.
									</motion.span>
								</DialogDescription>

								{/* 3D Card — visible only on small screens, compact */}
								<motion.div
									initial={{ opacity: 0, scale: 0.96 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
									className="lg:hidden w-full flex justify-center overflow-hidden mt-4"
								>
									<div className="scale-[0.6] origin-center max-w-full">
										<div className="max-w-[320px] mx-auto">
											<Card3D />
										</div>
									</div>
								</motion.div>

								{/* Features — compact grid */}
								<div className="mt-4 lg:mt-5 grid grid-cols-2 gap-2 sm:gap-2.5">
									{PREMIUM_FEATURES.map(({ icon: Icon, label, gradient }, i) => (
										<motion.div
											key={label}
											initial={{ opacity: 0, x: -6 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
											className={cn(
												'flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5',
												'transition-colors hover:bg-white/[0.08] hover:border-white/10'
											)}
										>
											<div
												className={cn(
													'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
													gradient,
													'text-white shadow-lg'
												)}
											>
												<Icon className="h-3.5 w-3.5" />
											</div>
											<span className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-2">{label}</span>
										</motion.div>
									))}
								</div>
							</div>

							{/* CTA */}
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.4 }}
								className="mt-5 lg:mt-6 flex-shrink-0"
							>
								<button
									type="button"
									className={cn(
										'w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6',
										'bg-amber-500 text-slate-900 font-semibold text-base tracking-wide',
										'hover:bg-amber-400 transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]',
										'shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35'
									)}
								>
									<Rocket className="h-5 w-5" />
									Coming Soon
								</button>
							</motion.div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</section>
	);
}

