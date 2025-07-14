from dotenv import load_dotenv
import os
import openai
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")  # Replace this with your actual key

models = openai.models.list()

for model in models:
    print(model.id)
