"""Create books and assemble the GitHub Pages publication. Python 3.9+."""
import argparse
import hashlib
import json
import re
import shutil
import sys
import tempfile
from html import escape
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "books"
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
# Books are served at the site root, beside the shelf's own folders.
RESERVED = {"shared"}


def slug(value):
    if not SLUG.fullmatch(value):
        raise ValueError(f"영문 소문자, 숫자, 하이픈으로 경로를 지정하세요: {value}")
    return value


def text(value):
    return escape(str(value), quote=True)


def write_metadata(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def new_book(args):
    folder = BOOKS / slug(args.slug)
    folder.mkdir(exist_ok=False)
    (folder / "manuscript").mkdir()
    write_metadata(folder / "book.json", {
        "title": args.title, "topic": args.topic, "description": args.description,
        "format": "reader", "published": False,
        "chapters": [{"id": "introduction", "title": "들어가며"}]
    })
    (folder / "manuscript/introduction.html").write_text(
        "<p>이 책에서 독자가 답할 수 있게 될 질문을 적으세요.</p>\n"
        "<h2>직접 해보기</h2>\n<p>예제의 조건을 바꾸고 결과를 관찰해 보세요.</p>\n",
        encoding="utf-8")
    print(f"초안 생성: {folder.relative_to(ROOT)}")


def render_reader(folder, book, dest):
    layout = Template((ROOT / "templates/reader.html").read_text(encoding="utf-8"))
    chapters = book["chapters"]
    ids = [slug(c["id"]) for c in chapters]
    if not ids or len(ids) != len(set(ids)):
        raise ValueError(f"{folder.name}: 장이 비어 있거나 장 ID가 중복됩니다.")
    values = {key: text(book[key]) for key in ("title", "topic", "description")}
    items = "".join(f'<li><a href="read/{c["id"]}.html">{text(c["title"])}</a></li>' for c in chapters)
    content = f'<p>{values["description"]}</p><h2>목차</h2><ol>{items}</ol>'
    (dest / "index.html").write_text(layout.substitute(
        values, page_title=values["title"], root="../", book_home="./",
        heading=values["title"], content=content), encoding="utf-8")
    (dest / "read").mkdir()
    for i, chapter in enumerate(chapters):
        source = folder / "manuscript" / (ids[i] + ".html")
        article = source.read_text(encoding="utf-8")
        nav = ['<a href="../">목차</a>']
        if i:
            nav.insert(0, f'<a rel="prev" href="{ids[i-1]}.html">← 이전 장</a>')
        if i+1 < len(chapters):
            nav.append(f'<a rel="next" href="{ids[i+1]}.html">다음 장 →</a>')
        heading = text(chapter["title"])
        (dest / "read" / (ids[i]+".html")).write_text(layout.substitute(
            values, root="../../", book_home="../", page_title=heading,
            heading=heading, content=f'<article>{article}</article><nav aria-label="장 이동">{" ".join(nav)}</nav>'
        ), encoding="utf-8")
    return [f"{len(chapters)}개 장"]


ASSET = re.compile(r'((?:src|href)=")([^":?#]+\.(?:css|js))"')


def fingerprint(dest):
    """Version local CSS/JS links by content so browsers never mix old and new files."""
    for page in dest.rglob("*.html"):
        def stamp(m):
            target = (page.parent / m.group(2)).resolve()
            if not target.is_file():
                return m.group(0)
            digest = hashlib.sha256(target.read_bytes()).hexdigest()[:10]
            return f'{m.group(1)}{m.group(2)}?v={digest}"'
        html = page.read_text(encoding="utf-8")
        page.write_text(ASSET.sub(stamp, html), encoding="utf-8")


def book_card(folder, book, facts):
    path = f'./{folder.name}/'
    title = text(book["title"])
    cover = book.get("cover")
    if cover and (Path(cover).name != cover or not (folder / cover).is_file()):
        raise ValueError(f"{folder.name}: 표지 파일을 확인하세요.")
    face = f'<img src="{path}{text(cover)}" alt="">' if cover else f'<span class="type-cover">{title}</span>'
    details = "".join(f"<li>{text(v)}</li>" for v in facts)
    links = "".join(f'<li><a href="{path}{text(l["href"])}"><span>{text(l["kind"])}</span>{text(l["label"])} ↗</a></li>'
                    for l in book.get("links", []))
    shortcuts = f'<ul class="jump">{links}</ul>' if links else ""
    return f"""<article class="volume"><div class="display"><a class="book" href="{path}" aria-label="{title} 열기">{face}</a></div>
<div class="blurb"><span class="topic">{text(book["topic"])}</span><h3><a href="{path}">{title}</a></h3><p>{text(book["description"])}</p>
<ul class="facts">{details}</ul><a class="read" href="{path}">책 펼치기　→</a>{shortcuts}</div></article>"""


def build(args):
    cards = []
    with tempfile.TemporaryDirectory(dir=ROOT, prefix=".shelf-build-") as temporary:
        stage = Path(temporary)
        shutil.copytree(ROOT / "shared", stage / "shared")
        (stage / ".nojekyll").touch()
        for meta in sorted(BOOKS.glob("*/book.json")):
            book = json.loads(meta.read_text(encoding="utf-8"))
            folder = meta.parent
            if slug(folder.name) in RESERVED:
                raise ValueError(f"{folder.name}: 서가가 사용하는 경로와 겹칩니다.")
            if not isinstance(book["published"], bool):
                raise ValueError(f"{folder.name}: published 값은 true 또는 false여야 합니다.")
            if not book["published"] and not args.drafts:
                continue
            dest = stage / folder.name
            shutil.copytree(folder, dest, ignore=shutil.ignore_patterns("book.json", "manuscript", ".*"))
            if book["format"] == "reader":
                facts = render_reader(folder, book, dest)
            elif book["format"] == "custom" and (dest / "index.html").is_file():
                facts = book.get("details", [])
            else:
                raise ValueError(f"{folder.name}: reader 또는 index.html이 있는 custom 형식이 필요합니다.")
            fingerprint(dest)
            if not book["published"]:
                facts = ["초안", *facts]
            cards.append(book_card(folder, book, facts))
        template = (ROOT / "templates/shelf.html").read_text(encoding="utf-8")
        (stage / "index.html").write_text(template.replace("{{count}}", str(len(cards))).replace(
            "{{books}}", "\n".join(cards)), encoding="utf-8")
        output = ROOT / ("_preview" if args.drafts else "_site")
        # Only replace directories previously created by this command.
        marker = ".shelf-output"
        if output.exists():
            if output.is_symlink() or not (output / marker).is_file():
                raise ValueError(f"출력 폴더가 이 도구로 생성되지 않았습니다: {output}")
            shutil.rmtree(output)
        shutil.copytree(stage, output)
        (output / marker).touch()
        print(f"{len(cards)}권 생성 → {output.relative_to(ROOT)}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("new", help="새 책 초안 생성")
    create.add_argument("slug")
    for field in ("title", "topic", "description"):
        create.add_argument("--"+field, required=True)
    create.set_defaults(run=new_book)
    compile_site = commands.add_parser("build", help="출간 서가 생성")
    compile_site.add_argument("--drafts", action="store_true", help="초안 포함 별도 미리보기")
    compile_site.set_defaults(run=build)
    args = parser.parse_args()
    try:
        args.run(args)
    except (OSError, ValueError, KeyError) as exc:
        sys.exit(str(exc))
