import ChromeStorageArea from "$tests/mocks/ChromeStorageArea";

export class ChromeLocalStorageArea extends ChromeStorageArea implements chrome.storage.LocalStorageArea {
    QUOTA_BYTES = 100000;
}
