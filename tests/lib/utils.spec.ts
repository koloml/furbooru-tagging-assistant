import { randomString } from "$tests/utils";
import { escapeRegExp, findDeepObject } from "$lib/utils";
import { randomInt } from "node:crypto";

describe('findDeepObject', () => {
  const targetObject = {
    somewhere: {
      deep: {
        stringValue: randomString(),
        numericValue: randomInt(0, 1000),
      }
    }
  };

  it('should just return null when nothing is found', () => {
    const nonExistentValue = findDeepObject(targetObject, ['completely', 'wrong']);
    expect(nonExistentValue).toBe(null);
  });

  it('should retrieve something stored deep inside object', () => {
    const returnedDeepObject = findDeepObject(targetObject, ['somewhere', 'deep']);
    expect(returnedDeepObject).toBe(targetObject.somewhere.deep);
  });

  it('should return null if value located on given path is not an object', () => {
    const returnedForStringValue = findDeepObject(targetObject, ['somewhere', 'deep', 'stringValue']);
    expect(returnedForStringValue).not.toBe(targetObject.somewhere.deep.stringValue);
    expect(returnedForStringValue).toBe(null);

    const returnedForNumericValue = findDeepObject(targetObject, ['somewhere', 'deep', 'numericValue']);
    expect(returnedForNumericValue).not.toBe(targetObject.somewhere.deep.numericValue);
    expect(returnedForNumericValue).toBe(null);
  });
});

describe('escapeRegExp', () => {
  const specialCharactersToMatch = "$[(?:)]{}()*./\\+?|^";

  it('should sufficiently enough escape special characters', () => {
    const generatedRegExp = new RegExp(`^${escapeRegExp(specialCharactersToMatch)}$`, 'm');
    expect(generatedRegExp.test(specialCharactersToMatch)).toBe(true);
  });
});
