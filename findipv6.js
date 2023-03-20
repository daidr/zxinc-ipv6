const fs = require("fs");
const Address6 = require('ip-address').Address6;

function inet_ntoa(number) {
    let addresslist = [];
    addresslist.push((number >> 24n) & 0xffn);
    addresslist.push((number >> 16n) & 0xffn);
    addresslist.push((number >> 8n) & 0xffn);
    addresslist.push(number & 0xffn);

    return addresslist.join(".");
}

function inet_ntoa6(number) {
    let addresslist = [];
    addresslist.push((number >> 48n) & 0xffffn);
    addresslist.push((number >> 32n) & 0xffffn);
    addresslist.push((number >> 16n) & 0xffffn);
    addresslist.push(number & 0xffffn);
    return addresslist.map(e => e.toString(16).padStart(4, '0').toUpperCase()).join(":") + "::";
}


class IPDBv6 {
    constructor(dbname = "ipv6wry.db") {

        this.dbname = dbname;
        this.img = fs.readFileSync("./ipv6wry.db");

        if (this.img.slice(0, 4).toString() != "IPDB") {
            // 数据库格式错误
            return;
        }

        if (this.getLong8(4n, 2n) > 1n) {
            // 数据库格式错误
            return;
        }

        this.firstIndex = this.getLong8(16n);
        this.indexCount = this.getLong8(8n);
        this.offlen = this.getLong8(6n, 1n);
        this.iplen = this.getLong8(7n, 1n);
    }

    getString(offset = 0n) {
        let o2 = this.img.indexOf(0, Number(offset));
        // 有可能只有国家信息没有地区信息
        let gb_str = this.img.slice(Number(offset), o2);
        let utf8_str;
        try {
            utf8_str = gb_str.toString("utf-8")
        } catch (error) {
            return "未知数据";
        }
        return utf8_str;
    }

    getLong8(offset = 0n, size = 8n) {
        let subimg = this.img.slice(Number(offset), Number(offset + size));
        let buf;
        if (subimg.length < 8) {
            buf = Buffer.concat([subimg, Buffer.alloc(8 - subimg.length, 0)]);
        } else {
            buf = subimg;
        }
        return buf.readBigUInt64LE();
    }

    getAreaAddr(offset = 0n) {
        let self_img = this.img[offset];

        let byte = self_img;
        if (byte == 1n || byte == 2n) {
            let p = this.getLong8(offset + 1n, this.offlen);
            return this.getAreaAddr(p);
        }
        else {
            return this.getString(offset);
        }
    }
    getAddr(offset) {
        let o = offset;
        let byte = this.img[o];
        if (byte == 1n) {
            // 重定向模式1
            // [IP][0x01][国家和地区信息的绝对偏移地址]
            // 使用接下来的3字节作为偏移量调用字节取得信息
            return this.getAddr(this.getLong8(o + 1n, this.offlen));
        }
        else {
            // 重定向模式2 + 正常模式
            // [IP][0x02][信息的绝对偏移][...]
            let cArea = this.getAreaAddr(o);
            if (byte == 2n) {
                o += 1n + this.offlen;
            }
            else {
                o = BigInt(this.img.indexOf(0, Number(o)) + 1);
            }
            let aArea = this.getAreaAddr(o);
            return [cArea, aArea];
        }
    }

    find(ip, l, r) {
        if (r - l <= 1n) {
            return l;
        }
        let m = ((l + r) / 2n);

        let o = this.firstIndex + m * (8n + this.offlen);

        let new_ip = this.getLong8(o);
        if (ip < new_ip) {
            return this.find(ip, l, m);
        }
        else {
            return this.find(ip, m, r);
        }
    }

    getIPAddr(ip) {
        let ip_off, ip_rec_off, ip6, c, a, i1, i2, cc, aa, i, type = "normal";
        let realip, realipstr,
            serverip, serveripstr, notIPV6 = false, ipv4;
        try {
            // 把IP地址转成数字
            ip6 = Ipv6ToBigInt(ip);
            ip = (ip6 >> 64n) & 0xFFFFFFFFFFFFFFFFn;
            // 使用 this.find 函数查找ip的索引偏移
            i = this.find(ip, 0n, this.indexCount);
            // 得到索引记录
            ip_off = this.firstIndex + i * (8n + this.offlen);
            ip_rec_off = this.getLong8(ip_off + 8n, this.offlen);
            [c, a] = this.getAddr(ip_rec_off);
            [cc, aa] = [c, a];
            i1 = inet_ntoa6(this.getLong8(ip_off));
            try {
                i2 = inet_ntoa6(this.getLong8(ip_off + 8n + this.offlen) - 1n);
            } catch (error) {
                i2 = "FFFF:FFFF:FFFF:FFFF::";
            }
            // 本机地址
            if (ip6 == 0x1n) {
                i1 = "0:0:0:0:0:0:0:1";
                i2 = "0:0:0:0:0:0:0:1";
                c = cc = "本机地址";
                notIPV6 = true;
                ipv4 = "127.0.0.1";
                type = "local";
            } else if (ip == 0n && ((ip6 >> 32n) & 0xffffffffn) == 0xffffn) {
                // IPv4映射地址
                realip = ip6 & 0xffffffffn;
                realipstr = inet_ntoa(realip);
                i1 = "0:0:0:0:0:FFFF:0:0";
                i2 = "0:0:0:0:0:FFFF:FFFF:FFFF";
                c = "IPv4映射地址";
                a = a + "对应的IPv4地址为" + realipstr;
                ipv4 = realipstr;
                notIPV6 = true;
                type = "ipv4";
            } else if (((ip >> 48n) & 0xffffn) == 0x2002n) {
                // 6to4
                realip = (ip & 0x0000ffffffff0000n) >> 16n;
                realipstr = inet_ntoa(realip);
                a = a + "6to4，对应的IPv4地址为" + realipstr;
                ipv4 = realipstr;
                notIPV6 = true;
                type = "6to4";
            } else if (((ip >> 32n) & 0xffffffffn) == 0x20010000n) {
                // teredo
                serverip = ip & 0xffffffffn;
                serveripstr = inet_ntoa(serverip);
                realip = ~ip6 & 0xffffffffn;
                realipstr = inet_ntoa(realip);
                a = a + "Teredo服务器的IPv4地址为" + serveripstr + "\n";
                a = a + "客户端真实的IPv4地址为" + realipstr;
                ipv4 = realipstr;
                notIPV6 = true;
                type = "teredo";
            } else if (((ip6 >> 32n) & 0xffffffffn) == 0x5efen) {
                // isatap
                realip = ip6 & 0xffffffffn;
                realipstr = inet_ntoa(realip);
                a = a + "ISATAP地址，对应的IPv4地址为" + realipstr;
                ipv4 = realipstr;
                notIPV6 = true;
                type = "isatap";
            }
        } catch (error) {
            console.error(error);
            i1 = "";
            i2 = "";
            c = cc = "错误的IP地址";
            a = aa = "";
        }
        let data = {
            myip: ip,
            ip: {
                start: i1,
                end: i2
            },
            location: c + " " + a,
            country: cc,
            local: aa,
            type: type,
            isNormalIPv6: !notIPV6,
            ipv4: ipv4,
            serveripv4: serveripstr
        };
        return data;
    }
}

function Ipv6ToBigInt(ipv6str) {
    let address = new Address6(ipv6str);
    return BigInt(address.bigInteger());
};

exports = module.exports = IPDBv6;