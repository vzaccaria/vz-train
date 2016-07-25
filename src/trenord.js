const como = 'S01301';
const milano = 'S01700';

const setupTrenordTrains = (mod) => {

    const o = mod.addToWatchList;

    o(como, milano, '25001', 'mattina_8e13');
    o(como, milano, '25003', 'mattina_9e13');
    o(como, milano, '25007', 'pome_1710');
    o(como, milano, '25009', 'pome_1810');
    o(como, milano, '25011', 'pome_1910');
    o(como, milano, '25013', 'pome_2010');
}


module.exports = {
    setupTrenordTrains
}
