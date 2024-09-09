import {Cell, CellType, toNano} from "@ton/core";

export const UNIT = toNano(1) * toNano(1);
export const COIN = toNano(1);
export const TRUE = 1n;
export const FALSE = 0n;

export function printCell(cell: Cell, indent?: string,) {
    let id = indent || '';

    let t = 'x';
    if (cell.isExotic) {
        if (cell.type === CellType.MerkleProof) {
            t = 'p';
        } else if (cell.type === CellType.MerkleUpdate) {
            t = 'u';
        } else if (cell.type === CellType.PrunedBranch) {
            t = 'p';
        }
    }
    let s = id + (cell.isExotic ? t : 'x') + '{' + toBinaryString(cell) + '}';
    for (let k in cell.refs) {
        const i = cell.refs[k];
        s += '\n' + printCell(i, id + ' ');
    }
    return s;
}

function toBinaryString(cell: Cell) {
    let s = ""

    for (let i = 0; i < cell.bits.length; i++) {
        let binary = cell.bits.at(i);

        s = `${s}${binary ? 1 : 0}`

        if ((i + 1) % 8 == 0 && (i != 0 && (i + 1) != cell.bits.length)) {
            s = `${s}_`
        }
    }

    return s;
}
