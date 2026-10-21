#!/usr/bin/env python3
"""Converte o acervo coletado do site antigo (detalhes.jsonl) em data/acervo.json + capas.

Uso: python3 scripts/processar_acervo.py detalhes.jsonl

Cada linha do jsonl: {url, name, price, desc, brand, img, imgs, ...}
Gera img/acervo/<slug>.webp (560px) e data/acervo.json (acervo histórico do site antigo).
O site antigo marca tudo como "esgotado", então o status é "acervo" (disponibilidade a confirmar).
"""
import html
import json
import re
import sys
import time
import unicodedata
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
CHAVES = ["Marca", "Modelo", "Ano", "Km", "Valor", "Contato", "Cidade", "Obs"]
MARCAS = {"harley-davidson": "Harley-Davidson", "harley davidson": "Harley-Davidson", "bmw": "BMW", "ktm": "KTM",
          "cz": "CZ", "nsu": "NSU", "bsa": "BSA", "mv agusta": "MV Agusta", "dkw": "DKW", "fbm": "FBM", "gas gas": "Gas Gas"}


def slugify(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def marca_nome(m):
    m = re.sub(r"\s+", " ", (m or "").strip())
    return MARCAS.get(m.lower(), m.title() if m else "")


def campos(desc):
    t = html.unescape(re.sub(r"&amp;nbsp;|&nbsp;", " ", desc or ""))
    t = t.replace("\xa0", " ")
    t = re.split(r"(?i)o conte[úu]do/ve[íi]culo|#classificado", t)[0]
    padrao = r"(?i)(" + "|".join(CHAVES) + r"):"
    partes = re.split(padrao, t)
    d = {}
    for i in range(1, len(partes) - 1, 2):
        d.setdefault(partes[i].capitalize(), partes[i + 1].strip())
    return d


def limpar_obs(txt):
    txt = re.split(r"(?i)o conte[úu]do", txt or "")[0]
    # a plataforma antiga corrompeu alguns valores ("R$25.000,00" virou "R.000,00")
    txt = re.sub(r"R\.\d{3},\d{2}", "(valor a confirmar)", txt)
    return "\n".join(l.strip(" •⁠\t") for l in txt.splitlines() if l.strip(" •⁠\t"))


def baixar(url):
    for tentativa in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return Image.open(BytesIO(r.read())).convert("RGB")
        except Exception:
            time.sleep(1.5 * (tentativa + 1))
    return None


def processar(reg):
    slug = slugify(reg["url"].rstrip("/").split("/")[-1])
    d = campos(reg.get("desc"))
    nome = (reg.get("name") or reg.get("h1") or slug).strip()
    marca = marca_nome(d.get("Marca") or reg.get("brand"))
    if "modelo" in marca.lower():
        marca = marca_nome(re.split(r"(?i)modelo", marca)[0])
    modelo = re.sub(r"\s+", " ", d.get("Modelo") or re.sub(rf"(?i)^{re.escape(marca)}\s*", "", nome)).strip()
    ano = (re.search(r"(19|20)\d{2}(\s*/\s*(19|20)?\d{2})?", d.get("Ano", "")) or [""])[0].replace(" ", "")
    cidade = re.sub(r"\s*-\s*", "-", re.split(r"(?i)obs|[\r\n]", d.get("Cidade", ""))[0]).strip()
    capa_url = (reg.get("imgs") or [reg.get("img")])[0]
    capa = None
    arq = RAIZ / "img" / "acervo" / f"{slug}.webp"
    if arq.exists():
        capa = f"img/acervo/{slug}.webp"
    elif capa_url:
        img = baixar(capa_url)
        if img:
            img.thumbnail((560, 560))
            arq.parent.mkdir(parents=True, exist_ok=True)
            img.save(arq, "WEBP", quality=68, method=6)
            capa = f"img/acervo/{slug}.webp"
    return {
        "slug": slug,
        "marca": marca,
        "modelo": modelo or nome,
        "ano": ano,
        "km": d.get("Km", "").strip(),
        "valor": int(reg["price"]) if reg.get("price") else None,
        "cidade": cidade,
        "obs": limpar_obs(d.get("Obs", "")),
        "capa": capa,
        "n_fotos": len(reg.get("imgs") or []),
        "status": "acervo",
        "origem": "site",
    }


def main():
    regs = [json.loads(l) for l in open(sys.argv[1], encoding="utf8") if l.strip()]
    vistos, unicos = set(), []
    for r in regs:
        if r["url"] not in vistos:
            vistos.add(r["url"])
            unicos.append(r)
    print(len(unicos), "registros")
    ig = json.load(open(RAIZ / "data" / "motos.json", encoding="utf8"))
    with ThreadPoolExecutor(8) as ex:
        lista = list(ex.map(processar, unicos))
    chave = lambda m: (slugify(m["marca"]), slugify(m["modelo"]), slugify(m["ano"]), m["valor"])
    do_instagram = {chave(m) for m in ig}
    antes = len(lista)
    lista = [m for m in lista if chave(m) not in do_instagram]
    print("removidos por duplicar anúncio do Instagram:", antes - len(lista))
    sem = sum(1 for m in lista if not m["capa"])
    (RAIZ / "data").mkdir(exist_ok=True)
    json.dump(lista, open(RAIZ / "data" / "acervo.json", "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
    print("ok; sem capa:", sem)


if __name__ == "__main__":
    main()
