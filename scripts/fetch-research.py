import urllib.request, json, hashlib, pathlib, sys, concurrent.futures
from pypdf import PdfReader
ROOT=pathlib.Path(__file__).resolve().parent.parent

def fetch(item):
    ident,url=item
    try:
        request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; VotoCiego source verification)'})
        with urllib.request.urlopen(request,timeout=45) as response:
            body=response.read(); final=response.url; status=response.status; content_type=response.headers.get('Content-Type','')
        ext='pdf' if body.startswith(b'%PDF') else 'html'
        path=ROOT/'research/documents'/f'{ident}.{ext}';path.write_bytes(body)
        record={'id':ident,'url':url,'resolvedUrl':final,'status':status,'contentType':content_type,'sha256':hashlib.sha256(body).hexdigest(),'lastVerified':'2026-10-07','localFile':str(path.relative_to(ROOT))}
        if ext=='pdf':
            reader=PdfReader(path)
            pages=[page.extract_text() or '' for page in reader.pages]
            (ROOT/'research/text'/f'{ident}.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2))
            (ROOT/'research/text'/f'{ident}.txt').write_text('\n\n'.join(f'=== PÁGINA PDF {i+1} ===\n'+text for i,text in enumerate(pages)))
            record['pages']=len(pages)
        else:
            (ROOT/'research/text'/f'{ident}.txt').write_text(body.decode('utf-8',errors='replace'))
        print(json.dumps(record,ensure_ascii=False),flush=True);return record
    except Exception as exc:
        record={'id':ident,'url':url,'status':'unavailable','error':str(exc),'lastVerified':'2026-10-07'}
        print(json.dumps(record,ensure_ascii=False),flush=True);return record
if __name__=='__main__':
    pairs=json.load(open(sys.argv[1]))
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: records=list(pool.map(fetch,pairs.items()))
    (ROOT/'research/checks'/f'{pathlib.Path(sys.argv[1]).stem}.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
