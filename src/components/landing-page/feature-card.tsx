import React from "react";

const features = [
	{
		title: "Resume-Based Interviews",
		description:
			"Upload your resume and get tailored interview questions relevant to your profile.",
	},
	{
		title: "Realistic Practice",
		description:
			"Experience interactive mock interviews that feel like the real thing.",
	},
	{
		title: "Actionable Feedback",
		description:
			"Get instant summaries, strengths, and improvement areas after each session.",
	},
];

export default function FeatureCard() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
			{features.map((feature, idx) => (
				<div
					key={idx}
					className="bg-white/80 dark:bg-card border border-gray-200 dark:border-card rounded-xl shadow-md p-6 flex flex-col items-center text-center transition hover:scale-105 hover:shadow-lg"
				>
					<h3 className="text-lg font-semibold mb-2 text-primary">
						{feature.title}
					</h3>
					<p className="text-gray-700 dark:text-card-foreground text-sm">
						{feature.description}
					</p>
				</div>
			))}
		</div>
	);
}