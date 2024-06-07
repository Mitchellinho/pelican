#!/usr/bin/env python3
import os
import sys
import requests
import colorsys
from xml.dom.minidom import parse, parseString

coverage = parse(sys.argv[3])
for c in coverage.childNodes[1].childNodes:
    if c.nodeName == "counter":
        cov = int(c.getAttribute("covered")) / (int(c.getAttribute("missed")) + int(c.getAttribute("covered"))) * 100
        r, g, b = colorsys.hsv_to_rgb(cov / 300, 1, 85 / 100)
        color = '%02x%02x%02x' % (int(r * 255), int(g * 255), int(b * 255))
        if c.getAttribute("type") == "BRANCH":
            r = requests.put(
                "https://git.hda.onl/api/v4/projects/%d/badges/%d?private_token=%s" % (
                    os.environ['CI_PROJECT_ID'], int(sys.argv[2]), os.environ['PRIVATE_TOKEN']
                ), data={
                    "image_url": "https://img.shields.io/badge/%s%%20coverage-%d%%25-%s" % (sys.argv[1], cov, color)
                }
            )
