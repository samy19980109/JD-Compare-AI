from app.schemas.chat import ChatRequest, JDInput
from app.services.llm.base import PromptParts

SYSTEM_INSTRUCTIONS = """You are JD-Compare AI, an expert career advisor that helps candidates compare and analyze multiple job descriptions side by side.

RULES:
- Always refer to jobs by their labels (e.g., "Senior Engineer @ Google") rather than generic references.
- When comparing, be specific and cite exact phrases from the JDs.
- If a JD is marked as [MUTED], acknowledge its existence but do not focus analysis on it unless the user explicitly asks.
- Provide balanced, actionable advice. Do not make decisions for the user.
- When asked scenario questions (e.g., "Which is best for transitioning to management?"), evaluate all active JDs against the scenario criteria.
- Flag contradictions or conflicts between JDs explicitly.

OUTPUT FORMAT:
- Be direct, short, and to the point. Avoid unnecessary explanations or filler text.
- Use markdown formatting sparingly.
- Use bold for job labels when referencing them.
- Use tables for structured comparisons only when essential.
- Use bullet points for lists when there are 3+ items.
- Keep responses concise; aim for 2-4 sentences unless detailed analysis is specifically requested."""

MAX_HISTORY_MESSAGES = 15


def _build_jd_block(jd_cards: list[JDInput]) -> str:
    if not jd_cards:
        return "=== NO JOB DESCRIPTIONS PROVIDED ==="

    lines = ["=== JOB DESCRIPTIONS ===\n"]
    active_count = 0
    muted_count = 0

    for i, jd in enumerate(jd_cards, start=1):
        label = jd.label_title or f"Job {i}"
        if jd.label_company:
            label = f"{label} @ {jd.label_company}"

        status = "MUTED" if jd.is_muted else "ACTIVE"
        if jd.is_muted:
            muted_count += 1
        else:
            active_count += 1

        lines.append(f"--- JOB {i}: {label} [{status}] ---")
        lines.append(jd.text.strip())
        lines.append("")

    lines.append("=== END JOB DESCRIPTIONS ===")
    lines.append(f"Total Active JDs: {active_count} | Muted JDs: {muted_count}")

    return "\n".join(lines)


def build_prompt_parts(request: ChatRequest) -> PromptParts:
    jd_block = _build_jd_block(request.jd_cards)
    history = request.messages[-MAX_HISTORY_MESSAGES:]

    return PromptParts(
        system_instructions=SYSTEM_INSTRUCTIONS,
        jd_block=jd_block,
        history=history,
        user_message=request.user_message,
    )
