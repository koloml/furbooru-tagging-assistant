import { BaseComponent } from "$lib/components/base/BaseComponent";
import { QueryLexer, QuotedTermToken, TermToken, Token } from "$lib/booru/search/QueryLexer";
import SearchSettings, { type SuggestionsPosition } from "$lib/extension/settings/SearchSettings";

export class SearchWrapper extends BaseComponent {
  #searchField: HTMLInputElement | null = null;
  #lastParsedSearchValue: string | null = null;
  #cachedParsedQuery: Token[] = [];
  #searchSettings: SearchSettings = new SearchSettings();
  #arePropertiesSuggestionsEnabled: boolean = false;
  #propertiesSuggestionsPosition: SuggestionsPosition = "start";
  #cachedAutocompleteContainer: HTMLElement | null = null;
  #lastTermToken: TermToken | QuotedTermToken | null = null;

  build() {
    this.#searchField = this.container.querySelector('input[name=q]');
  }

  init() {
    if (this.#searchField) {
      this.#searchField.addEventListener('input', this.#onInputFindProperties.bind(this))
    }

    this.#searchSettings.resolvePropertiesSuggestionsEnabled()
      .then(isEnabled => this.#arePropertiesSuggestionsEnabled = isEnabled);
    this.#searchSettings.resolvePropertiesSuggestionsPosition()
      .then(position => this.#propertiesSuggestionsPosition = position);

    this.#searchSettings.subscribe(settings => {
      this.#arePropertiesSuggestionsEnabled = Boolean(settings.suggestProperties);
      this.#propertiesSuggestionsPosition = settings.suggestPropertiesPosition || "start";
    });
  }

  /**
   * Catch the user input and execute suggestions logic.
   * @param event Source event to find the input element from.
   */
  #onInputFindProperties(event: Event) {
    // Ignore events until option is enabled.
    if (!this.#arePropertiesSuggestionsEnabled || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }

    const currentFragment = this.#findCurrentTagFragment();

    if (!currentFragment) {
      return;
    }

    this.#renderSuggestions(
      SearchWrapper.#resolveSuggestionsFromTerm(currentFragment),
      event.currentTarget
    );
  }

  /**
   * Get the selection position in the search field.
   */
  #getInputUserSelection(): number {
    if (!this.#searchField) {
      throw new Error('Missing search field!');
    }

    return Math.min(
      this.#searchField.selectionStart ?? 0,
      this.#searchField.selectionEnd ?? 0,
    );
  }

  /**
   * Parse the search query and return the list of parsed tokens. Result will be cached for current search query.
   */
  #resolveQueryTokens(): Token[] {
    if (!this.#searchField) {
      throw new Error('Missing search field!');
    }

    const searchValue = this.#searchField.value;

    if (searchValue === this.#lastParsedSearchValue && this.#cachedParsedQuery) {
      return this.#cachedParsedQuery;
    }

    this.#lastParsedSearchValue = searchValue;
    this.#cachedParsedQuery = new QueryLexer(searchValue).parse();

    return this.#cachedParsedQuery;
  }

  /**
   * Find the currently selected term.
   * @return Selected term or null if none found.
   */
  #findCurrentTagFragment(): string | null {
    if (!this.#searchField) {
      return null;
    }

    let searchValue = this.#searchField.value;

    if (!searchValue) {
      this.#lastTermToken = null;
      return null;
    }

    const token = SearchWrapper.#findActiveSearchTermPosition(
      this.#resolveQueryTokens(),
      this.#getInputUserSelection(),
    );

    if (token instanceof TermToken) {
      this.#lastTermToken = token;
      return token.value;
    }

    if (token instanceof QuotedTermToken) {
      this.#lastTermToken = token;
      return token.decodedValue;
    }

    this.#lastTermToken = null;
    return searchValue;
  }

  /**
   * Resolve the autocomplete container from the document. Once resolved, it can be safely reused without breaking
   * anything. Assuming refactored autocomplete handler is still implemented the way it is.
   *
   * This means, that properties will only be suggested once actual autocomplete logic was activated.
   *
   * @return Resolved element or nothing.
   */
  #resolveAutocompleteContainer(): HTMLElement | null {
    if (this.#cachedAutocompleteContainer) {
      return this.#cachedAutocompleteContainer;
    }

    this.#cachedAutocompleteContainer = document.querySelector('.autocomplete');

    return this.#cachedAutocompleteContainer;
  }

  /**
   * Render the list of suggestions into the existing popup or create and populate a new one.
   * @param suggestions List of suggestion to render the popup from.
   * @param targetInput Target input to attach the popup to.
   */
  #renderSuggestions(suggestions: string[], targetInput: HTMLInputElement) {
    const suggestedListItems = suggestions
      .map(suggestedTerm => this.#renderTermSuggestion(suggestedTerm));

    requestAnimationFrame(() => {
      const autocompleteContainer = this.#resolveAutocompleteContainer();

      if (!autocompleteContainer) {
        return;
      }

      // Since the autocomplete popup was refactored to re-use the same element over and over again, we need to remove
      // the options from the popup manually when autocomplete was removed from the DOM, since site is not doing that.
      const termsToRemove = autocompleteContainer.isConnected
        // Only removing properties when element is still connected to the DOM (popup is used by the website)
        ? autocompleteContainer.querySelectorAll('.autocomplete__item--property')
        // Remove everything if popup was disconnected from the DOM.
        : autocompleteContainer.querySelectorAll('.autocomplete__item')

      for (let existingTerm of termsToRemove) {
        existingTerm.remove();
      }

      const listContainer = autocompleteContainer.querySelector('ul');

      if (!listContainer) {
        return;
      }

      switch (this.#propertiesSuggestionsPosition) {
        case "start":
          listContainer.prepend(...suggestedListItems);
          break;

        case "end":
          listContainer.append(...suggestedListItems);
          break;

        default:
          console.warn("Invalid position for property suggestions!");
      }

      const parentScrollTop = targetInput.parentElement?.scrollTop ?? 0;

      autocompleteContainer.style.position = 'absolute';
      autocompleteContainer.style.left = `${targetInput.offsetLeft}px`;
      autocompleteContainer.style.top = `${targetInput.offsetTop + targetInput.offsetHeight - parentScrollTop}px`;

      document.body.append(autocompleteContainer);
    })
  }

  /**
   * Loosely estimate where current selected search term is located and return it if found.
   * @param tokens Search value to find the actively selected term from.
   * @param userSelectionIndex The index of the user selection.
   * @return Search term object or NULL if nothing found.
   */
  static #findActiveSearchTermPosition(tokens: Token[], userSelectionIndex: number): Token | null {
    return tokens.find(
      token => token.index < userSelectionIndex && token.index + token.value.length >= userSelectionIndex
    ) ?? null;
  }

  /**
   * Regular expression to search the properties' syntax.
   */
  static #propertySearchTermHeadingRegExp = /^(?<name>[a-z\d_]+)(?<op_syntax>\.(?<op>[a-z]*))?(?<value_syntax>:(?<value>.*))?$/;

  /**
   * Create a list of suggested elements using the input received from the user.
   * @param searchTermValue Original decoded term received from the user.
   * @return {string[]} List of suggestions. Could be empty.
   */
  static #resolveSuggestionsFromTerm(searchTermValue: string): string[] {
    const suggestionsList: string[] = [];

    this.#propertySearchTermHeadingRegExp.lastIndex = 0;
    const parsedResult = this.#propertySearchTermHeadingRegExp.exec(searchTermValue);

    if (!parsedResult) {
      return suggestionsList;
    }

    const propertyName = parsedResult.groups?.name;

    if (!propertyName) {
      return suggestionsList;
    }

    const propertyType = this.#properties.get(propertyName);
    const hasOperatorSyntax = Boolean(parsedResult.groups?.op_syntax);
    const hasValueSyntax = Boolean(parsedResult.groups?.value_syntax);

    // No suggestions for values for now, maybe could add suggestions for namespaces like my:*
    if (hasValueSyntax && propertyType) {
      if (this.#typeValues.has(propertyType)) {
        const givenValue = parsedResult.groups?.value;
        const candidateValues = this.#typeValues.get(propertyType) || [];

        for (let candidateValue of candidateValues) {
          if (givenValue && !candidateValue.startsWith(givenValue)) {
            continue;
          }

          suggestionsList.push(`${propertyName}${parsedResult.groups?.op_syntax ?? ''}:${candidateValue}`);
        }
      }

      return suggestionsList;
    }

    // If at least one dot placed, start suggesting operators
    if (hasOperatorSyntax && propertyType) {
      if (this.#typeOperators.has(propertyType)) {
        const operatorName = parsedResult.groups?.op;
        const candidateOperators = this.#typeOperators.get(propertyType) ?? [];

        for (let candidateOperator of candidateOperators) {
          if (operatorName && !candidateOperator.startsWith(operatorName)) {
            continue;
          }

          suggestionsList.push(`${propertyName}.${candidateOperator}:`);
        }
      }

      return suggestionsList;
    }

    // Otherwise, search for properties with names starting with the term
    for (let [candidateProperty] of this.#properties) {
      if (propertyName && !candidateProperty.startsWith(propertyName)) {
        continue;
      }

      suggestionsList.push(candidateProperty);
    }

    return suggestionsList;
  }

  /**
   * Render a single suggestion item and connect required events to interact with the user.
   * @param suggestedTerm Term to use for suggestion item.
   * @return Resulting element.
   */
  #renderTermSuggestion(suggestedTerm: string): HTMLElement {
    const suggestionItem = document.createElement('li');
    suggestionItem.classList.add('autocomplete__item', 'autocomplete__item--property');
    suggestionItem.dataset.value = suggestedTerm;
    suggestionItem.innerText = suggestedTerm;

    const propertyIcon = document.createElement('i');
    propertyIcon.classList.add('fa', 'fa-info-circle');
    suggestionItem.insertAdjacentElement('afterbegin', propertyIcon);

    suggestionItem.addEventListener('mouseover', () => {
      SearchWrapper.#findAndResetSelectedSuggestion(suggestionItem);
      suggestionItem.classList.add('autocomplete__item--selected');
    });

    suggestionItem.addEventListener('mouseout', () => {
      SearchWrapper.#findAndResetSelectedSuggestion(suggestionItem);
    });

    suggestionItem.addEventListener('click', () => {
      this.#replaceLastActiveTokenWithSuggestion(suggestedTerm);
    });

    return suggestionItem;
  }

  /**
   * Automatically replace the last active token stored in the variable with the new value.
   * @param suggestedTerm Term to replace the value with.
   */
  #replaceLastActiveTokenWithSuggestion(suggestedTerm: string) {
    if (!this.#lastTermToken || !this.#searchField) {
      return;
    }

    const searchQuery = this.#searchField.value;
    const beforeToken = searchQuery.substring(0, this.#lastTermToken.index);
    const afterToken = searchQuery.substring(this.#lastTermToken.index + this.#lastTermToken.value.length);

    let replacementValue = suggestedTerm;

    if (replacementValue.includes('"')) {
      replacementValue = `"${QuotedTermToken.encode(replacementValue)}"`
    }

    this.#searchField.value = beforeToken + replacementValue + afterToken;
  }

  /**
   * Find the selected suggestion item(s) and unselect them. Similar to the logic implemented by the Philomena's
   * front-end.
   * @param suggestedElement Target element to search from. If element is disconnected from the DOM, search will be
   * halted.
   */
  static #findAndResetSelectedSuggestion(suggestedElement: HTMLElement) {
    if (!suggestedElement.parentElement) {
      return;
    }

    for (let selectedElement of suggestedElement.parentElement.querySelectorAll('.autocomplete__item--selected')) {
      selectedElement.classList.remove('autocomplete__item--selected');
    }
  }

  static #typeNumeric = Symbol();
  static #typeDate = Symbol();
  static #typeLiteral = Symbol();
  static #typePersonal = Symbol();
  static #typeBoolean = Symbol();

  static #properties = new Map([
    ['animated', SearchWrapper.#typeBoolean],
    ['aspect_ratio', SearchWrapper.#typeNumeric],
    ['body_type_tag_count', SearchWrapper.#typeNumeric],
    ['character_tag_count', SearchWrapper.#typeNumeric],
    ['comment_count', SearchWrapper.#typeNumeric],
    ['content_fanmade_tag_count', SearchWrapper.#typeNumeric],
    ['content_official_tag_count', SearchWrapper.#typeNumeric],
    ['created_at', SearchWrapper.#typeDate],
    ['description', SearchWrapper.#typeLiteral],
    ['downvotes', SearchWrapper.#typeNumeric],
    ['duration', SearchWrapper.#typeNumeric],
    ['error_tag_count', SearchWrapper.#typeNumeric],
    ['faved_by', SearchWrapper.#typeLiteral],
    ['faved_by_id', SearchWrapper.#typeNumeric],
    ['faves', SearchWrapper.#typeNumeric],
    ['file_name', SearchWrapper.#typeLiteral],
    ['first_seen_at', SearchWrapper.#typeDate],
    ['height', SearchWrapper.#typeNumeric],
    ['id', SearchWrapper.#typeNumeric],
    ['oc_tag_count', SearchWrapper.#typeNumeric],
    ['orig_sha512_hash', SearchWrapper.#typeLiteral],
    ['original_format', SearchWrapper.#typeLiteral],
    ['pixels', SearchWrapper.#typeNumeric],
    ['rating_tag_count', SearchWrapper.#typeNumeric],
    ['score', SearchWrapper.#typeNumeric],
    ['sha512_hash', SearchWrapper.#typeLiteral],
    ['size', SearchWrapper.#typeNumeric],
    ['source_count', SearchWrapper.#typeNumeric],
    ['source_url', SearchWrapper.#typeLiteral],
    ['species_tag_count', SearchWrapper.#typeNumeric],
    ['spoiler_tag_count', SearchWrapper.#typeNumeric],
    ['tag_count', SearchWrapper.#typeNumeric],
    ['updated_at', SearchWrapper.#typeDate],
    ['uploader', SearchWrapper.#typeLiteral],
    ['uploader_id', SearchWrapper.#typeNumeric],
    ['upvotes', SearchWrapper.#typeNumeric],
    ['width', SearchWrapper.#typeNumeric],
    ['wilson_score', SearchWrapper.#typeNumeric],
    ['my', SearchWrapper.#typePersonal],
  ]);

  static #comparisonOperators = ['gt', 'gte', 'lt', 'lte'];

  static #typeOperators = new Map([
    [SearchWrapper.#typeNumeric, SearchWrapper.#comparisonOperators],
    [SearchWrapper.#typeDate, SearchWrapper.#comparisonOperators],
  ]);

  static #typeValues = new Map([
    [SearchWrapper.#typePersonal, [
      'comments',
      'faves',
      'posts',
      'uploads',
      'upvotes',
      'watched',
    ]],
    [SearchWrapper.#typeBoolean, [
      'true',
      'false',
    ]]
  ]);
}
