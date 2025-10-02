export class PercentEncoding {
    public static looksPercentEncoded(s: string): boolean {
        return /%(?:[0-9A-Fa-f]{2})/.test(s);
    }

    public static decodeURI(raw: string) {
        return decodeURI(raw);
    }
}