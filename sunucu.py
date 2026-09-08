#!/usr/bin/env python3
"""
Şenyüz Estate — yerel önizleme sunucusu.

Neden bu dosya var: `python3 -m http.server` Range (206) isteklerini
desteklemez. Tarayıcı videoyu saramadığı için scroll'a bağlı video ilk
karede takılı kalır. Bu sunucu Range desteği ekler.

Kullanım:   python3 sunucu.py
Sonra:      http://localhost:8000
"""
import http.server
import os
import re
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
KOK = os.path.dirname(os.path.abspath(__file__))


class RangeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=KOK, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        aralik = self.headers.get("Range")
        if not aralik:
            return super().send_head()

        yol = self.translate_path(self.path)
        if os.path.isdir(yol) or not os.path.exists(yol):
            return super().send_head()

        eslesme = re.match(r"bytes=(\d*)-(\d*)", aralik)
        if not eslesme:
            return super().send_head()

        boyut = os.path.getsize(yol)
        bas = int(eslesme.group(1)) if eslesme.group(1) else 0
        son = int(eslesme.group(2)) if eslesme.group(2) else boyut - 1
        son = min(son, boyut - 1)
        if bas > son:
            self.send_error(416, "Requested Range Not Satisfiable")
            return None

        dosya = open(yol, "rb")
        dosya.seek(bas)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(yol))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {bas}-{son}/{boyut}")
        self.send_header("Content-Length", str(son - bas + 1))
        self.end_headers()

        kalan = son - bas + 1
        while kalan > 0:
            parca = dosya.read(min(64 * 1024, kalan))
            if not parca:
                break
            try:
                self.wfile.write(parca)
            except (BrokenPipeError, ConnectionResetError):
                break
            kalan -= len(parca)
        dosya.close()
        return None


class Sunucu(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Sunucu(("127.0.0.1", PORT), RangeHandler) as httpd:
        print(f"Şenyüz Estate  ->  http://localhost:{PORT}")
        print("Durdurmak için Ctrl+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSunucu durduruldu.")
