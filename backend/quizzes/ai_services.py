
import json
import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "qwen3:4b"


def generate_quiz_questions(source_text, num_questions=5):
    """
    Generate multiple-choice questions from study notes using Ollama.

    Returns a list of validated question dictionaries.
    """

    # Validate the input notes.
    if not isinstance(source_text, str) or not source_text.strip():
        raise ValueError("The study notes do not contain any text.")

    if not isinstance(num_questions, int) or not 1 <= num_questions <= 20:
        raise ValueError("The number of questions must be between 1 and 20.")

    prompt = f"""
/no_think

Create exactly {num_questions} multiple-choice questions using
ONLY the study notes provided below.

Requirements:
- Each question must have exactly four unique answer choices.
- Exactly one choice must be correct.
- Include a short explanation for the correct answer.
- Do not invent facts that are not supported by the notes.
- Return valid JSON only. Do not include Markdown or extra text.

Use this exact structure:
{{
    "questions": [
        {{
            "question_text": "Question goes here",
            "choices": [
                "Answer A",
                "Answer B",
                "Answer C",
                "Answer D"
            ],
            "correct_answer": "Answer A",
            "explanation": "Brief explanation"
        }}
    ]
}}

STUDY NOTES:
{source_text}
"""

    # Send the request to Ollama.
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                "format": "json",
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "repeat_penalty": 1.15,
                    "num_predict": 2048,
                },
            },
            timeout=300,
        )

    except requests.RequestException as exc:
        raise RuntimeError(
            "Could not connect to Ollama. Make sure Ollama is running."
        ) from exc

    # Report HTTP errors with Ollama's actual error message.
    if not response.ok:
        raise RuntimeError(
            f"Ollama returned HTTP {response.status_code}: "
            f"{response.text[:2000]}"
        )

    # Read and parse the AI response.
    try:
        response_data = response.json()

    except ValueError as exc:
        raise RuntimeError(
            "Ollama returned a response that was not valid JSON."
        ) from exc

    message = response_data.get("message") or {}
    content = message.get("content") or ""

    # Check for an empty AI response before parsing it.
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError(
            "Ollama returned empty content. "
            f"Response details: {response_data}"
        )

    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "The AI returned invalid quiz JSON. "
            f"Parsing error: {exc}. "
            f"Response preview: {content[:1000]}"
        ) from exc

    if not isinstance(data, dict):
        raise RuntimeError("The AI response must be a JSON object.")

    questions = data.get("questions")

    # Verify the number of questions.
    if not isinstance(questions, list) or len(questions) != num_questions:
        actual_count = len(questions) if isinstance(questions, list) else 0
        raise RuntimeError(
            f"Expected {num_questions} questions, "
            f"but the AI returned {actual_count}."
        )

    # Validate every generated question.
    for index, question in enumerate(questions, start=1):
        if not isinstance(question, dict):
            raise RuntimeError(
                f"Question {index} has an invalid format."
            )

        question_text = question.get("question_text")
        choices = question.get("choices")
        correct_answer = question.get("correct_answer")
        explanation = question.get("explanation")

        if not isinstance(question_text, str) or not question_text.strip():
            raise RuntimeError(
                f"Question {index} is missing its question text."
            )

        if (
            not isinstance(choices, list)
            or len(choices) != 4
            or not all(
                isinstance(choice, str) and choice.strip()
                for choice in choices
            )
        ):
            raise RuntimeError(
                f"Question {index} must have exactly four "
                "nonempty answer choices."
            )

        if len(set(choices)) != 4:
            raise RuntimeError(
                f"Question {index} has duplicate answer choices."
            )

        if correct_answer not in choices:
            raise RuntimeError(
                f"Question {index} has a correct answer "
                "that does not match any choice."
            )

        if not isinstance(explanation, str) or not explanation.strip():
            raise RuntimeError(
                f"Question {index} is missing its explanation."
            )

    return questions