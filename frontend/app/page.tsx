"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Database, Shield, Zap, Globe, Users, Lock } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="relative flex-1 overflow-hidden border-b border-border bg-background">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(74,222,128,0.1),transparent_50%)]" />

                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <Badge variant="secondary" className="mb-8 px-4 py-1.5 text-sm font-medium border border-primary/20 bg-primary/5 text-primary">
                            The Future of Scientific Research
                        </Badge>

                        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
                            Decentralized Science <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                Data Marketplace
                            </span>
                        </h1>

                        <p className="mt-8 max-w-2xl text-xl text-muted-foreground">
                            A revolutionary platform for researchers to publish datasets, prove ownership with NFTs, and securely license access using blockchain technology.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="h-12 px-8 text-base">
                                <Link href="/marketplace">
                                    Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                                <Link href="/publish">
                                    Publish Dataset
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-20 grid grid-cols-2 gap-8 text-center sm:grid-cols-4 lg:gap-16">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-3xl font-bold tabular-nums">100+</p>
                                <p className="text-sm text-muted-foreground">Verified Datasets</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-3xl font-bold tabular-nums">$50k+</p>
                                <p className="text-sm text-muted-foreground">Research Funded</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-3xl font-bold tabular-nums">500+</p>
                                <p className="text-sm text-muted-foreground">Global Researchers</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-3xl font-bold tabular-nums">0%</p>
                                <p className="text-sm text-muted-foreground">Platform Fees</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-secondary/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose DSDM?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Built on Web3 technology to empower the scientific community.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={<Shield className="h-8 w-8 text-primary" />}
                            title="Immutable Ownership"
                            description="Mint your datasets as NFTs. Prove origin and ownership forever on the blockchain."
                        />
                        <FeatureCard
                            icon={<Lock className="h-8 w-8 text-primary" />}
                            title="Secure Licensing"
                            description="Smart contracts handle licensing rights automatically. Choose between research or commercial terms."
                        />
                        <FeatureCard
                            icon={<Globe className="h-8 w-8 text-primary" />}
                            title="Global Access"
                            description="Remove institutional barriers. Access valuable research data from anywhere in the world."
                        />
                        <FeatureCard
                            icon={<Zap className="h-8 w-8 text-primary" />}
                            title="Instant Settlements"
                            description="Get paid instantly when someone licenses your data. No intermediaries, no delays."
                        />
                        <FeatureCard
                            icon={<Database className="h-8 w-8 text-primary" />}
                            title="IPFS Storage"
                            description="Data is stored on decentralized networks, ensuring permanence and censorship resistance."
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8 text-primary" />}
                            title="Peer Reviewed"
                            description="Community-driven validation system establishes trust and quality in shared datasets."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                    <div className="rounded-3xl bg-background border border-primary/20 p-8 md:p-16 text-center shadow-2xl shadow-primary/10">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                            Ready to Accelerate Science?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join thousands of researchers who are already sharing and monetizing their work on the Decentralized Science Data Marketplace.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="h-12 px-8 text-base">
                                <Link href="/marketplace">
                                    Start Browsing
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                                <Link href="/register">
                                    Create Account
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="group relative rounded-2xl border border-border bg-background p-8 hover:border-primary/50 transition-colors">
            <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}
