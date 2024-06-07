#!/usr/bin/env python3
import sys
from xml.dom.minidom import parse, parseString

coverage = parse(sys.argv[1])
for c in coverage.childNodes[1].childNodes:
    if c.nodeName == "counter":
        cov = int(c.getAttribute("covered")) / (int(c.getAttribute("missed")) + int(c.getAttribute("covered"))) * 100
        print(c.getAttribute("type").ljust(12), "%05.02f%%" % cov)
