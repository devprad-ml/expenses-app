#importing objects and libraries

import json
from datetime import datetime
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.expense import ExpenseCreate
from app.models.expense import ExpenseCategory

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class AIExpenseParser:
    async def parse_text(self, text: str) -> ExpenseCreate:
        """
        Uses GPT 4o-mini 
        """
        valid_categories = [e.value for e in ExpenseCategory]

        system_prompt = f"""
        You are an expense tracker assistant. Extract data from the user's input.
        Return ONLY a JSON object with these keys:
        - description (string): Short summary
        - amount (float): The cost
        - category (string): One of {valid_categories}
        
        If the category is not clear, use "other".
        If the date is mentioned (e.g. "yesterday"), ignore it for now (we default to today).
        Example Input: "Spent $20 on burgers"
        Example Output: {{"description": "Burgers", "amount": 20.0, "category": "food"}} 
        """

        try:
            response = await client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[{
                    {'role': 'system','content': system_prompt},
                    {'role':'user','content': text}
                }],
                temperature= 0
            )

            content = response.choices[0].message.content
            data = json.loads(content)

            # Map str category to this Enum
            # 'other' if LLM hallucinates
            category_str = data.get('category', 'other').lower()
            if category_str not in valid_categories:
                category_str = "other"
            
            return ExpenseCreate(
                description=data.get('description', "unknown Expense"),
                amount=float(data.get("amount",0)),
                category=category_str,
                date=datetime.utcnow()
            )
        
        except Exception as e:
            print(f"AI Parsing Error: {e}")
            # fallback if failure

            return ExpenseCreate(
                description=text,
                amount=0.0,
                category="other"
            )

ai_parser = AIExpenseParser()

