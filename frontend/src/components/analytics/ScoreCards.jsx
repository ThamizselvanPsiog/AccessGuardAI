import ScoreCard from "./ScoreCard";

export default function ScoreCards({ scores }) {

    if (!scores) {
        return null;
    }

    const scoreData = [
        {
            title: "Accessibility",
            value: scores.accessibility ?? 0,
            color: "text-green-400",
        },
        {
            title: "Performance",
            value: scores.performance ?? 0,
            color: "text-cyan-400",
        },
        {
            title: "Best Practices",
            value: scores.bestPractices ?? 0,
            color: "text-violet-400",
        },
        {
            title: "SEO",
            value: scores.seo ?? 0,
            color: "text-orange-400",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {scoreData.map((item) => (
                <ScoreCard
                    key={item.title}
                    {...item}
                />
            ))}

        </div>
    );
}