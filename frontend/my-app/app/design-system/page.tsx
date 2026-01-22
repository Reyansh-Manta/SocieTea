
export default function DesignSystem() {
    const colors = [
        { name: "Oxford Blue", variable: "var(--color-oxford-blue)", hex: "#1D2D50", class: "bg-oxford-blue" },
        { name: "Charcoal", variable: "var(--color-charcoal)", hex: "#131515", class: "bg-charcoal" },
        { name: "Off-White/Bone", variable: "var(--color-off-white)", hex: "#FBFBFB", class: "bg-off-white" },
        { name: "Electric Saffron", variable: "var(--color-electric-saffron)", hex: "#F3CA40", class: "bg-electric-saffron" },
        { name: "Coral", variable: "var(--color-coral)", hex: "#FF6B6B", class: "bg-coral" },
    ];

    return (
        <div className="min-h-screen bg-off-white p-12 space-y-16">
            <header className="mb-12">
                <h1 className="text-5xl font-bold mb-4 text-oxford-blue">Design System</h1>
                <p className="text-xl text-charcoal/80 font-sans">
                    "Intellectual Vitality" - A serious, academic foundation with high-energy accents.
                </p>
            </header>

            {/* Color Palette Section */}
            <section>
                <h2 className="text-3xl font-bold mb-8 text-oxford-blue border-b-2 border-oxford-blue/10 pb-4">
                    Color Palette
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {colors.map((color) => (
                        <div key={color.name} className="space-y-3">
                            <div
                                className={`h-32 rounded-lg shadow-md border border-black/5 ${color.class}`}
                                style={{ backgroundColor: color.variable }}
                            ></div>
                            <div className="font-sans">
                                <h3 className="font-bold text-lg text-oxford-blue">{color.name}</h3>
                                <code className="block text-sm text-gray-500 bg-gray-100 p-1 rounded w-fit mt-1">
                                    {color.variable}
                                </code>
                                <span className="text-sm text-gray-400">{color.hex}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Typography Section */}
            <section>
                <h2 className="text-3xl font-bold mb-8 text-oxford-blue border-b-2 border-oxford-blue/10 pb-4">
                    Typography
                </h2>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Headings */}
                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-2 mb-4">
                            <span className="text-sm text-gray-500 font-sans uppercase tracking-wider">Serif Headings (Playfair Display)</span>
                        </div>

                        <div>
                            <h1 className="text-6xl font-bold text-oxford-blue mb-2">Heading 1</h1>
                            <p className="font-sans text-gray-400 text-sm">Playfair Display / Bold / 6xl</p>
                        </div>

                        <div>
                            <h2 className="text-5xl font-bold text-oxford-blue mb-2">Heading 2</h2>
                            <p className="font-sans text-gray-400 text-sm">Playfair Display / Bold / 5xl</p>
                        </div>

                        <div>
                            <h3 className="text-4xl font-bold text-oxford-blue mb-2">Heading 3</h3>
                            <p className="font-sans text-gray-400 text-sm">Playfair Display / Bold / 4xl</p>
                        </div>
                    </div>

                    {/* Body Text */}
                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-2 mb-4">
                            <span className="text-sm text-gray-500 font-sans uppercase tracking-wider">Sans-Serif Body (Inter)</span>
                        </div>

                        <div>
                            <p className="text-lg text-charcoal leading-relaxed mb-2 font-sans">
                                Colleges love tradition, but students live in the modern web. This design mimics the look of university letterheads adding authority, while ensuring high readability on mobile devices.
                            </p>
                            <p className="font-sans text-gray-400 text-sm">Body Large / Inter / Regular</p>
                        </div>

                        <div>
                            <p className="text-base text-charcoal leading-relaxed mb-2 font-sans">
                                The quick brown fox jumps over the lazy dog.
                                <span className="font-bold">Bold text looks like this.</span>
                                <span className="italic"> Italic text looks like this.</span>
                            </p>
                            <p className="font-sans text-gray-400 text-sm">Body Base / Inter / Regular</p>
                        </div>

                        <div className="pt-4">
                            <button className="bg-electric-saffron text-oxford-blue px-6 py-3 rounded font-bold font-sans hover:bg-opacity-90 transition-colors shadow-sm">
                                Call to Action
                            </button>
                            <button className="bg-coral text-white px-6 py-3 rounded font-bold font-sans ml-4 hover:bg-opacity-90 transition-colors shadow-sm">
                                Register Now
                            </button>
                            <p className="font-sans text-gray-400 text-sm mt-4">Button Examples</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
