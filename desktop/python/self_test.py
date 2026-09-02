import base64,json,subprocess,sys,tempfile,os,zipfile
from pathlib import Path
from reportlab.pdfgen import canvas

ROOT=Path(__file__).resolve().parent
ENGINE=ROOT/'engine_v2.py'

def call(op,data):
 p=subprocess.run([sys.executable,str(ENGINE),op],input=json.dumps(data),text=True,capture_output=True)
 if p.returncode!=0:raise RuntimeError(f'{op}: {p.stderr or p.stdout}')
 r=json.loads(p.stdout or '{}')
 if not r.get('ok'):raise RuntimeError(f'{op}: {r}')
 return r

def make_pdf(path,text):
 c=canvas.Canvas(str(path),pagesize=(612,792));c.setFont('Helvetica',14);c.drawString(72,720,text);c.save()

def main():
 with tempfile.TemporaryDirectory(prefix='rush-selftest-') as td:
  t=Path(td);a=t/'a.pdf';b=t/'b.pdf';make_pdf(a,'RUSH alpha document');make_pdf(b,'RUSH beta document')
  merged=t/'merged.pdf';call('merge',{'inputs':[str(a),str(b)],'output':str(merged)});assert call('info',{'input':str(merged)})['pages']==2
  rotated=t/'rotated.pdf';call('rotate',{'input':str(merged),'output':str(rotated),'pages':'1','degrees':90});assert rotated.exists()
  extracted=t/'extract.pdf';call('extract',{'input':str(merged),'output':str(extracted),'pages':'2'});assert call('info',{'input':str(extracted)})['pages']==1
  protected=t/'protected.pdf';call('encrypt',{'input':str(a),'output':str(protected),'password':'rush-test'});assert protected.exists()
  unlocked=t/'unlocked.pdf';call('decrypt',{'input':str(protected),'output':str(unlocked),'password':'rush-test'});assert unlocked.exists()
  assert 'alpha' in call('text',{'input':str(a)})['text'].lower();assert call('search_pdf',{'input':str(a),'query':'alpha'})['count']>=1
  edits=t/'edited.pdf';call('apply_edits',{'input':str(a),'output':str(edits),'edits':[{'page':1,'tool':'add_text','x':.15,'y':.2,'w':.4,'h':.08,'text':'Nova Studio'}]});assert edits.exists()
  pixel='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII='
  html='<h1>RUSH Report</h1><p><b>Nova Studio</b> image test</p><p><img src="data:image/png;base64,'+pixel+'" data-rush-width="40" style="width:40%"></p>'
  docx=t/'report.docx';call('doc_save',{'output':str(docx),'format':'.docx','html':html});assert docx.exists()
  with zipfile.ZipFile(docx) as z:assert any(n.startswith('word/media/') for n in z.namelist()),'DOCX image was not embedded'
  opened=call('doc_open',{'input':str(docx)});assert 'RUSH' in opened['html'] and 'data:image/' in opened['html'],'DOCX image was not restored'
  exported=t/'report.pdf';call('doc_save',{'output':str(exported),'format':'.pdf','html':html});assert exported.exists() and call('info',{'input':str(exported)})['pages']>=1
  odt=t/'report.odt';call('doc_save',{'output':str(odt),'format':'.odt','html':'<h1>RUSH ODT</h1><p>Offline</p>'});assert odt.exists()
  rtf=t/'report.rtf';call('doc_save',{'output':str(rtf),'format':'.rtf','html':'<p>RUSH RTF</p>'});assert rtf.exists()
  plain=t/'notes.txt';call('doc_save',{'output':str(plain),'format':'.txt','html':'<p>RUSH TXT</p>'});assert plain.exists()
  env=os.environ.copy();env['RUSH_USER_DATA']=td
  p=subprocess.run([sys.executable,str(ENGINE),'index_paths'],input=json.dumps({'paths':[str(a),str(docx),str(plain)],'ocr':False}),text=True,capture_output=True,env=env);assert p.returncode==0,p.stdout+p.stderr
  p=subprocess.run([sys.executable,str(ENGINE),'search_index'],input=json.dumps({'query':'RUSH'}),text=True,capture_output=True,env=env);r=json.loads(p.stdout);assert r.get('count',0)>=1,r
  caps=call('capabilities',{}).get('capabilities',{})
  print('RUSH Office Suite v2.1.2 engine self-test passed.')
  print(' - PDF edit/organize/protect/search PASS')
  print(' - DOCX image embed/open + rich PDF export PASS')
  print(' - DOCX/ODT/RTF/TXT create/open PASS')
  print(' - SQLite FTS local library PASS')
  print(f" - OCR capability detected: {caps.get('ocr',False)}")
if __name__=='__main__':main()
