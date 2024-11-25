// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
        type LinkTarget = "_blank" | "_self" | "_parent" | "_top";
        type IconName = (
                "tag"
                | "paint-brush"
                | "arrow-left"
                | "info-circle"
                | "wrench"
                | "globe"
                | "plus"
                | "file-export"
                | "trash"
                );
    }
}

export {};
