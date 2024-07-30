#!/usr/bin/env python3

import json
import os
import re
import argparse
import logging
import subprocess
import sys
from pathlib import Path

logger = logging.getLogger(__name__)


def construct_translation(to_translate, translation_data, language, current_translation, debug_prefix="", new_data={}):
    if not to_translate:
        return to_translate
    nested_debug_prefix = debug_prefix + "__"
    # Try direct matching first:
    if to_translate.strip() in translation_data.get("direct"):
        # If language not yet available return English version:
        if language not in translation_data.get("direct").get(to_translate.strip()):
            return to_translate
        # Return translation:
        final = to_translate.replace(to_translate.strip(),
                                     translation_data.get("direct").get(to_translate.strip()).get(language))
        logger.debug("{}DIRECT: '{}'->'{}'".format(debug_prefix, to_translate, final))
        return final

    # Ugly fix to avoid translating again all champions names:
    if "(champion)" in to_translate and current_translation is not None and current_translation and "(champion)" not in current_translation:
        return "{} ({})".format(current_translation, construct_translation("champion", translation_data, language, None,
                                                                           nested_debug_prefix, new_data))

    # Try to match any regex (containing a number or special characters, like "Level 4 Wizard"):
    for regex in translation_data.get("regex"):
        val = re.fullmatch(regex, to_translate.strip())
        curr = None if current_translation is None else re.fullmatch(regex, current_translation.strip())

        if val is not None:
            final = translation_data.get("regex").get(regex).get(language)
            if final is not None:
                for i in range(1, len(val.groups()) + 1):
                    final = final.replace("$%d" % i, construct_translation(val.group(i), translation_data, language,
                                                                           None if curr is None else curr.group(i),
                                                                           nested_debug_prefix, new_data))
                final = to_translate.replace(to_translate.strip(), final)
                logger.debug("{}REGEX({}): '{}'->'{}'".format(debug_prefix, regex ,to_translate, final))
                return final

    # Translate list of string separated by ',':
    if "," in to_translate:
        final = ""
        if current_translation is None or not current_translation \
                or len(to_translate.split(",")) != len(current_translation.split(",")):
            final = ",".join(
                [construct_translation(elt, translation_data, language, None, nested_debug_prefix, new_data) for elt in
                 to_translate.split(",")])
        else:
            final = ",".join(
                [construct_translation(to_translate.split(",")[i], translation_data, language,
                                       current_translation.split(",")[i], nested_debug_prefix, new_data)
                 for i in range(0, len(to_translate.split(",")))])
        logger.debug("{}LIST: '{}'->'{}'".format(debug_prefix, to_translate, final))
        return final

    # Try to match any string starting and/or ending with a '*'
    val = re.match(r'(.*)\*(.*)', to_translate)
    curr = None if current_translation is None else re.match(r'(.*)\*(.*)', current_translation)
    if val is not None:
        final = "*".join(
            [construct_translation(val.group(1), translation_data, language, None if curr is None else curr.group(1),
                                   nested_debug_prefix, new_data),
             construct_translation(val.group(2), translation_data, language, None if curr is None else curr.group(2),
                                   nested_debug_prefix, new_data)])
        logger.debug("{}STAR: '{}'->'{}'".format(debug_prefix, to_translate, final))
        return final

    # Split by any parentheses content and try to translate those:
    val = re.match(r'(.*)\((.*)\)(.*)', to_translate)
    curr = None if current_translation is None else re.match(r'(.*)\((.*)\)(.*)', current_translation)
    if val is not None:
        final = "".join([construct_translation(val.group(1), translation_data, language,
                                               None if curr is None else curr.group(1), nested_debug_prefix, new_data),
                         "(",
                         construct_translation(val.group(2), translation_data, language,
                                               None if curr is None else curr.group(2), nested_debug_prefix, new_data),
                         ")",
                         construct_translation(val.group(3), translation_data, language,
                                               None if curr is None else curr.group(3), nested_debug_prefix, new_data)])
        logger.debug("{}PARENTHESES: '{}'->'{}'".format(debug_prefix, to_translate, final))
        return final

    # Check string containing {}:
    val = re.match(r'(.*)\{.*\}(.*)', to_translate)
    curr = None if current_translation is None else re.match(r'(.*)\{.*\}(.*)', current_translation)
    if val is not None:
        final = "".join([construct_translation(val.group(1), translation_data, language,
                                               None if curr is None else curr.group(1), nested_debug_prefix, new_data),
                         construct_translation(val.group(2), translation_data, language,
                                               None if curr is None else curr.group(2), nested_debug_prefix,
                                               new_data)]).rstrip()
        logger.debug("{}BRACES: '{}'->'{}'".format(debug_prefix, to_translate, final))
        return final

    if current_translation is not None and current_translation:
        logger.debug("{}USE CURRENT: '{}'->'{}'".format(debug_prefix, to_translate, current_translation))

        if current_translation == to_translate:
            trans = {language: ""}
            new_data[to_translate.strip()] = trans
        else:
            trans = {language: current_translation.strip()}
            new_data[to_translate.strip()] = trans
        return current_translation

    logger.debug("{}NOT TRANSLATED: '{}'".format(debug_prefix, to_translate))
    if to_translate.strip():
        trans = {language: ""}
        new_data[to_translate.strip()] = trans
    return to_translate


def add_missing_translations(json_obj, translation_data, language, new_data):
    if isinstance(json_obj, dict):
        # If there is a "name_en" key, then something need to be translated:
        if "name_en" in json_obj:
            translation = construct_translation(json_obj.get("name_en"), translation_data, language,
                                                json_obj.get(language), new_data=new_data)
            # if translation != json_obj.get("name_en") or "name_fr" not in json_obj:
            json_obj[language] = translation

        for value in json_obj.values():
            add_missing_translations(value, translation_data, language, new_data=new_data)
    elif isinstance(json_obj, list):
        for value in json_obj:
            add_missing_translations(value, translation_data, language, new_data=new_data)


def get_and_sort_translations_data(file_path):
    with open(file_path, "r", encoding='utf8') as read_file:
        translation_data = json.load(read_file)

    # Re-order "direct" keys in translation files:
    translation_data["direct"] = dict(sorted(translation_data["direct"].items()))
    if translation_data is not None:
        with open(file_path, "w", encoding='utf8') as write_file:
            json.dump(translation_data, write_file, indent=2, ensure_ascii=False)
            write_file.write("\n")
    return translation_data


def main():
    default_translation_filepath = os.path.join(Path(os.path.dirname(os.path.realpath(__file__))).parent.absolute(),
                                                "translation", "common.json")
    parser = argparse.ArgumentParser(prog='Translation Checker',
                                     description='This script take a json file containing common translation terms '
                                                 'and try to use it to update translation files.'
                                                 'Alongside this common file, it will also try to find file with same '
                                                 'name as the file to be translated to check any specific translation.'
                                                 '(used for old-world-builder)')
    parser.add_argument("-j",
                        "--json-directory-path",
                        required=True,
                        help="path to directory containing json file to translate.",
                        metavar="PATH")
    parser.add_argument("-l",
                        "--language",
                        required=True,
                        help="language to check (fr, de, pl, it...).",
                        metavar="LANG")
    parser.add_argument("-c",
                        "--common-data-path",
                        help="path to common.json file, will use the parent directory to search for other translation"
                             "files as well.",
                        metavar="PATH")
    parser.add_argument("-f",
                        "--filter",
                        help="filter files to check.",
                        metavar="FILTER")
    parser.add_argument("-d",
                        "--debug",
                        action="store_true",
                        help="To display some debug information.")
    parser.add_argument("-p",
                        "--prettify",
                        action="store_true",
                        help="Use 'prettier' to reformat the file at the end.")
    parser.add_argument("-r",
                        "--dry-run",
                        action="store_true",
                        help="Avoid writing result file.")
    args = parser.parse_args()
    logger.setLevel(logging.INFO)
    if args.debug:
        logger.setLevel(logging.DEBUG)
    ch = logging.StreamHandler(sys.stdout)
    logger.addHandler(ch)
    language = "name_%s" % args.language
    common_data_path = args.common_data_path if args.common_data_path is not None else default_translation_filepath
    common_data_directory = Path(common_data_path).parent.absolute()

    logger.debug("Use main translation file: {}".format(common_data_path))

    common_translation_data = get_and_sort_translations_data(common_data_path)

    # Check all .json files in the directory:
    for file in os.listdir(args.json_directory_path):
        if file.endswith(".json"):
            if not args.filter or args.filter in file:
                new_data = {}
                logger.info("Check: {} using {}".format(file, common_data_path))
                with open(os.path.join(args.json_directory_path, file), "r", encoding='utf8') as read_file:
                    json_file_content = json.load(read_file)

                army_translation_path = os.path.join(common_data_directory, file)
                merged_translation_data = common_translation_data.copy()
                if os.path.exists(army_translation_path):
                    logger.info("Check: {} using {}".format(file, army_translation_path))
                    army_translation_data = get_and_sort_translations_data(army_translation_path)
                    merged_translation_data["direct"] = {**army_translation_data.get("direct"),
                                                         **common_translation_data.get("direct")}
                    merged_translation_data["regex"] = {**army_translation_data.get("regex"),
                                                        **common_translation_data.get("regex")}

                add_missing_translations(json_file_content, merged_translation_data, language, new_data)

                if not args.dry_run:
                    # Write the file with all new translations added:
                    with open(os.path.join(args.json_directory_path, file), "w", encoding='utf8') as write_file:
                        json.dump(json_file_content, write_file, indent=2, ensure_ascii=False)
                        write_file.write("\n")
                main_data = {"direct": new_data, "regex": {}}
                # if not os.path.exists(army_translation_path):
                with open(army_translation_path.replace(".json", "-dump.json"), "w", encoding='utf8') as new_write_file:
                    json.dump(main_data, new_write_file, indent=2, ensure_ascii=False, sort_keys=True)
                    new_write_file.write("\n")

    if args.prettify:
        cmd = "npx prettier {} --write".format(args.json_directory_path)
        logger.debug(cmd)
        subprocess.check_call(cmd, shell=True, stdout=subprocess.PIPE,
                              stderr=subprocess.STDOUT)


if __name__ == "__main__":
    main()
