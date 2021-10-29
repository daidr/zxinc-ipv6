# [zxinc-ipv6](https://github.com/daidr/zxinc-ipv6)

> A module for indexing ipv6 geolocation using the zxinc database.

[![NPM version](https://img.shields.io/npm/v/zxinc-ipv6.svg?style=flat)](https://npmjs.org/package/zxinc-ipv6) 
[![NPM Downloads](https://img.shields.io/npm/dm/zxinc-ipv6.svg?style=flat)](https://npmjs.org/package/zxinc-ipv6) 
[![Node.js Version](https://img.shields.io/node/v/zxinc-ipv6.svg?style=flat)](http://nodejs.org/download/)

## Installation

```bash
# npm .. 
npm i zxinc-ipv6
# yarn .. 
yarn add zxinc-ipv6
```

## Usage

```javascript
const IPDBv6 = require('zxinc-ipv6');

//let db = new IPDBv6("/yourpath/ipv6wry.db");
let db = new IPDBv6();

console.log(db.getIPAddr("240e:473:fb40:2733::"));

/*
    {
        myip: '240e:473:fb40:2733::',
        ip: { start: '240E:0470:1000:0000::', end: '240E:0473:FFFF:FFFF::' },
        location: '中国浙江省 中国电信',
        country: '中国浙江省',
        local: '中国电信',
        type: 'normal',
        isNormalIPv6: true,
        ipv4: undefined,
        serveripv4: undefined
    }
*/
```

## Contributing

Please submit all issues and pull requests to the [daidr/zxinc-ipv6](http://github.com/daidr/zxinc-ipv6) repository!

## Support

If you have any problem or suggestion please open an issue [here](https://github.com/daidr/zxinc-ipv6/issues).

## License

[MIT](LICENSE)