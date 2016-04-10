'use strict';

var S01301_25527 = require('../fixtures/25527_S01301_r3min_bin8.json');

module.exports = function (_ref) {
    var mm = _ref.mm;
    var superagent = _ref.superagent;
    var bluebird = _ref.bluebird;

    mm(superagent, 'get', function (url) {
        if (url === 'http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/S01301/25527') {
            return bluebird.resolve({ body: S01301_25527 });
        }
    });
};

// curl 'http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/S01301/25527' -H 'Pragma: no-cache' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8,it;q=0.6,nb;q=0.4,fr;q=0.2' -H 'User-Agent: Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36' -H 'Accept: application/json' -H 'Referer: http://www.viaggiatreno.it/viaggiatrenonew/index.jsp' -H 'Cookie: LANG=it; JSESSIONID=0000HppMRBrXIK9aKlZRmO6_hbk:19dfjbbd9; ttcc=1460296521015; s_cc=true; s_cpc=0; s_vs=1; s_nr=1460300803870-Repeat; ev14_STO=D%3Dc14; s_sq=%5B%5BB%5D%5D' -H 'Connection: keep-alive' -H 'Cache-Control: no-cache' --compressed