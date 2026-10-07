"""Export the generated coverage without inferring undocumented party positions."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
def read(name):
    return json.loads((root / 'src/data' / (name + '.json')).read_text())

questions, parties, proposals, sources = map(read, ['questions', 'parties', 'proposals', 'sources'])
report = read('quality-report')
by_id = {p['id']: p for p in proposals}
fields = ['partyId', 'party', 'issueId', 'question', 'status', 'stance', 'summary',
          'sourceUrl', 'proposalIds', 'consultedSourceIds', 'lastVerified']
path = root / 'docs' / ('comparison-coverage-' + report['lastVerified'] + '.csv')
with path.open('w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fields, lineterminator='\n')
    writer.writeheader()
    for question in questions:
        for party in parties:
            position = question['positions'][party['id']]
            history = [by_id[id] for id in position['proposalIds']]
            status = ('comparable' if position['position'] is not None else
                      'conflict' if position['conflict'] else
                      'related' if history else 'no_comparable_evidence')
            writer.writerow({
                'partyId': party['id'], 'party': party['name'], 'issueId': question['issueId'],
                'question': question['statement'], 'status': status,
                'stance': position.get('stance') or '',
                'summary': position['summary'] if status == 'comparable' or not history else
                           ' | '.join(dict.fromkeys(p['neutralSummary'] for p in history)),
                'sourceUrl': position.get('sourceUrl') or
                             ' | '.join(dict.fromkeys(p['sourceUrl'] for p in history)),
                'proposalIds': ' | '.join(position['proposalIds']),
                'consultedSourceIds': ' | '.join(s['id'] for s in sources if party['id'] in s['partyIds']),
                'lastVerified': report['lastVerified'],
            })
print(f'{len(questions) * len(parties)} casillas exportadas a {path.relative_to(root)}')
