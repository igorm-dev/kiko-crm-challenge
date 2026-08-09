import { randomInt } from 'node:crypto';

const GROUPS = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%&*-_'];

const LENGTH = 16;

export function generatePassword(): string {
    const alphabet = GROUPS.join('');

    const required = GROUPS.map((group) => group[randomInt(group.length)] as string);
    const filler = Array.from(
        { length: LENGTH - required.length },
        () => alphabet[randomInt(alphabet.length)] as string,
    );

    return shuffle([...required, ...filler]).join('');
}

function shuffle(characters: string[]): string[] {
    const result = [...characters];

    for (let index = result.length - 1; index > 0; index--) {
        const swap = randomInt(index + 1);
        [result[index], result[swap]] = [result[swap] as string, result[index] as string];
    }

    return result;
}
