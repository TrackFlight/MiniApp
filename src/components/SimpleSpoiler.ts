export function parseTextWithSpoilers(input?: string) {
    if (!input) {
        return [];
    }
    const nodes = [];
    const spoilerRegex = /<spoiler>(.*?)<\/spoiler>/g;
    let lastIndex = 0;
    let match;

    while ((match = spoilerRegex.exec(input)) !== null) {
        const [fullMatch, spoilerText] = match;
        const index = match.index;

        if (index > lastIndex) {
            nodes.push({ type: "text", content: input.slice(lastIndex, index) });
        }
        nodes.push({ type: "spoiler", content: spoilerText });
        lastIndex = index + fullMatch.length;
    }

    if (lastIndex < input.length) {
        nodes.push({ type: "text", content: input.slice(lastIndex) });
    }
    return nodes;
}