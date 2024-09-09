import {beginCell, Cell, Dictionary} from "@ton/core";
import {sha256_sync} from "@ton/crypto";


export const ONCHAIN_CONTENT_PREFIX = 0x00;
export const SNAKE_PREFIX = 0x00;

export type MetaDataKeys = "name"
    | "description"
    | "image"
    | "symbol"
    | "decimals"
    | "uri"
    | "image_data"
    | "token0"
    | "token1"
    | "fee"
    | "positionKey"
    | "liquidity"
    ;

export const OnChainMetadataEncodeMethod: {
    [key in MetaDataKeys]: "utf8" | "ascii" | undefined;
} = {
    name: "utf8",
    description: "utf8",
    image: "ascii",
    symbol: "utf8",
    decimals: "utf8",
    uri: "utf8",
    image_data: "utf8",
    token0: "ascii",
    token1: "ascii",
    fee: "ascii",
    positionKey: "ascii",
    liquidity: "ascii",
};

export function hashKey(key: string): bigint {
    return BigInt('0x' + sha256_sync(key).toString('hex'));
}

export function encodeContent(data: { [s: string]: string | undefined }): Cell {

    const dict = Dictionary.empty(
        Dictionary.Keys.BigUint(256),
        Dictionary.Values.Cell()
    );

    const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8); //126个字节
    Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {

        if (!OnChainMetadataEncodeMethod[k as MetaDataKeys])
            throw new Error(`Unsupported onchain key: ${k}`);

        if (v === undefined || v === "") return;

        let bufferToStore = Buffer.from(v, OnChainMetadataEncodeMethod[k as MetaDataKeys]);


        // bufferToStore = Buffer.concat([Buffer.from(`0x00`,`hex`),bufferToStore])

        let buffer: Buffer[] = []

        while (bufferToStore.length > 0) {
            let encodeThisTime = bufferToStore.subarray(0, CELL_MAX_SIZE_BYTES);
            bufferToStore = bufferToStore.subarray(CELL_MAX_SIZE_BYTES);
            buffer.push(encodeThisTime)
        }

        let builder = buffer.map((b, index) => {
            let builder = beginCell();
            if (index == 0) {
                builder.storeUint(SNAKE_PREFIX, 8)
            }
            builder.storeBuffer(b)
            return builder
        })

        while (2 <= builder.length) {
            let last = builder.pop()!!;
            let second = builder.pop()!!;

            second.storeRef(last)
            builder.push(second)
        }

        let ce = builder[0].endCell()

        dict.set(hashKey(k), ce);
    });

    return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict).endCell();
}

