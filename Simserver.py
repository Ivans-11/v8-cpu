#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse as urlparse
import os
import unittest
import json
from cucu.cucu import CucuVM

class WebRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        payload = json.loads(self.rfile.read(int(self.headers['content-length'])).decode('utf-8'))
        source = payload["source"].split('\n')
        real_source = ''
        for line in source:
            if not line.startswith(';'):
                real_source += line + '\n'
        c = CucuVM(real_source)
        parsed_path = urlparse.urlparse(self.path)
        message_parts = [
                'CLIENT VALUES:',
                'client_address=%s (%s)' % (self.client_address,
                                            self.address_string()),
                'command=%s' % self.command,
                'path=%s' % self.path,
                'real path=%s' % parsed_path.path,
                'query=%s' % parsed_path.query,
                'request_version=%s' % self.request_version,
                '',
                'SERVER VALUES:',
                'server_version=%s' % self.server_version,
                'sys_version=%s' % self.sys_version,
                'protocol_version=%s' % self.protocol_version,
                '',
                'HEADERS RECEIVED:',
                ]
        for name, value in sorted(self.headers.items()):
            message_parts.append('%s=%s' % (name, value.rstrip()))
        message_parts.append('')
        message = '\n'.join(message_parts)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(c.code.encode('utf-8'))
    def do_GET(self):
        parsed_path = urlparse.urlparse(self.path)
        pa = self.path
        self.send_response(200)
        self.end_headers()
        if pa.startswith("/examples/scandir"):
            """
            # No longer needed
            info = os.getcwd()
            arr = sorted(os.listdir(info + "/examples"))
            results = []
            for fn in arr:
                if not fn.endswith('.txt'):
                    continue
                with open('examples/' + fn, 'r', encoding='utf-8') as f:
                    line = f.readlines()[0].strip()
                    if 'HIDE' in line:
                        continue
                    results.append('"%s|%s"' % (fn, line[2:]))
            text = '[%s]' % ','.join(results)
            self.wfile.write(text.encode('utf-8'))
            """
        else:
            if pa == "/":
                pa = "/index.html"
            with open(pa[1:],"r", encoding='utf-8') as input:
                self.wfile.write(input.read().encode('utf-8'))

server = HTTPServer(('0.0.0.0',8082), WebRequestHandler)
print("Server started on port 8082\nAccess localhost:8082 to use the simulator\nPress Ctrl+C to stop the server")
server.serve_forever()
