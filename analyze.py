from bs4 import BeautifulSoup
import json

with open('gallardo_es.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

with open('extracted_details.txt', 'w', encoding='utf-8') as out:
    out.write('TITLE: ' + (soup.title.string.strip() if soup.title else '') + '\n\n')
    
    out.write('=== META TAGS ===\n')
    for m in soup.find_all('meta'):
        name = m.get('name') or m.get('property')
        if name:
            out.write(f"{name}: {m.get('content')}\n")

    out.write('\n=== HEADINGS ===\n')
    for h in soup.find_all(['h1', 'h2', 'h3', 'h4']):
        t = h.get_text(strip=True)
        if t:
            out.write(f"[{h.name}] {t}\n")
            
    out.write('\n=== HEADER / TOPBAR ===\n')
    header = soup.find('header')
    if header:
        for a in header.find_all('a'):
            txt = a.get_text(strip=True)
            href = a.get('href')
            if txt and href:
                out.write(f"{txt} -> {href}\n")

    out.write('\n=== VIDEOS & IFRAMES ===\n')
    for v in soup.find_all(['video', 'iframe']):
        out.write(f"{v.name} -> src: {v.get('src')} data-src: {v.get('data-src')} class: {v.get('class')}\n")

    out.write('\n=== IMAGES ===\n')
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src') or ''
        alt = img.get('alt') or ''
        if src:
            out.write(f"IMG src={src} | alt={alt}\n")

    out.write('\n=== CTA LINKS (Phone, WhatsApp, Forms) ===\n')
    seen_ctas = set()
    for a in soup.find_all('a'):
        href = a.get('href', '')
        txt = a.get_text(strip=True)
        if any(k in href.lower() for k in ['tel:', 'mailto:', 'whatsapp', 'evalua', 'contact', 'cita']) or any(k in txt.lower() for k in ['llama', 'consulta', 'evalua', 'contacto', 'whatsapp']):
            item = f"{txt} -> {href}"
            if item not in seen_ctas:
                seen_ctas.add(item)
                out.write(f"CTA: {item}\n")

    out.write('\n=== FORMS ===\n')
    for f in soup.find_all('form'):
        out.write(f"FORM id={f.get('id')} class={f.get('class')} action={f.get('action')}\n")
        for inp in f.find_all(['input', 'select', 'textarea', 'button']):
            out.write(f"   {inp.name} name={inp.get('name')} type={inp.get('type')} placeholder={inp.get('placeholder')} text={inp.get_text(strip=True)}\n")

    out.write('\n=== FOOTER ===\n')
    footer = soup.find('footer')
    if footer:
        out.write('Footer text:\n' + footer.get_text(separator=' | ', strip=True)[:1500] + '\n')

print("Analysis done, extracted_details.txt created.")

