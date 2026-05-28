export const pluralizeSets = (count) => {
    const number = Math.abs(Number(count));

    if (number % 10 === 1 && number % 100 !== 11) {
        return `${number} набор`;
    }

    if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return `${number} набора`;
    }

    return `${number} наборов`;
};

export const pluralizeCards = (count) => {
    const number = Math.abs(Number(count));

    if (number % 10 === 1 && number % 100 !== 11) {
        return `${number} карточка`;
    }

    if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return `${number} карточки`;
    }

    return `${number} карточек`;
};
