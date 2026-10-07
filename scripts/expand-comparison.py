"""Apply manually reviewed evidence without overwriting the initial corpus.

The manifest contains literal excerpts reviewed against the indicated pages or
official statements. This script only checks and imports those decisions; it
never discovers or infers a political position from keywords.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'src/data'
MANIFEST = ROOT / 'docs/comparison-evidence.json'


def read(name):
    return json.loads((DATA / f'{name}.json').read_text())


def save(name, value):
    (DATA / f'{name}.json').write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def normalize(text):
    return ' '.join(text.split())


def main():
    manifest = json.loads(MANIFEST.read_text())
    sources = {source['id']: source for source in read('sources')}
    proposals = {proposal['id']: proposal for proposal in read('proposals')}
    issues = {issue['id']: issue for issue in read('issues')}
    parties = read('parties')
    for source in manifest['sources']:
        if source.get('localFile') and source.get('sha256'):
            assert hashlib.sha256((ROOT / source['localFile']).read_bytes()).hexdigest() == source['sha256']
        sources[source['id']] = source
    for reviewed in manifest['proposals']:
        source = sources[reviewed['sourceId']]
        assert reviewed['partyId'] in source['partyIds']
        pages = json.loads((ROOT / f"research/text/{source['id']}.json").read_text())
        indices = reviewed['sourcePages']
        assert all(0 < page <= len(pages) for page in indices)
        text = normalize(' '.join(pages[page - 1] for page in indices) if source['pageCount'] else ' '.join(pages))
        assert normalize(reviewed['originalText']) in text, reviewed['id'] + ': quotation missing'
        comparable = reviewed['stance'] != 'related'
        assert not comparable or reviewed['stanceDirection'] in [-1, 1]
        assert not comparable or reviewed['certainty'] in ['high', 'medium']
        proposal = {key: source[key] for key in ['sourceTitle', 'sourceUrl', 'sourceDate', 'sourceDateLabel', 'datePrecision', 'sourceType', 'election', 'electionDate', 'lastVerified', 'validity', 'demo']}
        proposal.update(reviewed, categories=issues[reviewed['issueId']]['categories'], sourcePage=indices[0] if indices else None,
                        comparisonEligible=comparable, documentHash=source['sha256'], editorialReview=manifest['reviewMethod'])
        proposals[proposal['id']] = proposal
    for party in parties:
        for source in manifest['sources']:
            if party['id'] in source['partyIds'] and source['sourceType'] in ['electoral_program', 'programmatic_document']:
                entry = dict(sourceId=source['id'], title=source['sourceTitle'], election=source['election'], date=source['sourceDate'], url=source['sourceUrl'], lastVerified=source['lastVerified'])
                party['programs'] = [item for item in party['programs'] if item['sourceId'] != source['id']] + [entry]
        party['lastVerified'] = manifest['lastVerified']
    save('sources', list(sources.values()))
    save('proposals', list(proposals.values()))
    save('parties', parties)
    print(f"{len(manifest['proposals'])} reviewed records imported; {len(proposals)} total. Run npm run generate-data next.")


if __name__ == '__main__':
    main()
