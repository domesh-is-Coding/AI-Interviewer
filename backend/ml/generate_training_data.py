import random
import json

# Define roles and associated skills
roles = ["Frontend Developer", "Backend Engineer", "ML Engineer", "DevOps Engineer", "Data Analyst", "Full Stack Developer"]
skills = {
    "Frontend Developer": ["React.js", "HTML", "CSS", "JavaScript"],
    "Backend Engineer": ["Java", "Spring", "Node.js", "SQL"],
    "ML Engineer": ["PyTorch", "TensorFlow", "NLP", "Computer Vision"],
    "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "CI/CD"],
    "Data Analyst": ["Excel", "SQL", "Tableau", "Data Cleaning"],
    "Full Stack Developer": ["React", "Node.js", "MongoDB", "Express", "MySQL", "Redis", "Javascript"]
}

# Generate synthetic dataset
synthetic_data = []
for _ in range(10000):  # Generate 10,000 examples
    job = random.choice(roles)
    resume_job = random.choice(roles)
    
    job_desc = f"We are hiring a {job} skilled in {', '.join(random.sample(skills[job], 2))}."
    resume_text = f"Experienced {resume_job} familiar with {', '.join(random.sample(skills[resume_job], 2))}."
    
    label = 1 if job == resume_job else 0
    synthetic_data.append({
        "resume": resume_text,
        "job_description": job_desc,
        "label": label
    })

# Save to JSON file
output_path = "./synthetic_resume_job_data.json"
with open(output_path, "w") as f:
    json.dump(synthetic_data, f, indent=2)

output_path
