import re
import json

def parse_file(path):
    topics = []
    current = None
    desc_lines = []
    header_re = re.compile(r'^\d+\.\s+(.+)$')

    topic_number = 1

    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            m = header_re.match(line)
            if m:
                # flush previous
                if current:
                    current['questions'] = extract_questions(' '.join(desc_lines))
                    topics.append(current)
                # start new topic
                current = {'name': f"{topic_number}. {m.group(1)}", 'questions': []}
                topic_number = topic_number + 1
                desc_lines = []
                continue
            # stop at sample-problems marker
            if line.startswith('Примерни задачи'):
                continue
            # if not a header, accumulate
            if current:
                desc_lines.append(line)

    # flush last
    if current:
        current['questions'] = extract_questions(' '.join(desc_lines))
        topics.append(current)

    return {'topics': topics}

def extract_questions(text):
    parts = []
    # 1) split sentences
    for sent in re.split(r'\.\s+', text):
        sent = sent.strip().rstrip('.')
        if sent:
            parts.append({'q': sent, 'a': ''})
    return parts

# run it

result = parse_file('raw')  # or your real path
with open('output.json', 'w', encoding='utf-8') as out_f:
    json.dump(result, out_f, ensure_ascii=False, indent=2)