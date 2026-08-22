import sys
import engine
import advanced


def op_capabilities_v2(p):
    caps = {
        'pdfium': True,
        'pdfEditing': True,
        'docx': engine.Document is not None,
        'odt': engine.OpenDocumentText is not None,
        'rtf': True,
        'txt': True,
        'legacyDocConverter': bool(engine.find_converter()),
        'ocr': engine.tess_ready(),
        'sqliteFts': True,
        'duckdb': engine.duckdb is not None,
        **advanced.capabilities(),
    }
    engine.out(capabilities=caps)


engine.OPS['sign_pdf'] = lambda p: advanced.op_sign_pdf(p, engine.out)
engine.OPS['translate_document'] = lambda p: advanced.op_translate_document(p, engine.out)
engine.OPS['capabilities'] = op_capabilities_v2

if __name__ == '__main__':
    try:
        if len(sys.argv) < 2:
            raise ValueError('Missing operation')
        op = sys.argv[1]
        if op not in engine.OPS:
            raise ValueError(f'Unknown operation: {op}')
        engine.OPS[op](engine.payload())
    except Exception as exc:
        engine.fail(exc)
