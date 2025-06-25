import { buildTagsAndAliasesMap } from "$lib/booru/tag-utils";

describe('buildTagsAndAliasesMap', () => {
  const exampleTag = 'safe';
  const exampleTagAlias = 'rating:safe';
  const tagsAndAliases = [exampleTag, exampleTagAlias, 'anthro', 'cat', 'feline', 'mammal', 'male', 'boy'];
  const tagsOnly = [exampleTag, 'anthro', 'cat', 'feline', 'mammal', 'male'];
  const mapping = buildTagsAndAliasesMap(tagsAndAliases, tagsOnly);

  it('should return a map of tags', () => {
    expect(mapping).toBeInstanceOf(Map);
  });

  it('should point aliases to their original tags', () => {
    expect(mapping.get(exampleTagAlias)).toBe(exampleTag);
  });

  it('should point tags to themselves', () => {
    expect(mapping.get(exampleTag)).toBe(exampleTag);
  });

  it('should ignore broken tag aliases and show a warning', () => {
    vi.spyOn(console, 'warn');

    const brokenMapping = buildTagsAndAliasesMap(
      ['broken alias', 'tag1', 'tag2'],
      ['tag1', 'tag2'],
    );

    expect(console.warn).toBeCalledTimes(1);
    expect(brokenMapping.has('broken alias')).toBe(false);
  });
});
