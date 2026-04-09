"use client";

import React from "react";

export default function ContractDocument({
  markdown,
  sellerSignature,
  buyerSignature,
}: {
  markdown: string;
  sellerSignature?: string | null;
  buyerSignature?: string | null;
}) {
  return (
    <div className="contract-page-wrap">
      <div className="contract-page">
        {renderMarkdown(markdown, { sellerSignature, buyerSignature })}
      </div>
      <style jsx>{`
        .contract-page-wrap {
          background: #525659;
          padding: 24px 0;
          display: flex;
          justify-content: center;
        }
        .contract-page {
          width: 210mm;
          min-height: 297mm;
          max-width: 100%;
          background: white;
          padding: 25mm 22mm;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          font-family: "Nanum Myeongjo", "Batang", "바탕", "Times New Roman", serif;
          font-size: 11pt;
          line-height: 1.75;
          color: #1f2937;
        }
        .contract-page :global(h1) {
          font-size: 22pt;
          text-align: center;
          font-weight: bold;
          margin: 0 0 24pt 0;
          padding-bottom: 12pt;
          border-bottom: 3px double #1f2937;
          letter-spacing: 6px;
        }
        .contract-page :global(h2) {
          font-size: 13pt;
          font-weight: bold;
          margin: 18pt 0 6pt 0;
        }
        .contract-page :global(h3) {
          font-size: 11pt;
          font-weight: bold;
          margin: 12pt 0 4pt 0;
        }
        .contract-page :global(p) {
          margin: 6pt 0;
          text-align: justify;
          text-indent: 0;
        }
        .contract-page :global(hr) {
          border: 0;
          border-top: 1px solid #9ca3af;
          margin: 18pt 0;
        }
        .contract-page :global(strong) {
          font-weight: bold;
        }
        .contract-page :global(em) {
          font-style: italic;
          color: #6b7280;
          font-size: 9pt;
        }

        /* 계약서용 무테두리 표 */
        .contract-page :global(.cd-table) {
          width: 100%;
          border-collapse: collapse;
          margin: 8pt 0 12pt 0;
          font-size: 11pt;
        }
        .contract-page :global(.cd-table td) {
          padding: 4pt 8pt 5pt 8pt;
          vertical-align: baseline;
          border: none;
        }
        .contract-page :global(.cd-table td:first-child) {
          width: 90pt;
          font-weight: 600;
          color: #374151;
          text-align: justify;
          text-align-last: justify;
          padding-right: 6pt;
          white-space: nowrap;
        }
        .contract-page :global(.cd-table td:first-child::after) {
          content: " :";
        }
        .contract-page :global(.cd-table td:not(:first-child)) {
          border-bottom: 1px solid #9ca3af;
        }

        /* :::parties 양 당사자 좌우 배치 */
        .contract-page :global(.cd-parties) {
          margin: 16pt 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14pt;
          page-break-inside: avoid;
        }
        .contract-page :global(.cd-party) {
          border: 1px solid #6b7280;
          padding: 10pt 12pt;
        }
        .contract-page :global(.cd-party-title) {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 4pt;
          padding-bottom: 3pt;
          border-bottom: 1px solid #d1d5db;
        }
        .contract-page :global(.cd-party-row) {
          display: flex;
          align-items: baseline;
          margin: 2pt 0;
          font-size: 10pt;
        }
        .contract-page :global(.cd-party-label) {
          flex: 0 0 auto;
          width: 70pt;
          text-align: justify;
          text-align-last: justify;
          padding-right: 8pt;
        }
        .contract-page :global(.cd-party-value) {
          flex: 1 1 auto;
          border-bottom: 1px solid #d1d5db;
          padding: 0 2pt 1pt 2pt;
          min-height: 14pt;
        }

        /* ::right 우측 정렬 단락 (날짜용) */
        .contract-page :global(.cd-right) {
          text-align: right;
          margin: 12pt 0;
          font-weight: 600;
        }

        .contract-page :global(.contract-sig) {
          display: inline-block;
          height: 30pt;
          vertical-align: middle;
          margin-left: 4pt;
          background: white;
          mix-blend-mode: multiply;
        }

        @media print {
          .contract-page-wrap {
            background: white;
            padding: 0;
          }
          .contract-page {
            box-shadow: none;
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  );
}

type SigCtx = {
  sellerSignature?: string | null;
  buyerSignature?: string | null;
};

function renderMarkdown(md: string, sigs: SigCtx = {}): React.ReactNode {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 헤딩
    if (line.startsWith("# ")) {
      out.push(<h1 key={key++}>{line.slice(2)}</h1>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(<h2 key={key++}>{line.slice(3)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(<h3 key={key++}>{line.slice(4)}</h3>);
      i++;
      continue;
    }

    // hr
    if (line.trim() === "---") {
      out.push(<hr key={key++} />);
      i++;
      continue;
    }

    // ::right 단락
    if (line.trim() === "::right") {
      i++;
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing :::
      out.push(
        <p key={key++} className="cd-right">
          {renderInline(buf.join(" ").trim(), sigs)}
        </p>,
      );
      continue;
    }

    // markdown 표 (무테두리 계약서 스타일)
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      out.push(renderContractTable(tableLines, key++, sigs));
      continue;
    }

    // :::parties 두 당사자 블록
    if (line.trim() === ":::parties") {
      i++;
      // @@<title> 으로 구분
      const groups: { title: string; rows: string[] }[] = [];
      let cur: { title: string; rows: string[] } | null = null;
      while (i < lines.length && lines[i].trim() !== ":::") {
        const ln = lines[i];
        if (ln.startsWith("@@")) {
          cur = { title: ln.slice(2).trim(), rows: [] };
          groups.push(cur);
        } else if (cur && ln.trim()) {
          cur.rows.push(ln);
        }
        i++;
      }
      i++;
      out.push(
        <div key={key++} className="cd-parties">
          {groups.map((g, gi) => (
            <div key={gi} className="cd-party">
              <div className="cd-party-title">{g.title}</div>
              {g.rows.map((r, ri) => {
                const idx = r.indexOf(":");
                const label = idx >= 0 ? r.slice(0, idx).trim() : r;
                const value = idx >= 0 ? r.slice(idx + 1).trim() : "";
                return (
                  <div key={ri} className="cd-party-row">
                    <span className="cd-party-label">{label}</span>
                    <span className="cd-form-sep">:</span>
                    <span className="cd-party-value">
                      {renderInline(value, sigs)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>,
      );
      continue;
    }

    // 빈 줄
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 일반 단락
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("|") &&
      lines[i].trim() !== "---" &&
      !lines[i].trim().startsWith(":::") &&
      lines[i].trim() !== "::right"
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(<p key={key++}>{renderInline(para.join(" "), sigs)}</p>);
  }
  return out;
}

function renderContractTable(
  lines: string[],
  key: number,
  sigs: SigCtx,
): React.ReactNode {
  const rows = lines
    .map((l) => l.trim())
    .filter((l) => l && !/^\|[-:\s|]+\|$/.test(l))
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim()),
    );
  if (rows.length === 0) return null;

  return (
    <table key={key} className="cd-table">
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((c, ci) => (
              <td key={ci}>{c ? renderInline(c, sigs) : "\u00a0"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderInline(text: string, sigs: SigCtx = {}): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const regex = /(\{\{SIG:(SELLER|BUYER)\}\}|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("{{SIG:")) {
      const which = m[2];
      const url = which === "SELLER" ? sigs.sellerSignature : sigs.buyerSignature;
      if (url) {
        nodes.push(
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key++}
            src={url}
            alt={which === "SELLER" ? "매도인 서명" : "매수인 서명"}
            className="contract-sig"
          />,
        );
      } else {
        nodes.push("(인)");
      }
    } else if (tok.startsWith("**")) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
