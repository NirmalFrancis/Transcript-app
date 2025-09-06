import re
from datetime import datetime

def generate_mom(text: str) -> dict:
    # Extract participants
    participants = set()
    matches1 = re.findall(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+will be doing', text)
    matches2 = re.findall(r'will be done by\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)', text)
    participants.update(matches1)
    participants.update(matches2)
    participants = list(participants)

    # Extract action items
    deadline_match = re.search(r'\b\d{1,2}(?:th|st|nd|rd)?\s+\w+\s+\d{1,2}p?m\b', text)
    deadline = deadline_match.group(0) if deadline_match else None

    clauses = re.split(r',|\.|\n', text)
    action_items = []

    for clause in clauses:
        clause = clause.strip()
        if not clause:
            continue

        match1 = re.match(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+will be doing\s+(.*)', clause)
        if match1:
            person, task = match1.groups()
            action_items.append({"task": task.strip(), "owner": person.strip(), "deadline": deadline})
            continue

        match2 = re.match(r'(.*)\s+will be done by\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)', clause)
        if match2:
            task, person = match2.groups()
            action_items.append({"task": task.strip(), "owner": person.strip(), "deadline": deadline})

    # Generate agenda
    sentences = re.split(r'[.]\s*', text)
    agenda_sentences = [s.strip() for s in sentences if s.strip() and not re.search(r'will be doing|will be done by|deadline', s)]
    agenda = '. '.join(agenda_sentences)
    if agenda:
        agenda += '.'

    return {
        "date": datetime.today().strftime("%Y-%m-%d"),
        "participants": participants,
        "agenda": agenda,
        "key_decisions": [],
        "action_items": action_items,
        "next_meeting": None
    }
