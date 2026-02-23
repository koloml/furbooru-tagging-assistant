import { namespaceCategories } from "$config/tags";

/**
 * Build the map containing both real tags and their aliases.
 *
 * @param realAndAliasedTags List combining aliases and tag names.
 * @param realTags List of actual tag names, excluding aliases.
 *
 * @return Map where key is a tag or alias and value is an actual tag name.
 */
export function buildTagsAndAliasesMap(realAndAliasedTags: string[], realTags: string[]): Map<string, string> {
  const tagsAndAliasesMap: Map<string, string> = new Map();

  for (const tagName of realTags) {
    tagsAndAliasesMap.set(tagName, tagName);
  }

  let realTagName: string | null = null;

  for (const tagNameOrAlias of realAndAliasedTags) {
    if (tagsAndAliasesMap.has(tagNameOrAlias)) {
      realTagName = tagNameOrAlias;
      continue;
    }

    if (!realTagName) {
      console.warn('No real tag found for the alias:', tagNameOrAlias);
      continue;
    }

    tagsAndAliasesMap.set(tagNameOrAlias, realTagName);
  }

  return tagsAndAliasesMap;
}

const tagLinkRegExp = /\/tags\/(?<encodedTagName>[^/?#]+)/;

/**
 * List of encoded characters from Philomena.
 *
 * @see https://github.com/philomena-dev/philomena/blob/6086757b654da8792ae52adb2a2f501ea6c30d12/lib/philomena/slug.ex#L52-L57
 */
const slugEncodedCharacters: Map<string, string> = new Map([
  ['-dash-', '-'],
  ['-fwslash-', '/'],
  ['-bwslash-', '\\'],
  ['-colon-', ':'],
  ['-dot-', '.'],
  ['-plus-', '+'],
]);

/**
 * Decode the tag name from its link path.
 *
 * @param tagLink Full or partial link to the tag.
 *
 * @return Tag name or NULL if function is failed to recognize the link as tag-related link.
 */
export function decodeTagNameFromLink(tagLink: string): string | null {
  tagLinkRegExp.lastIndex = 0;

  const result = tagLinkRegExp.exec(tagLink);
  const encodedTagName = result?.groups?.encodedTagName;

  if (!encodedTagName) {
    return null;
  }

  return decodeURIComponent(encodedTagName)
    .replaceAll(/-[a-z]+-/gi, match => slugEncodedCharacters.get(match) ?? match)
    .replaceAll('-', ' ');
}

/**
 * Try to resolve the category from the tag name.
 *
 * @param tagName Name of the tag.
 */
export function resolveTagCategoryFromTagName(tagName: string): string | null {
  const namespace = tagName.split(':')[0];

  return namespaceCategories.get(namespace) ?? null;
}
