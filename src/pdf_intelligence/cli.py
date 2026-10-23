"""Command line interface for the PDF Intelligence Pipeline."""

import argparse
import json
import sys
from pathlib import Path

from .config import PipelineConfig
from .corpus import CorpusBuilder
from .search import LocalSearch


def build_parser() -> argparse.ArgumentParser:
    """Build command line argument parser."""
    parser = argparse.ArgumentParser(
        prog="pdf_intelligence",
        description="CIOdD-UCR PDF Intelligence Pipeline V5.6 (Research & RAG Edition)",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Command: run / process
    run_parser = subparsers.add_parser("process", help="Process PDF directory into structured corpus")
    run_parser.add_argument("--input", "-i", type=str, default="./data/pdfs", help="Directory containing PDF files")
    run_parser.add_argument("--output", "-o", type=str, default="./data/pdf_intelligence", help="Output directory")
    run_parser.add_argument("--max-docs", "-m", type=int, default=None, help="Maximum number of PDFs to process")
    run_parser.add_argument("--max-pages", "-p", type=int, default=None, help="Maximum number of pages per PDF to process")
    run_parser.add_argument("--dry-run", action="store_true", help="Profile documents without generating full corpus")
    run_parser.add_argument("--no-ocr", action="store_true", help="Disable adaptive OCR extraction")
    run_parser.add_argument("--no-embeddings", action="store_true", help="Skip sentence-transformers embedding generation")
    run_parser.add_argument("--no-tfidf", action="store_true", help="Skip TF-IDF lexical index creation")

    # Command: search
    search_parser = subparsers.add_parser("search", help="Search the generated corpus using local TF-IDF")
    search_parser.add_argument("query", type=str, help="Search query string")
    search_parser.add_argument("--output", "-o", type=str, default="./data/pdf_intelligence", help="Corpus directory")
    search_parser.add_argument("--top-k", "-k", type=int, default=5, help="Number of results to return")
    search_parser.add_argument("--min-quality", "-q", type=float, default=None, help="Minimum quality score filter")

    # Command: audit
    audit_parser = subparsers.add_parser("audit", help="Inspect integrity report and flagged review pages")
    audit_parser.add_argument("--output", "-o", type=str, default="./data/pdf_intelligence", help="Corpus directory")

    return parser


def main() -> None:
    """Main CLI entrypoint."""
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "process":
        config = PipelineConfig(
            pdf_directory=Path(args.input),
            output_directory=Path(args.output),
            max_documents=args.max_docs,
            max_pages=args.max_pages,
            dry_run=args.dry_run,
            ocr_enabled=not args.no_ocr,
            generate_embeddings=not args.no_embeddings,
            build_tfidf=not args.no_tfidf,
        )
        builder = CorpusBuilder(config)
        builder.process()

    elif args.command == "search":
        searcher = LocalSearch(args.output)
        results = searcher.search_tfidf(
            query=args.query,
            top_k=args.top_k,
            min_quality=args.min_quality,
        )
        print(f"\n🔎 Search Results for: '{args.query}' ({len(results)} matches)\n")
        for i, r in enumerate(results, start=1):
            print(f"[{i}] Score: {r.get('search_score', 0):.4f} | ID: {r['chunk_id']}")
            print(f"    Doc: {r['filename']} | Sec: {r.get('section_title')} | Pages: {r['page_start']}-{r['page_end']}")
            print(f"    Text: {r['text'][:180].strip()}...\n")

    elif args.command == "audit":
        report_path = Path(args.output) / "integrity_report.json"
        if not report_path.exists():
            print(f"Error: {report_path} does not exist.")
            sys.exit(1)
        with open(report_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        print("=" * 80)
        print(f"INTEGRITY AUDIT REPORT — Status: {data.get('status')}")
        print("=" * 80)
        for c in data.get("checks", []):
            detail = f" — {c['detail']}" if c.get("detail") else ""
            print(f"  [{c['status']:<7}] {c['check']}{detail}")
        review = data.get("review_pages", [])
        print(f"\nFlagged Pages for Human Review: {len(review)}")
        for p in review[:15]:
            print(f"  - {p['filename']} p.{p['page_number']} {p['flags']}")
        if len(review) > 15:
            print(f"  ... and {len(review) - 15} more pages.")


if __name__ == "__main__":
    main()
