import {Cell, Dictionary} from "@ton/core";
import {
    hashKey,
    MetaDataKeys,
    OnChainMetadataEncodeMethod,
    ONCHAIN_CONTENT_PREFIX,
    SNAKE_PREFIX
} from "./contentEncode";

export function decodeContent(cell: Cell) {
    const ds = cell.beginParse();
    const type = ds.loadUint(8);
    if (type === ONCHAIN_CONTENT_PREFIX) {
        let data = ds.loadDict(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
        const uri = data.get(hashKey('uri'));
        if (uri !== undefined) {
            throw new Error('jetton content is off semichain');
        }

        let ret: {
            [key in MetaDataKeys]: string | undefined
        } = {
            name: undefined,
            description: undefined,
            image: undefined,
            symbol: undefined,
            decimals: undefined,
            uri: undefined,
            image_data: undefined,
            token0: undefined,
            token1: undefined,
            fee: undefined,
            positionKey: undefined,
            liquidity: undefined,
        }

        for (let keyName of ["name", "description", "image", "symbol","decimals","uri","image_data","token0","token1","fee","positionKey","liquidity"] as Array<MetaDataKeys>) {
            let encodeMethod = OnChainMetadataEncodeMethod[keyName]

            if (!encodeMethod) {
                throw new Error(`unknown encode method??`)
            }

            let cell = data.get(hashKey(keyName))
            if (!cell) {
                ret[keyName] = undefined
            } else {

                ret[keyName] = cellToString(cell, encodeMethod)
            }
        }

        return ret

    } else if (type === 0x01) {
        throw new Error('jetton content is off chain');
    } else {
        throw new Error('Unknown FullContent type: ' + type);
    }

}

function cellToString(cell: Cell, encode: `utf8` | `ascii`): string {
    let cs = cell.beginParse()
    let isSnakeFormat = cs.loadUint(8);

    if (isSnakeFormat === SNAKE_PREFIX) {

        const buffer: Buffer[] = []
        let currentSlice = cs;
        while (currentSlice.remainingBits > 0 || currentSlice.remainingRefs > 0) {

            if (currentSlice.remainingBits % 8 !== 0) {
                throw new Error('Slice must contain an integer number of bytes');
            }
            let bufferThisTime = currentSlice.loadBuffer(currentSlice.remainingBits / 8);

            buffer.push(bufferThisTime);

            if (currentSlice.remainingRefs === 1) {

                currentSlice = currentSlice.loadRef().beginParse();

            } else if (currentSlice.remainingRefs > 1) {
                throw new Error('Slice must contain at most 1 ref');
            }
        }
        return Buffer.concat(buffer).toString(encode);

    } else if (isSnakeFormat === 0x01) {
        throw new Error('does not support chunked format');
    } else {
        throw new Error('Unknown ContentData type: ' + isSnakeFormat);
    }

}
