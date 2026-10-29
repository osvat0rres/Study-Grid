

import json
import re
import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "qwen3:4b"


def normalize_answer(text):
    """
    Normalize an answer by ignoring punctuation,
    capitalization, and whitespace.
    """
    return re.sub(r"[^a-z0-9]+", "", text.casefold())


def generate_quiz_questions(source_text, num_questions=5):
    """
    Generate multiple-choice questions from study notes using Ollama.

    Returns a list of validated question dictionaries.
    Each question contains:
        - question_text
        - choices
        - correct_answer
        - explanation
    """

    # Validate the input notes.
    if not isinstance(source_text, str) or not source_text.strip():
        raise ValueError("The study notes do not contain any text.")

    if not isinstance(num_questions, int) or not 1 <= num_questions <= 20:
        raise ValueError("The number of questions must be between 1 and 20.")

    prompt = f"""
/no_think

Generate exactly {num_questions} multiple-choice questions
using ONLY the study notes provided below.

Requirements:
- Every question must have non-empty question_text.
- Every question must have exactly four unique choices.
- correct_answer must exactly match one of the four choices.
- Every question must have a non-empty explanation.
- Exactly one choice must be correct.
- Do not invent facts that are not supported by the notes.
- Do not return option letters as correct_answer.
- Return valid JSON only, without Markdown or commentary.
- Do not include a thinking process in the response.

Use this JSON structure:
{{
    "questions": [
        {{
            "question_text": "What is photosynthesis?",
            "choices": [
                "The process plants use to make food",
                "The process animals use to breathe",
                "The process water uses to freeze",
                "The process rocks use to form"
            ],
            "correct_answer": "The process plants use to make food",
            "explanation": "Plants use light energy to make glucose."
        }}
    ]
}}

The example illustrates the format only. Generate questions
appropriate to the actual study notes.

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
                "think": False,
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
            "Could not connect to Ollama. "
            "Make sure Ollama is running."
        ) from exc

    # Handle HTTP errors.
    if not response.ok:
        raise RuntimeError(
            f"Ollama returned HTTP {response.status_code}: "
            f"{response.text[:2000]}"
        )

    # Parse Ollama's response.
    try:
        response_data = response.json()
    except ValueError as exc:
        raise RuntimeError(
            "Ollama returned a response that was not valid JSON."
        ) from exc

    message = response_data.get("message") or {}
    content = message.get("content") or ""

    if not isinstance(content, str) or not content.strip():
        raise RuntimeError(
            "Ollama returned empty content. "
            f"Response details: {response_data}"
        )

    # Parse the generated quiz JSON.
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

    # Verify the requested number of questions.
    if not isinstance(questions, list) or len(questions) != num_questions:
        actual_count = len(questions) if isinstance(questions, list) else 0
        raise RuntimeError(
            f"Expected {num_questions} questions, "
            f"but the AI returned {actual_count}."
        )

    # Validate every question.
    for index, question in enumerate(questions, start=1):
        if not isinstance(question, dict):
            raise RuntimeError(
                f"Question {index} has an invalid format."
            )

        # Repair a malformed AI response where the question text
        # was accidentally used as a dictionary key.
        if "question_text" not in question:
            possible_question_keys = [
                key
                for key in question.keys()
                if isinstance(key, str)
                and key.strip().endswith("?")
            ]

            if len(possible_question_keys) == 1:
                malformed_key = possible_question_keys[0]
                question["question_text"] = malformed_key.strip()
                question.pop(malformed_key)

        question_text = question.get("question_text")
        choices = question.get("choices")
        correct_answer = question.get("correct_answer")
        explanation = question.get("explanation")

        # Validate question text.
        if not isinstance(question_text, str) or not question_text.strip():
            raise RuntimeError(
                f"Question {index} is missing its question text. "
                f"AI returned: {question!r}"
            )

        # Validate choices.
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

        # Normalize choices and reject duplicates.
        normalized_choices = [
            normalize_answer(choice) for choice in choices
        ]

        if (
            any(not choice for choice in normalized_choices)
            or len(set(normalized_choices)) != 4
        ):
            raise RuntimeError(
                f"Question {index} has duplicate or invalid "
                "answer choices."
            )

        # Validate the correct answer.
        if not isinstance(correct_answer, str) or not correct_answer.strip():
            raise RuntimeError(
                f"Question {index} is missing its correct answer."
            )

        normalized_answer = normalize_answer(correct_answer)

        matching_choices = [
            choice
            for choice in choices
            if normalize_answer(choice) == normalized_answer
        ]

        if len(matching_choices) == 1:
            # Save the exact original choice text.
            question["correct_answer"] = matching_choices[0]

        elif correct_answer.strip().upper() in ["A", "B", "C", "D"]:
            # Support a standalone answer letter.
            answer_index = ["A", "B", "C", "D"].index(
                correct_answer.strip().upper()
            )
            question["correct_answer"] = choices[answer_index]

        else:
            raise RuntimeError(
                f"Question {index} has a correct answer that "
                f"does not match any choice. "
                f"Answer: {correct_answer!r}; choices: {choices!r}"
            )

        # Validate the explanation.
        if not isinstance(explanation, str) or not explanation.strip():
            raise RuntimeError(
                f"Question {index} is missing its explanation."
            )

    return questions
