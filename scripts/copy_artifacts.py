#!/usr/bin/env python3
import os
import shutil
import sys
from distutils.dir_util import copy_tree
from glob import glob

__author__ = "Dominik Hardtke"

# switch to script's dir
os.chdir(os.path.dirname(sys.argv[0]))

TARGET_PATH = "../artifacts"
LOOKUP_BASE = os.path.abspath("../")


def module_determiner(file_path):
    return str(file_path).replace(LOOKUP_BASE + os.path.sep, "").split(os.path.sep)[0]


ARTIFACT_TYPES = {
    "war": {
        "source": "**/*.war",
        "files_only": True
    },
    "client": {
        "source": "frontend/dist",
        "target": lambda p: ""
    },
    "doc": {
        "source": "**/javadoc"
    },
    "checkstyle": {
        "source": "**/build/reports/checkstyle/*.html",
        "target": lambda p: p[0:str(p).index("build" + os.sep)]
    },
    "test+jacoco": {
        "source": [
            "**/build/reports/tests/test",
            "**/build/reports/jacoco/test/html"
        ],
        "target": lambda p: p[0:str(p).index("build" + os.sep)] + ("test" if str(p).split(os.sep)[-1] == "test" else "jacoco")
    },
    "spotbugs": {
        "source": "**/build/reports/spotbugs/*.html",
        "target": lambda p: p[0:str(p).index("build" + os.sep)]
    },
    "pmd": {
        "source": "**/build/reports/pmd/*.html",
        "target": lambda p: p[0:str(p).index("build" + os.sep)]
    }
}

# remove output dir if it already exists
shutil.rmtree(TARGET_PATH, ignore_errors=True)

# create output folder(s)
os.makedirs(TARGET_PATH, exist_ok=True)

available_artifact_types = list(ARTIFACT_TYPES.keys())
options = ["all"] + available_artifact_types
if len(sys.argv) == 1 or sys.argv[1] not in options:
    sys.stderr.write("Invalid or no artifact type passed as parameter!\n")
    sys.stderr.write("Possible types (choose one): [%s]\n" % ", ".join(options))
    sys.exit(1)

configs = []
if sys.argv[1] == "all":
    configs = available_artifact_types
else:
    configs = [sys.argv[1]]
for name in configs:
    config = ARTIFACT_TYPES[name]
    print("[INFO] Copying %s artifacts" % name)

    source = config["source"]
    if type(source) == str:
        source = [source]

    files = []
    for pattern in source:
        files += [os.path.abspath(p) for p in glob(os.path.join(LOOKUP_BASE, pattern), recursive=True)]

    # remove directories if config["files_only"]
    if "files_only" in config and config["files_only"]:
        files = [f for f in files if os.path.isfile(f)]

    if len(files) == 0:
        print("[INFO] No files found")
        continue

    for file in files:
        if "target" in config:
            # noinspection PyCallingNonCallable
            target_dir = os.path.join(TARGET_PATH, name, config["target"](str(file).replace(LOOKUP_BASE + os.path.sep, "")))
        else:
            target_dir = os.path.join(TARGET_PATH, name, module_determiner(file))
        os.makedirs(target_dir, exist_ok=True)

        if os.path.isfile(file):
            # copy that single file
            shutil.copy2(file, target_dir)
        else:
            # copy the whole tree
            copy_tree(file, target_dir)
