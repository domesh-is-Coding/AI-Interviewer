# backend/ml/bert_similarity.py

import sys
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch

resume = sys.argv[1]
job = sys.argv[2]

tokenizer = DistilBertTokenizerFast.from_pretrained("backend/ml/similarity_model")
model = DistilBertForSequenceClassification.from_pretrained("backend/ml/similarity_model")

# Prepare input by concatenating resume and job description with [SEP]
text = f"{resume} [SEP] {job}"
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)

# Predict
with torch.no_grad():
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=1)
    score = probs[0][1].item()

print(f"{score:.4f}")
