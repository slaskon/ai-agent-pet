#!/usr/bin/env python3
import argparse
from datetime import datetime
from pathlib import Path

HISTORY_FILE = Path(__file__).parent / 'prompt_history.txt'


def append_prompt(prompt: str) -> None:
    history = HISTORY_FILE
    history.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
    with history.open('a', encoding='utf-8') as file:
        file.write(f'[{timestamp}] {prompt.strip()}\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Append a prompt to prompt_history.txt')
    parser.add_argument('prompt', nargs='+', help='The prompt text to append')
    args = parser.parse_args()
    append_prompt(' '.join(args.prompt))
