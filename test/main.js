const assert = require('assert');
const IPDBv6 = require('../');
let db = new IPDBv6();

describe('IPV6 test', function () {
    describe('normal ipv6 test (240e:473:fb40:2733::)', function () {
        let data = db.getIPAddr("240e:473:fb40:2733::");

        it('country should be \'中国浙江省\'', function () {
            assert.equal(data.country, "中国浙江省");
        });

        it('local should be \'中国电信\'', function () {
            assert.equal(data.local, "中国电信");
        });

        it('isNormalIPv6 should be \'true\'', function () {
            assert.equal(data.isNormalIPv6, true);
        });

        it('type should be \'normal\'', function () {
            assert.equal(data.type, "normal");
        });
    });

    describe('6to4 ipv6 test (2002:C801:0101::)', function () {
        let data = db.getIPAddr("2002:C801:0101::");

        it('country should be \'IANA特殊地址\'', function () {
            assert.equal(data.country, "IANA特殊地址");
        });

        it('local should be \'6to4隧道地址\'', function () {
            assert.equal(data.local, "6to4隧道地址");
        });

        it('isNormalIPv6 should be \'false\'', function () {
            assert.equal(data.isNormalIPv6, false);
        });

        it('type should be \'6to4\'', function () {
            assert.equal(data.type, "6to4");
        });

        it('ipv4 should be \'200.1.1.1\'', function () {
            assert.equal(data.ipv4, "200.1.1.1");
        });
    });

    describe('teredo ipv6 test (2001:0000:4136:e378:8000:63bf:3fff:fdd2)', function () {
        let data = db.getIPAddr("2001:0000:4136:e378:8000:63bf:3fff:fdd2");

        it('country should be \'IANA特殊地址\'', function () {
            assert.equal(data.country, "IANA特殊地址");
        });

        it('local should be \'Teredo隧道地址\'', function () {
            assert.equal(data.local, "Teredo隧道地址");
        });

        it('isNormalIPv6 should be \'false\'', function () {
            assert.equal(data.isNormalIPv6, false);
        });

        it('type should be \'teredo\'', function () {
            assert.equal(data.type, "teredo");
        });

        it('serveripv4 should be \'65.54.227.120\'', function () {
            assert.equal(data.serveripv4, "65.54.227.120");
        });

        it('ipv4 should be \'192.0.2.45\'', function () {
            assert.equal(data.ipv4, "192.0.2.45");
        });
    });
});