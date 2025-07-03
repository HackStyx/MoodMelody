'use client';
import React, { useState } from 'react';
import { PlusIcon, ShieldCheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { BorderTrail } from './border-trail';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';
import { Component as Card3D } from './3d-card-1';

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

			{/* Premium Card Popup */}
			<Dialog open={showPremiumCard} onOpenChange={setShowPremiumCard}>
				<DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden border-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-4 sm:p-6 pt-8 sm:pt-6">
					<DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight pr-8 sm:pr-0">
						Premium MoodMelody Experience
					</DialogTitle>
					<DialogDescription className="text-center text-muted-foreground text-sm sm:text-base px-2">
						Unlock unlimited music recommendations, advanced mood analytics, and exclusive features
					</DialogDescription>
					
					<div className="flex flex-col items-center space-y-4 sm:space-y-6">
						{/* 3D Card Component - Responsive Container */}
						<div className="w-full flex justify-center overflow-hidden">
							<div className="scale-75 sm:scale-90 md:scale-100 origin-center max-w-full">
								<div className="max-w-[320px] sm:max-w-[360px] md:max-w-none mx-auto">
									<Card3D />
								</div>
							</div>
						</div>
						
						{/* Premium Features - Responsive Grid */}
						<div className="w-full space-y-3 sm:space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
								<div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
									<div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex-shrink-0"></div>
									<span className="text-xs sm:text-sm font-medium">Unlimited music recommendations</span>
								</div>
								<div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
									<div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
									<span className="text-xs sm:text-sm font-medium">Advanced mood analytics</span>
								</div>
								<div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
									<div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex-shrink-0"></div>
									<span className="text-xs sm:text-sm font-medium">AI-powered insights</span>
								</div>
								<div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
									<div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex-shrink-0"></div>
									<span className="text-xs sm:text-sm font-medium">Priority support</span>
								</div>
							</div>
						</div>

						{/* Coming Soon Banner - Responsive */}
						<div className="w-full flex justify-center items-center">
							<div className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full text-center min-w-fit">
								<span className="text-white font-bold text-base sm:text-lg tracking-wide whitespace-nowrap">
									🚀 Coming Soon
								</span>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</section>
	);
}

