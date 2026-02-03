"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Database, Shield, Zap, Globe, Users, Lock, Upload, Key, Coins } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="relative flex-1 overflow-hidden border-b border-border bg-background">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-24 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32 relative z-10">
                    <div className="flex flex-col items-center text-center">

                        <h1 className="max-w-5xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
                            Unlock the World's
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                                Scientific Knowledge
                            </span>
                        </h1>

                        <p className="mt-8 max-w-2xl text-xl text-muted-foreground leading-relaxed">
                            The first decentralized marketplace for scientific data. publish your research, prove ownership, and monetize your contributions to science.
                        </p>

                        <div className="mt-12 flex flex-col sm:flex-row gap-6">
                            <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105">
                                <Link href="/marketplace">
                                    Start Browsing
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full border-2 hover:bg-secondary/50">
                                <Link href="/publish">
                                    Share Research
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Metrics */}
                        <div className="mt-24 pt-8 border-t border-border w-full max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <Metric label="Verified Datasets" value="100+" delay={0} />
                            <Metric label="Research Funded" value="$50k+" delay={100} />
                            <Metric label="Global Researchers" value="500+" delay={200} />
                            <Metric label="Platform Fees" value="0%" delay={300} />
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">How It Works</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            A seamless process for sharing and accessing scientific data, powered by blockchain technology.
                        </p>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-3 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                        <StepCard
                            number="01"
                            icon={<Upload className="h-8 w-8 text-primary" />}
                            title="Publish Data"
                            description="Upload your dataset to decentralized storage (IPFS) and mint a unique NFT representing ownership."
                        />
                        <StepCard
                            number="02"
                            icon={<Coins className="h-8 w-8 text-primary" />}
                            title="Set Licensing"
                            description="Define your terms. Choose between research-only or commercial licenses and set your price in ETH."
                        />
                        <StepCard
                            number="03"
                            icon={<Key className="h-8 w-8 text-primary" />}
                            title="Grant Access"
                            description="Researchers purchase licenses instantly via smart contracts, unlocking secure access to your data."
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-secondary/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Features</h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={<Shield className="h-6 w-6 text-indigo-500" />}
                            title="Immutable Ownership"
                            description="Mint your datasets as NFTs. Prove origin and ownership forever on the blockchain."
                        />
                        <FeatureCard
                            icon={<Lock className="h-6 w-6 text-indigo-500" />}
                            title="Secure Licensing"
                            description="Smart contracts handle licensing rights automatically. Choose between research or commercial terms."
                        />
                        <FeatureCard
                            icon={<Globe className="h-6 w-6 text-indigo-500" />}
                            title="Global Access"
                            description="Remove institutional barriers. Access valuable research data from anywhere in the world."
                        />
                        <FeatureCard
                            icon={<Zap className="h-6 w-6 text-indigo-500" />}
                            title="Instant Settlements"
                            description="Get paid instantly when someone licenses your data. No intermediaries, no delays."
                        />
                        <FeatureCard
                            icon={<Database className="h-6 w-6 text-indigo-500" />}
                            title="IPFS Storage"
                            description="Data is stored on decentralized networks, ensuring permanence and censorship resistance."
                        />
                        <FeatureCard
                            icon={<Users className="h-6 w-6 text-indigo-500" />}
                            title="Peer Reviewed"
                            description="Community-driven validation system establishes trust and quality in shared datasets."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="mx-auto max-w-4xl px-4 relative text-center">
                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-8">
                        Join the Open Science Revolution
                    </h2>
                    <p className="text-xl text-muted-foreground mb-12">
                        Whether you're a researcher, institution, or data scientist, DSDM provides the infrastructure for the next generation of scientific discovery.
                    </p>
                    <Button asChild size="lg" className="h-14 px-12 text-lg rounded-full">
                        <Link href="/register">
                            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}

function Metric({ label, value }: { label: string, value: string, delay: number }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        </div>
    )
}

function StepCard({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="relative flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border/50 shadow-sm">
            <span className="absolute -top-6 text-6xl font-black text-secondary/40 select-none z-0">
                {number}
            </span>
            <div className="relative z-10 mb-6 bg-primary/10 p-4 rounded-2xl">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex flex-col p-6 rounded-2xl border border-border/50 bg-background hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-indigo-50 mb-4">
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}
