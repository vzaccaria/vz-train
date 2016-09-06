const como = 'S01301';
const milano = 'S01700';

const setupTrenordTrains = (mod) => {

    const o = mod.addToWatchList;

    o(como, milano, '25509', 'mattina_7e13');
    o(como, milano, '25511', 'mattina_8e13');
    o(como, milano, '25513', 'mattina_9e13');
    o(como, milano, '25521', 'mattina_13e13');
    o(como, milano, '25523', 'mattina_14e13');
    o(como, milano, '25527', 'pome_1710');
    o(como, milano, '25529', 'pome_1810');
    o(como, milano, '25531', 'pome_1910');
    o(como, milano, '25533', 'pome_2010');

    // estivi - speciali..
    // o(como, milano, '25001', 'mattina_8e13');
    // o(como, milano, '25003', 'mattina_9e13');
    // o(como, milano, '25007', 'pome_1710');
    // o(como, milano, '25009', 'pome_1810');
    // o(como, milano, '25011', 'pome_1910');
    // o(como, milano, '25013', 'pome_2010');
}


module.exports = {
    setupTrenordTrains
}
