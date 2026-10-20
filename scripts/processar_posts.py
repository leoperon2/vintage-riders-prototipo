#!/usr/bin/env python3
"""Transforma o JSON do Apify (instagram-scraper) em anúncios.

Uso: python3 scripts/processar_posts.py posts.json [--max-fotos 8]

Gera:
  img/motos/<slug>/<n>.webp   fotos otimizadas (1200px)
  img/motos/<slug>/capa.webp  miniatura (640px)
  data/motos.json             catálogo (fallback do site e base da importação)
"""
import json
import re
import sys
import unicodedata
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
CAMPOS = ["Marca", "Modelo", "Ano", "Km", "Valor", "Contato", "Cidade"]


def slugify(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def campo(legenda, nome):
    m = re.search(rf"^{nome}:[ \t]*(.*)$", legenda, re.M | re.I)
    return m.group(1).strip() if m else ""


def valor_num(t):
    n = re.sub(r"[^\d,]", "", t).split(",")[0]
    return int(n) if n else None


def obs_texto(legenda):
    m = re.search(r"^Obs:[ \t]*(.*?)(?:\nO conte[úu]do|\n#|\Z)", legenda, re.M | re.S | re.I)
    if not m:
        return ""
    linhas = [l.strip(" •⁠\t") for l in m.group(1).splitlines()]
    return "\n".join(l for l in linhas if l)


def parse(post):
    leg = post.get("caption") or ""
    if not (campo(leg, "Marca") and campo(leg, "Modelo")):
        return None
    cidade = re.sub(r"\s*-\s*", "-", campo(leg, "Cidade"))
    ano = campo(leg, "Ano")
    fotos = list(post.get("images") or [])
    if not fotos and post.get("displayUrl"):
        fotos = [post["displayUrl"]]
    return {
        "shortcode": post["shortCode"],
        "marca": campo(leg, "Marca"),
        "modelo": campo(leg, "Modelo"),
        "ano": ano,
        "km": campo(leg, "Km"),
        "valor": valor_num(campo(leg, "Valor")),
        "cidade": cidade,
        "contato": campo(leg, "Contato"),
        "obs": obs_texto(leg),
        "fonte_url": post.get("url") or f"https://www.instagram.com/p/{post['shortCode']}/",
        "publicado_em": post.get("timestamp"),
        "_fotos_src": fotos,
        "_video": post.get("type") == "Video",
    }


def chave(m):
    return (slugify(m["marca"]), slugify(m["modelo"]), slugify(m["ano"]), m["valor"], slugify(m["cidade"]))


def baixar(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return Image.open(BytesIO(r.read())).convert("RGB")


def salvar(img, caminho, largura, q):
    img = img.copy()
    img.thumbnail((largura, largura * 2))
    caminho.parent.mkdir(parents=True, exist_ok=True)
    img.save(caminho, "WEBP", quality=q, method=6)


def processar(m, max_fotos):
    slug = slugify(f"{m['marca']} {m['modelo']} {m['ano']} {m['shortcode']}")
    m["slug"] = slug
    pasta = RAIZ / "img" / "motos" / slug
    fotos = []
    for i, url in enumerate(m["_fotos_src"][:max_fotos], 1):
        try:
            img = baixar(url)
        except Exception as e:  # foto que falha não derruba o anúncio
            print("  falhou", slug, i, e)
            continue
        salvar(img, pasta / f"{i}.webp", 1200, 78)
        if not fotos:
            salvar(img, pasta / "capa.webp", 640, 72)
        fotos.append(f"img/motos/{slug}/{i}.webp")
    m["capa"] = f"img/motos/{slug}/capa.webp" if fotos else None
    m["fotos"] = fotos
    return m


def main():
    args = sys.argv[1:]
    max_fotos = 8
    if "--max-fotos" in args:
        i = args.index("--max-fotos")
        max_fotos = int(args[i + 1])
        del args[i : i + 2]
    posts = json.load(open(args[0], encoding="utf8"))

    unicos = {}
    for p in posts:
        m = parse(p)
        if not m:
            continue
        k = chave(m)
        # prefere o carrossel (várias fotos) ao vídeo do mesmo anúncio
        if k not in unicos or (unicos[k]["_video"] and not m["_video"]):
            unicos[k] = m
    lista = sorted(unicos.values(), key=lambda m: m["publicado_em"] or "", reverse=True)
    print(f"{len(posts)} posts -> {len(lista)} anúncios únicos")

    with ThreadPoolExecutor(6) as ex:
        lista = list(ex.map(lambda m: processar(m, max_fotos), lista))

    for m in lista:
        m.pop("_fotos_src"), m.pop("_video")
        m["status"] = "ativo"
    (RAIZ / "data").mkdir(exist_ok=True)
    json.dump(lista, open(RAIZ / "data" / "motos.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("ok:", sum(len(m["fotos"]) for m in lista), "fotos")


if __name__ == "__main__":
    main()
