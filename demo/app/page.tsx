import Visualizer from "@/components/Visualizer";
import { SITE } from "@/lib/site";

const FEATURES = [
    {
        title: "Built for large JSON",
        body: "The tree is drawn on an HTML canvas instead of thousands of DOM nodes, so files with 5,000+ lines stay smooth to pan and zoom.",
    },
    {
        title: "Interactive tree graph",
        body: "Every object and array becomes a node connected by edges. Drag the canvas to pan, scroll to zoom and drag nodes to rearrange the layout.",
    },
    {
        title: "Live JSON validation",
        body: "The built-in editor checks your JSON as you type and tells you right away whether it is valid, so you can fix syntax errors before visualizing.",
    },
    {
        title: "Private by default",
        body: "Everything runs in your browser. Your JSON is never uploaded to a server and is only saved to your own browser's local storage.",
    },
];

const STEPS = [
    "Paste or type your JSON into the editor on the left.",
    "Check the status bar to confirm the JSON is valid.",
    "Explore the generated tree on the canvas: pan, zoom and drag nodes.",
    "Collapse the editor panel to give the tree the full screen.",
];

const FAQS = [
    {
        q: "What is a JSON tree visualizer?",
        a: "A JSON tree visualizer turns raw JSON text into a visual graph where each object, array and value is a node. It makes deeply nested API responses, config files and data payloads much easier to read than plain text.",
    },
    {
        q: "Can it handle large JSON files?",
        a: "Yes. Rendering happens on a canvas rather than the DOM, which keeps the visualizer responsive on JSON documents with thousands of lines where many other online viewers freeze.",
    },
    {
        q: "Is my JSON data sent to a server?",
        a: "No. Parsing, validation and rendering all happen locally in your browser. Nothing you paste leaves your machine.",
    },
    {
        q: "Is the JSON tree visualizer free?",
        a: "Yes, it is completely free and open source under the MIT license. You can also use the renderer in your own React app via the react-json-tree-visualizer npm package.",
    },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebApplication",
            "@id": `${SITE.url}/#app`,
            name: SITE.name,
            url: SITE.url,
            description: SITE.description,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any (web browser)",
            browserRequirements: "Requires JavaScript and HTML5 canvas",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: FEATURES.map((f) => f.title),
            author: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
            sameAs: [SITE.repo],
        },
        {
            "@type": "FAQPage",
            "@id": `${SITE.url}/#faq`,
            mainEntity: FAQS.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
            })),
        },
    ],
};

export default function Page() {
    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />

            <Visualizer />
        </main>
    );
}
