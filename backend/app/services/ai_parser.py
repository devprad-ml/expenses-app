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
        Uses GPT-4o-mini to extract structured expense data from natural language.
        """
        
        # Get list of valid categories to guide the AI
        valid_categories = [e.value for e in ExpenseCategory]
        
        system_prompt = f"""
        You are an expense tracker assistant. Extract data from the user's input.
        Return ONLY a JSON object (no markdown, no explanations) with these keys:
        - description (string): Short summary
        - amount (float): The cost (numeric only, no currency symbols)
        - category (string): One of {valid_categories}
        
        If the category is not clear, use "other".
        Example Input: "Spent $20 on burgers"
        Example Output: {{"description": "Burgers", "amount": 20.0, "category": "food"}} 
        """

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini", # <--- UPDATED MODEL
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0
            )
            
            content = response.choices[0].message.content
            
            # --- FIX: Clean up Markdown Code Blocks ---
            # GPT often wraps JSON in ```json ... ```. We must remove that.
            cleaned_content = content.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(cleaned_content)
            
            # Map string category to Enum
            category_str = data.get("category", "other").lower()
            if category_str not in valid_categories:
                category_str = "other"
                
            return ExpenseCreate(
                description=data.get("description", "Unknown Expense"),
                amount=float(data.get("amount", 0)),
                category=category_str,
                date=datetime.utcnow()
            )
            
        except Exception as e:
            # --- DEBUGGING ---
            print(f"\n❌ AI PARSING ERROR: {e}")
            if 'content' in locals():
                print(f"RAW AI RESPONSE: {content}\n")
            
            # Fallback
            return ExpenseCreate(
                description=text, 
                amount=0.0, 
                category="other"
            )

ai_parser = AIExpenseParser()