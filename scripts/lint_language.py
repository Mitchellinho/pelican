import glob
import json
import os

from natsort import natsorted

item_key_number = 0

if not("frontend" in os.listdir(os.getcwd())):
    raise Exception("Script must be executed from project root and the project must contain a frontend/ directory")
    exit(26)

base_path = "./frontend/i18n/"

languages = ["de", "en"]
language_files = {
    language: sorted(glob.glob(f"{base_path}{language}/**/*.json", recursive=True))
    for language in languages
}

# Check file symmetry
for file_path_tuple in zip(*(language_files[language] for language in languages)):
    file_name_tuple = [
        file_path[len(base_path) + len(language) + 1:-5]
        for file_path, language in zip(file_path_tuple, languages)
    ]
    for file_name in file_name_tuple:
        if file_name != file_name_tuple[0]:
            raise RuntimeError("Filenames of language files are not equal")

    file_content = []
    for file_path in file_path_tuple:
        with open(file_path) as file:
            file_content.append(json.load(file))

    for i, (file, file_path) in enumerate(zip(file_content, file_path_tuple)):
        def r_check(obj: dict):
            global item_key_number

            items = obj.items()
            sorted_items = natsorted(obj.items(), key=lambda t: t[0])

            if i == 0:
                item_key_number += len(sorted_items)

            for (item_key, item_value), (sorted_item_key, _) in zip(items, sorted_items):
                if item_key == sorted_item_key:
                    if type(item_value) is dict:
                        r_check(item_value)
                else:
                    raise RuntimeError(f"Wrong sort order found {item_key} expected {sorted_item_key} in file {file_path}")
        r_check(file)

print("Language lint successful.")
print("{} languages with {} language variables were checked.".format(len(languages), item_key_number))
