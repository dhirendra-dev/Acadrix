import { ExternalLink, FileText, Maximize2 } from "lucide-react";

export default function PdfViewer({ resource }) {
  const pdfUrl = resource.pdfUrl;
  return <section className="study-panel pdf-panel"><div className="study-panel-header"><div><span className="eyebrow"><FileText size={13} /> Document viewer</span><h2>Read alongside your notes</h2></div><a className="viewer-open-link" href={pdfUrl} target="_blank" rel="noreferrer">Open full screen <ExternalLink size={14} /></a></div><div className="pdf-frame-wrap"><iframe title={`${resource.title} PDF viewer`} src={pdfUrl} className="pdf-frame" /></div><div className="pdf-footer"><span>Built-in browser PDF viewer</span><a href={pdfUrl} target="_blank" rel="noreferrer"><Maximize2 size={13} /> Expand document</a></div></section>;
}
