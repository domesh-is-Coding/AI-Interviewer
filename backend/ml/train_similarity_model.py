# backend/ml/train_similarity_model.py

from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import torch
import json

# Load the data from the synthetic_resume_job_data.json file
with open('synthetic_resume_job_data.json', 'r') as f:
    data = json.load(f)

# Prepare dataset from the loaded data
dataset = Dataset.from_dict({
    "text_pair": [
        (entry["resume"], entry["job_description"]) for entry in data
    ],
    "label": [entry["label"] for entry in data]
})

tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

def tokenize_fn(example):
    # Combine resume and job description as input, separated by [SEP]
    return tokenizer(example["text_pair"][0], example["text_pair"][1], padding="max_length", truncation=True)

encoded_dataset = dataset.map(tokenize_fn)

model = DistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)

training_args = TrainingArguments(
    output_dir="./ml/similarity_model",
    per_device_train_batch_size=2,
    num_train_epochs=4,
    logging_steps=5,
    save_strategy="epoch",
    logging_dir="./ml/logs",
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset
)

trainer.train()
model.save_pretrained("backend/ml/similarity_model")
tokenizer.save_pretrained("backend/ml/similarity_model")

print("✅ Custom similarity model trained and saved.")
